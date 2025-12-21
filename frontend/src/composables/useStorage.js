import { ref } from 'vue'
import { supabase } from 'boot/supabase'
import { useAuth } from './useAuth'

/**
 * Storage 儲存相關的 composable
 * 處理文件上傳/下載/刪除功能
 */
export function useStorage() {
  const { currentUser } = useAuth()
  const uploading = ref(false)
  const uploadProgress = ref(0)
  const error = ref(null)

  const BUCKET_NAME = 'activity-documents'

  /**
   * 生成文件路徑
   * 格式: {user_id}/{activity_id}/{document_code}_{filename}
   */
  const generateFilePath = (activityId, documentCode, filename) => {
    if (!currentUser.value) {
      throw new Error('User not authenticated')
    }
    const userId = currentUser.value.id
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    return `${userId}/${activityId}/${documentCode}_${sanitizedFilename}`
  }

  /**
   * 上傳文件
   * @param {File} file - 要上傳的文件
   * @param {string} activityId - 活動 ID
   * @param {string} documentCode - 文件代碼 (A, B, C, etc.)
   * @returns {Promise<{path: string, url: string}>}
   */
  const uploadFile = async (file, activityId, documentCode) => {
    if (!file) {
      throw new Error('No file provided')
    }

    if (!currentUser.value) {
      throw new Error('User not authenticated')
    }

    try {
      uploading.value = true
      uploadProgress.value = 0
      error.value = null

      const filePath = generateFilePath(activityId, documentCode, file.name)

      // 上傳文件
      const { data, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // 如果文件已存在則覆蓋
        })

      if (uploadError) throw uploadError

      uploadProgress.value = 100

      // 獲取公開 URL（即使是私有 bucket，這個 URL 仍需要通過 RLS 驗證）
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath)

      return {
        path: data.path,
        url: urlData.publicUrl,
      }
    } catch (err) {
      console.error('Upload error:', err)
      error.value = err.message
      throw err
    } finally {
      uploading.value = false
    }
  }

  /**
   * 批量上傳文件
   * @param {Array<{file: File, documentCode: string}>} files
   * @param {string} activityId
   */
  const uploadMultipleFiles = async (files, activityId) => {
    const results = []
    const errors = []

    for (const { file, documentCode } of files) {
      try {
        const result = await uploadFile(file, activityId, documentCode)
        results.push({ documentCode, ...result })
      } catch (err) {
        errors.push({ documentCode, error: err.message })
      }
    }

    return { results, errors }
  }

  /**
   * 下載文件
   * @param {string} filePath - 文件路徑
   */
  const downloadFile = async (filePath) => {
    try {
      const { data, error: downloadError } = await supabase.storage
        .from(BUCKET_NAME)
        .download(filePath)

      if (downloadError) throw downloadError

      return data
    } catch (err) {
      console.error('Download error:', err)
      error.value = err.message
      throw err
    }
  }

  /**
   * 獲取文件的簽名 URL（用於下載）
   * @param {string} filePath
   * @param {number} expiresIn - 過期時間（秒），默認 3600 (1小時)
   */
  const getSignedUrl = async (filePath, expiresIn = 3600) => {
    try {
      const { data, error: urlError } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, expiresIn)

      if (urlError) throw urlError

      return data.signedUrl
    } catch (err) {
      console.error('Get signed URL error:', err)
      error.value = err.message
      throw err
    }
  }

  /**
   * 刪除文件
   * @param {string} filePath
   */
  const deleteFile = async (filePath) => {
    try {
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath])

      if (deleteError) throw deleteError

      return true
    } catch (err) {
      console.error('Delete error:', err)
      error.value = err.message
      throw err
    }
  }

  /**
   * 列出活動的所有文件
   * @param {string} activityId
   */
  const listActivityFiles = async (activityId) => {
    if (!currentUser.value) {
      throw new Error('User not authenticated')
    }

    try {
      const userId = currentUser.value.id
      const folderPath = `${userId}/${activityId}`

      const { data, error: listError } = await supabase.storage
        .from(BUCKET_NAME)
        .list(folderPath)

      if (listError) throw listError

      return data || []
    } catch (err) {
      console.error('List files error:', err)
      error.value = err.message
      throw err
    }
  }

  /**
   * 驗證文件類型
   * @param {File} file
   * @param {Array<string>} allowedTypes
   */
  const validateFileType = (file, allowedTypes = ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']) => {
    const fileType = file.type
    return allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const category = type.split('/')[0]
        return fileType.startsWith(category + '/')
      }
      return fileType === type
    })
  }

  /**
   * 驗證文件大小
   * @param {File} file
   * @param {number} maxSize - 最大大小（bytes），默認 50MB
   */
  const validateFileSize = (file, maxSize = 50 * 1024 * 1024) => {
    return file.size <= maxSize
  }

  return {
    uploading,
    uploadProgress,
    error,
    uploadFile,
    uploadMultipleFiles,
    downloadFile,
    getSignedUrl,
    deleteFile,
    listActivityFiles,
    validateFileType,
    validateFileSize,
  }
}
