import { google } from "googleapis";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Readable } from "stream";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let drive = null;

/**
 * 初始化 Google Drive API
 */
export function initializeDrive() {
  try {
    // 讀取服務帳號金鑰
    const keyPath = join(__dirname, "../drive-service-account.json");
    const serviceAccountKey = JSON.parse(readFileSync(keyPath, "utf8"));

    // 創建 JWT 客戶端
    const auth = new google.auth.JWT(
      serviceAccountKey.client_email,
      null,
      serviceAccountKey.private_key,
      ["https://www.googleapis.com/auth/drive"]
    );

    // 初始化 Drive API
    drive = google.drive({ version: "v3", auth });

    console.log("✅ Google Drive API initialized successfully");
    return drive;
  } catch (error) {
    console.error("❌ Google Drive API initialization failed:", error.message);
    throw error;
  }
}

/**
 * 上傳檔案到 Google Drive
 * @param {Buffer} fileBuffer - 檔案內容
 * @param {string} filename - 檔案名稱
 * @param {string} mimeType - MIME 類型
 * @param {string} folderId - 目標資料夾 ID
 * @returns {Promise<Object>} - 包含 fileId 和 webViewLink
 */
export async function uploadFile(fileBuffer, filename, mimeType, folderId) {
  if (!drive) {
    drive = initializeDrive();
  }

  const fileMetadata = {
    name: filename,
    parents: [folderId],
  };

  const media = {
    mimeType,
    body: Readable.from(fileBuffer),
  };

  const response = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: "id, name, webViewLink, webContentLink",
  });

  // 設定檔案為任何人可讀（使用連結的人）
  await drive.permissions.create({
    fileId: response.data.id,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  return {
    fileId: response.data.id,
    filename: response.data.name,
    webViewLink: response.data.webViewLink,
    webContentLink: response.data.webContentLink,
  };
}

/**
 * 下載檔案從 Google Drive
 * @param {string} fileId - 檔案 ID
 * @returns {Promise<Buffer>} - 檔案內容
 */
/**
 * 下載檔案從 Google Drive
 * @param {string} fileId - 檔案 ID
 * @returns {Promise<Buffer>} - 檔案內容
 */
export async function downloadFile(fileId) {
  if (!drive) {
    drive = initializeDrive();
  }

  try {
    // 獲取文件元數據以判斷檔案類型
    const metadata = await drive.files.get({
      fileId,
      fields: "mimeType, name, shortcutDetails",
    });

    const mimeType = metadata.data.mimeType;

    // 處理 Google Drive 快捷方式
    if (mimeType === "application/vnd.google-apps.shortcut") {
      const shortcutDetails = metadata.data.shortcutDetails;
      if (shortcutDetails && shortcutDetails.targetId) {
        // 遞迴呼叫下載目標檔案
        return await downloadFile(shortcutDetails.targetId);
      } else {
        throw new Error("Shortcut target not found");
      }
    }

    // Google Docs 檔案需要使用 export API
    const isGoogleDoc =
      mimeType === "application/vnd.google-apps.document" ||
      mimeType === "application/vnd.google-apps.spreadsheet" ||
      mimeType === "application/vnd.google-apps.presentation";

    if (isGoogleDoc) {
      // 根據類型選擇匯出格式
      let exportMimeType;
      if (mimeType === "application/vnd.google-apps.document") {
        // 匯出為 Word 格式以保留原始格式
        exportMimeType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      } else if (mimeType === "application/vnd.google-apps.spreadsheet") {
        exportMimeType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      } else if (mimeType === "application/vnd.google-apps.presentation") {
        exportMimeType =
          "application/vnd.openxmlformats-officedocument.presentationml.presentation";
      }

      const response = await drive.files.export(
        {
          fileId,
          mimeType: exportMimeType,
        },
        { responseType: "arraybuffer" }
      );

      return Buffer.from(response.data);
    } else {
      // 一般檔案（PDF 等）直接下載
      const response = await drive.files.get(
        {
          fileId,
          alt: "media",
        },
        { responseType: "arraybuffer" }
      );

      return Buffer.from(response.data);
    }
  } catch (error) {
    console.error("[downloadFile] Error:", error.message);
    throw error;
  }
}

/**
 * 取得檔案資訊
 * @param {string} fileId - 檔案 ID
 * @returns {Promise<Object>} - 檔案資訊
 */
export async function getFileMetadata(fileId) {
  if (!drive) {
    drive = initializeDrive();
  }

  const response = await drive.files.get({
    fileId,
    fields:
      "id, name, mimeType, size, webViewLink, webContentLink, shortcutDetails",
  });

  const metadata = response.data;

  // 處理快捷方式，取得目標檔案的 metadata
  if (metadata.mimeType === "application/vnd.google-apps.shortcut") {
    const shortcutDetails = metadata.shortcutDetails;
    if (shortcutDetails && shortcutDetails.targetId) {
      // 遞迴獲取目標檔案的 metadata
      return await getFileMetadata(shortcutDetails.targetId);
    }
  }

  // 如果是 Google Docs 檔案，調整檔名和 mimeType 以反映匯出格式
  if (metadata.mimeType === "application/vnd.google-apps.document") {
    metadata.name = metadata.name.replace(/\.(doc|docx)?$/i, "") + ".docx";
    metadata.exportMimeType =
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    // 更新為匯出後的 mimeType，以便前端正確處理
    metadata.mimeType = metadata.exportMimeType;
  } else if (metadata.mimeType === "application/vnd.google-apps.spreadsheet") {
    metadata.name = metadata.name.replace(/\.(xls|xlsx)?$/i, "") + ".xlsx";
    metadata.exportMimeType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    metadata.mimeType = metadata.exportMimeType;
  } else if (metadata.mimeType === "application/vnd.google-apps.presentation") {
    metadata.name = metadata.name.replace(/\.(ppt|pptx)?$/i, "") + ".pptx";
    metadata.exportMimeType =
      "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    metadata.mimeType = metadata.exportMimeType;
  }

  return metadata;
}

/**
 * 刪除檔案
 * @param {string} fileId - 檔案 ID
 */
export async function deleteFile(fileId) {
  if (!drive) {
    drive = initializeDrive();
  }

  await drive.files.delete({ fileId });
}

/**
 * 列出資料夾中的檔案
 * @param {string} folderId - 資料夾 ID
 * @returns {Promise<Array>} - 檔案列表
 */
export async function listFiles(folderId) {
  if (!drive) {
    drive = initializeDrive();
  }

  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id, name, mimeType, size, createdTime, webViewLink)",
    orderBy: "createdTime desc",
  });

  return response.data.files;
}

/**
 * 取得環境變數中的資料夾 ID
 */
export function getFolderIds() {
  return {
    templates: process.env.DRIVE_FOLDER_ID_TEMPLATES,
    submissions: process.env.DRIVE_FOLDER_ID_SUBMISSIONS,
  };
}

export default {
  initializeDrive,
  uploadFile,
  downloadFile,
  getFileMetadata,
  deleteFile,
  listFiles,
  getFolderIds,
};
