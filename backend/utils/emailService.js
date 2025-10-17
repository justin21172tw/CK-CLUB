/**
 * Email 通知服務
 * 用於發送各種系統通知郵件
 */

import nodemailer from 'nodemailer'

// Email 配置（需要設置環境變數）
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}

// 系統發件人
const SYSTEM_EMAIL = process.env.SYSTEM_EMAIL || EMAIL_CONFIG.auth.user

// 創建郵件傳輸器
let transporter = null

/**
 * 初始化郵件服務
 */
export function initEmailService() {
  if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
    console.warn('⚠️  Email service not configured. Email notifications will be disabled.')
    return false
  }

  try {
    transporter = nodemailer.createTransport(EMAIL_CONFIG)
    console.log('✅ Email service initialized')
    return true
  } catch (error) {
    console.error('❌ Failed to initialize email service:', error.message)
    return false
  }
}

/**
 * 發送郵件的基礎方法
 */
async function sendEmail({ to, subject, html, text }) {
  if (!transporter) {
    console.warn('Email service not available, skipping email notification')
    return { success: false, message: 'Email service not configured' }
  }

  try {
    const info = await transporter.sendMail({
      from: `"建中社團系統" <${SYSTEM_EMAIL}>`,
      to,
      subject,
      text,
      html,
    })

    console.log('Email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 提交成功通知
 */
export async function sendSubmissionConfirmation(submissionData) {
  const { teacherName, club, lineId, submissionId } = submissionData

  const subject = '✅ 外聘指導教師資料提交成功'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">提交成功通知</h2>

      <p>親愛的 ${teacherName} 老師，您好：</p>

      <p>您的外聘指導教師資料已成功提交，詳細資訊如下：</p>

      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>社團名稱：</strong>${club}</p>
        <p><strong>指導老師：</strong>${teacherName}</p>
        <p><strong>Line ID：</strong>${lineId}</p>
        <p><strong>提交編號：</strong>${submissionId}</p>
      </div>

      <p>您的資料目前處於 <strong style="color: #ff9800;">待審核</strong> 狀態，我們會盡快進行審核。</p>

      <p>審核完成後，我們會再次通知您。</p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

      <p style="color: #666; font-size: 12px;">
        此為系統自動發送的郵件，請勿直接回覆。<br>
        如有任何問題，請聯絡社團活動組。
      </p>
    </div>
  `

  const text = `
提交成功通知

親愛的 ${teacherName} 老師，您好：

您的外聘指導教師資料已成功提交，詳細資訊如下：

社團名稱：${club}
指導老師：${teacherName}
Line ID：${lineId}
提交編號：${submissionId}

您的資料目前處於待審核狀態，我們會盡快進行審核。
審核完成後，我們會再次通知您。

---
此為系統自動發送的郵件，請勿直接回覆。
如有任何問題，請聯絡社團活動組。
  `

  // 使用 Line ID 作為聯絡方式（實際應該要有 email 欄位）
  // 這裡假設未來會添加 email 欄位
  return await sendEmail({
    to: lineId, // TODO: 改為實際的 email
    subject,
    html,
    text,
  })
}

/**
 * 審核通過通知
 */
export async function sendApprovalNotification(submissionData) {
  const { teacherName, club, lineId, reviewNote } = submissionData

  const subject = '✅ 您的資料審核已通過'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4caf50;">審核通過通知</h2>

      <p>親愛的 ${teacherName} 老師，您好：</p>

      <p>恭喜您！您提交的外聘指導教師資料已經審核通過。</p>

      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>社團名稱：</strong>${club}</p>
        <p><strong>指導老師：</strong>${teacherName}</p>
        ${reviewNote ? `<p><strong>審核備註：</strong>${reviewNote}</p>` : ''}
      </div>

      <p>感謝您的配合，期待您為學生們帶來精彩的社團活動！</p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

      <p style="color: #666; font-size: 12px;">
        此為系統自動發送的郵件，請勿直接回覆。<br>
        如有任何問題，請聯絡社團活動組。
      </p>
    </div>
  `

  const text = `
審核通過通知

親愛的 ${teacherName} 老師，您好：

恭喜您！您提交的外聘指導教師資料已經審核通過。

社團名稱：${club}
指導老師：${teacherName}
${reviewNote ? `審核備註：${reviewNote}` : ''}

感謝您的配合，期待您為學生們帶來精彩的社團活動！

---
此為系統自動發送的郵件，請勿直接回覆。
如有任何問題，請聯絡社團活動組。
  `

  return await sendEmail({
    to: lineId, // TODO: 改為實際的 email
    subject,
    html,
    text,
  })
}

/**
 * 審核拒絕通知
 */
export async function sendRejectionNotification(submissionData) {
  const { teacherName, club, lineId, reviewNote } = submissionData

  const subject = '❌ 您的資料需要修正'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f44336;">資料需要修正</h2>

      <p>親愛的 ${teacherName} 老師，您好：</p>

      <p>經審核後，您提交的資料需要進行修正。</p>

      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>社團名稱：</strong>${club}</p>
        <p><strong>指導老師：</strong>${teacherName}</p>
        ${reviewNote ? `<p><strong>修正原因：</strong>${reviewNote}</p>` : ''}
      </div>

      <p>請根據上述說明修正後，重新提交資料。</p>

      <p>如有任何疑問，歡迎與社團活動組聯繫。</p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

      <p style="color: #666; font-size: 12px;">
        此為系統自動發送的郵件，請勿直接回覆。<br>
        如有任何問題，請聯絡社團活動組。
      </p>
    </div>
  `

  const text = `
資料需要修正

親愛的 ${teacherName} 老師，您好：

經審核後，您提交的資料需要進行修正。

社團名稱：${club}
指導老師：${teacherName}
${reviewNote ? `修正原因：${reviewNote}` : ''}

請根據上述說明修正後，重新提交資料。

如有任何疑問，歡迎與社團活動組聯繫。

---
此為系統自動發送的郵件，請勿直接回覆。
如有任何問題，請聯絡社團活動組。
  `

  return await sendEmail({
    to: lineId, // TODO: 改為實際的 email
    subject,
    html,
    text,
  })
}

/**
 * 新訊息通知
 */
export async function sendNewMessageNotification(submissionData, message) {
  const { teacherName, club, lineId } = submissionData
  const { from, content } = message

  const subject = '💬 您有新的訊息'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1976d2;">新訊息通知</h2>

      <p>親愛的 ${teacherName} 老師，您好：</p>

      <p>您的提交資料收到新的訊息：</p>

      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>社團名稱：</strong>${club}</p>
        <p><strong>來自：</strong>${from === 'admin' ? '管理員' : '使用者'}</p>
        <p><strong>訊息內容：</strong></p>
        <div style="background-color: white; padding: 10px; border-left: 3px solid #1976d2;">
          ${content}
        </div>
      </div>

      <p>請登入系統查看完整訊息並回覆。</p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

      <p style="color: #666; font-size: 12px;">
        此為系統自動發送的郵件，請勿直接回覆。<br>
        如有任何問題，請聯絡社團活動組。
      </p>
    </div>
  `

  const text = `
新訊息通知

親愛的 ${teacherName} 老師，您好：

您的提交資料收到新的訊息：

社團名稱：${club}
來自：${from === 'admin' ? '管理員' : '使用者'}
訊息內容：${content}

請登入系統查看完整訊息並回覆。

---
此為系統自動發送的郵件，請勿直接回覆。
如有任何問題，請聯絡社團活動組。
  `

  return await sendEmail({
    to: lineId, // TODO: 改為實際的 email
    subject,
    html,
    text,
  })
}

export default {
  initEmailService,
  sendSubmissionConfirmation,
  sendApprovalNotification,
  sendRejectionNotification,
  sendNewMessageNotification,
}
