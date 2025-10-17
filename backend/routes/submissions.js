import { getFirestore, admin } from '../config/firebase.js'
// import { verifyAuth, requireAdmin } from '../middleware/auth.js' // 暫時停用身分驗證
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  sendSubmissionConfirmation,
  sendApprovalNotification,
  sendRejectionNotification,
  sendNewMessageNotification,
} from '../utils/emailService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 上傳目錄路徑
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads')

// 確保上傳目錄存在
async function ensureUploadDir() {
  try {
    await fs.access(UPLOADS_DIR)
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true })
  }
}

export default async function submissionRoutes(fastify, _opts) {
  /**
   * 提交外聘指導教師資料 (公開 API，不需要登入)
   * POST /api/submissions
   */
  fastify.post('/', async (request, reply) => {
    try {
      await ensureUploadDir()

      // 使用 multipart 解析表單數據和檔案
      const parts = request.parts()
      const fields = {}
      const files = {}

      for await (const part of parts) {
        if (part.type === 'file') {
          // 處理檔案上傳
          const buffer = await part.toBuffer()
          const timestamp = Date.now()
          const filename = `${timestamp}_${part.filename}`
          const filepath = path.join(UPLOADS_DIR, filename)

          await fs.writeFile(filepath, buffer)

          files[part.fieldname] = {
            filename: part.filename,
            storedFilename: filename,
            mimetype: part.mimetype,
            size: buffer.length,
            uploadedAt: new Date().toISOString(),
          }
        } else {
          // 處理文字欄位，確保值不為 undefined
          const value = part.value || ''

          // 如果是 items 欄位，解析 JSON
          if (part.fieldname === 'items') {
            try {
              fields[part.fieldname] = JSON.parse(value)
            } catch {
              fields[part.fieldname] = value
            }
          } else {
            fields[part.fieldname] = value
          }
        }
      }

      // 建立提交記錄
      const submission = {
        ...fields,
        files,
        submittedBy: request.user?.uid || 'anonymous',
        submitterEmail: request.user?.email || fields.lineId || 'unknown',
        status: 'pending', // pending, approved, rejected
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // 生成唯一 ID
      const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // 暫時保存到文件系統（因為 Firestore 未配置）
      const submissionsDir = path.join(UPLOADS_DIR, 'submissions')
      try {
        await fs.access(submissionsDir)
      } catch {
        await fs.mkdir(submissionsDir, { recursive: true })
      }

      const submissionFile = path.join(submissionsDir, `${submissionId}.json`)
      await fs.writeFile(submissionFile, JSON.stringify(submission, null, 2))

      fastify.log.info(`Submission saved to file: ${submissionId}`)

      // 嘗試保存到 Firestore (如果可用)
      try {
        const db = getFirestore()
        const docRef = await db.collection('submissions').add(submission)
        fastify.log.info(`Submission saved to Firestore: ${docRef.id}`)
      } catch (firestoreError) {
        fastify.log.warn(`Firestore save failed (using file fallback): ${firestoreError.message}`)
      }

      // 發送確認郵件（非阻塞）
      sendSubmissionConfirmation({
        ...submission,
        submissionId,
      }).catch((err) => {
        fastify.log.warn('Failed to send confirmation email:', err.message)
      })

      return reply.status(201).send({
        success: true,
        submissionId,
        data: submission,
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error.message,
      })
    }
  })

  /**
   * 獲取所有提交記錄 (管理員) - 暫時移除身分限制
   * GET /api/submissions
   */
  fastify.get('/', async (request, reply) => {
    try {
      const { status, club, limit = 50 } = request.query
      let submissions = []

      // 先嘗試從 Firestore 讀取
      try {
        const db = getFirestore()
        let query = db.collection('submissions').orderBy('createdAt', 'desc')

        if (status) {
          query = query.where('status', '==', status)
        }

        if (club) {
          query = query.where('club', '==', club)
        }

        query = query.limit(parseInt(limit))

        const snapshot = await query.get()

        snapshot.forEach((doc) => {
          submissions.push({
            id: doc.id,
            ...doc.data(),
          })
        })

        fastify.log.info(`Loaded ${submissions.length} submissions from Firestore`)
      } catch (firestoreError) {
        fastify.log.warn(`Firestore read failed, trying file system: ${firestoreError.message}`)

        // Fallback: 從檔案系統讀取
        const submissionsDir = path.join(UPLOADS_DIR, 'submissions')
        try {
          const files = await fs.readdir(submissionsDir)

          for (const file of files) {
            if (file.endsWith('.json')) {
              const filePath = path.join(submissionsDir, file)
              const content = await fs.readFile(filePath, 'utf-8')
              const data = JSON.parse(content)

              // 套用篩選條件
              if (status && data.status !== status) continue
              if (club && data.club !== club) continue

              submissions.push({
                id: file.replace('.json', ''),
                ...data,
              })
            }
          }

          // 按建立時間排序
          submissions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

          // 限制數量
          submissions = submissions.slice(0, parseInt(limit))

          fastify.log.info(`Loaded ${submissions.length} submissions from file system`)
        } catch (fsError) {
          fastify.log.error('Failed to read from file system:', fsError)
          throw fsError
        }
      }

      return reply.send({
        success: true,
        count: submissions.length,
        data: submissions,
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error.message,
      })
    }
  })

  /**
   * 獲取單筆提交記錄 - 暫時移除身分限制
   * GET /api/submissions/:id
   */
  fastify.get('/:id', async (request, reply) => {
    try {
      const db = getFirestore()
      const { id } = request.params

      const doc = await db.collection('submissions').doc(id).get()

      if (!doc.exists) {
        return reply.status(404).send({
          error: 'Not Found',
          message: '找不到該提交記錄',
        })
      }

      const data = doc.data()

      // 身分限制已暫時移除
      // if (data.submittedBy !== request.user.uid && request.user.role !== 'admin') {
      //   return reply.status(403).send({
      //     error: 'Forbidden',
      //     message: '權限不足',
      //   })
      // }

      return reply.send({
        success: true,
        data: {
          id: doc.id,
          ...data,
        },
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error.message,
      })
    }
  })

  /**
   * 更新提交狀態 (審核功能) - 暫時移除身分限制
   * PATCH /api/submissions/:id
   */
  fastify.patch('/:id', async (request, reply) => {
    try {
      const db = getFirestore()
      const { id } = request.params
      const { status, reviewNote } = request.body

      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: '無效的狀態值',
        })
      }

      const doc = await db.collection('submissions').doc(id).get()
      if (!doc.exists) {
        return reply.status(404).send({
          error: 'Not Found',
          message: '找不到該提交記錄',
        })
      }

      await db
        .collection('submissions')
        .doc(id)
        .update({
          status,
          reviewNote: reviewNote || '',
          reviewedBy: request.user.uid,
          reviewedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })

      // 發送審核結果通知（非阻塞）
      const submissionData = doc.data()
      if (status === 'approved') {
        sendApprovalNotification({
          ...submissionData,
          reviewNote,
        }).catch((err) => {
          fastify.log.warn('Failed to send approval email:', err.message)
        })
      } else if (status === 'rejected') {
        sendRejectionNotification({
          ...submissionData,
          reviewNote,
        }).catch((err) => {
          fastify.log.warn('Failed to send rejection email:', err.message)
        })
      }

      return reply.send({
        success: true,
        message: '狀態更新成功',
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error.message,
      })
    }
  })

  /**
   * 刪除提交記錄 - 暫時移除身分限制
   * DELETE /api/submissions/:id
   */
  fastify.delete('/:id', async (request, reply) => {
    try {
      const db = getFirestore()
      const { id } = request.params

      // 獲取提交記錄以刪除關聯的檔案
      const doc = await db.collection('submissions').doc(id).get()
      if (doc.exists) {
        const data = doc.data()

        // 刪除相關檔案
        if (data.files) {
          for (const file of Object.values(data.files)) {
            try {
              const filepath = path.join(UPLOADS_DIR, file.storedFilename)
              await fs.unlink(filepath)
            } catch {
              fastify.log.warn(`Failed to delete file: ${file.storedFilename}`)
            }
          }
        }
      }

      await db.collection('submissions').doc(id).delete()

      return reply.send({
        success: true,
        message: '刪除成功',
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error.message,
      })
    }
  })

  /**
   * 下載提交的檔案 - 暫時移除身分限制
   * GET /api/submissions/:id/files/:filename
   */
  fastify.get('/:id/files/:filename', async (request, reply) => {
    try {
      const db = getFirestore()
      const { id, filename } = request.params

      const doc = await db.collection('submissions').doc(id).get()

      if (!doc.exists) {
        return reply.status(404).send({
          error: 'Not Found',
          message: '找不到該提交記錄',
        })
      }

      const data = doc.data()

      // 身分限制已暫時移除
      // if (data.submittedBy !== request.user.uid && request.user.role !== 'admin') {
      //   return reply.status(403).send({
      //     error: 'Forbidden',
      //     message: '權限不足',
      //   })
      // }

      // 查找檔案
      const fileInfo = Object.values(data.files || {}).find((f) => f.storedFilename === filename)

      if (!fileInfo) {
        return reply.status(404).send({
          error: 'Not Found',
          message: '找不到該檔案',
        })
      }

      // 發送檔案
      const filepath = path.join(UPLOADS_DIR, filename)

      // 檢查檔案是否存在
      try {
        await fs.access(filepath)
      } catch {
        return reply.status(404).send({
          error: 'Not Found',
          message: '檔案不存在於伺服器上',
        })
      }

      return reply
        .type(fileInfo.mimetype)
        .header(
          'Content-Disposition',
          `attachment; filename="${encodeURIComponent(fileInfo.filename)}"`,
        )
        .send(await fs.readFile(filepath))
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error.message,
      })
    }
  })

  /**
   * 批量下載提交的所有檔案（ZIP 格式）- 暫時移除身分限制
   * GET /api/submissions/:id/download-all
   */
  fastify.get('/:id/download-all', async (request, reply) => {
    try {
      const db = getFirestore()
      const { id } = request.params

      const doc = await db.collection('submissions').doc(id).get()

      if (!doc.exists) {
        return reply.status(404).send({
          error: 'Not Found',
          message: '找不到該提交記錄',
        })
      }

      const data = doc.data()

      // 身分限制已暫時移除
      // if (data.submittedBy !== request.user.uid && request.user.role !== 'admin') {
      //   return reply.status(403).send({
      //     error: 'Forbidden',
      //     message: '權限不足',
      //   })
      // }

      // 使用動態導入 archiver
      const archiver = await import('archiver').then((m) => m.default)
      const archive = archiver('zip', { zlib: { level: 9 } })

      // 設置響應頭
      const zipFilename = `${data.club}_${data.teacherName}_${id}.zip`
      reply.raw.setHeader('Content-Type', 'application/zip')
      reply.raw.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(zipFilename)}"`,
      )

      // 將檔案添加到 zip
      for (const fileInfo of Object.values(data.files || {})) {
        const filepath = path.join(UPLOADS_DIR, fileInfo.storedFilename)
        try {
          await fs.access(filepath)
          archive.file(filepath, { name: fileInfo.filename })
        } catch {
          fastify.log.warn(`File not found: ${filepath}`)
        }
      }

      // 完成並發送
      archive.pipe(reply.raw)
      await archive.finalize()
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error.message,
      })
    }
  })

  /**
   * 新增或更新訊息（管理員回覆）- 暫時移除身分限制
   * POST /api/submissions/:id/messages
   */
  fastify.post('/:id/messages', async (request, reply) => {
    try {
      const db = getFirestore()
      const { id } = request.params
      const { content } = request.body

      if (!content || content.trim() === '') {
        return reply.status(400).send({
          error: 'Bad Request',
          message: '訊息內容不能為空',
        })
      }

      const doc = await db.collection('submissions').doc(id).get()

      if (!doc.exists) {
        return reply.status(404).send({
          error: 'Not Found',
          message: '找不到該提交記錄',
        })
      }

      const message = {
        from: 'admin', // 暫時固定為 admin
        fromEmail: 'dev@localhost', // 暫時使用假資料
        content: content.trim(),
        timestamp: new Date().toISOString(),
      }

      // 更新 messages 陣列
      await db
        .collection('submissions')
        .doc(id)
        .update({
          messages: admin.firestore.FieldValue.arrayUnion(message),
          updatedAt: new Date().toISOString(),
        })

      // 發送新訊息通知（非阻塞）
      const submissionData = doc.data()
      sendNewMessageNotification(submissionData, message).catch((err) => {
        fastify.log.warn('Failed to send message notification email:', err.message)
      })

      return reply.send({
        success: true,
        message: '訊息已送出',
        data: message,
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error.message,
      })
    }
  })

  /**
   * 獲取訊息列表 - 暫時移除身分限制
   * GET /api/submissions/:id/messages
   */
  fastify.get('/:id/messages', async (request, reply) => {
    try {
      const db = getFirestore()
      const { id } = request.params

      const doc = await db.collection('submissions').doc(id).get()

      if (!doc.exists) {
        return reply.status(404).send({
          error: 'Not Found',
          message: '找不到該提交記錄',
        })
      }

      const data = doc.data()

      // 身分限制已暫時移除
      // if (data.submittedBy !== request.user.uid && request.user.role !== 'admin') {
      //   return reply.status(403).send({
      //     error: 'Forbidden',
      //     message: '權限不足',
      //   })
      // }

      return reply.send({
        success: true,
        data: data.messages || [],
      })
    } catch (error) {
      fastify.log.error(error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: error.message,
      })
    }
  })
}
