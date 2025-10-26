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
export async function downloadFile(fileId) {
  if (!drive) {
    drive = initializeDrive();
  }

  const response = await drive.files.get(
    {
      fileId,
      alt: "media",
    },
    { responseType: "arraybuffer" }
  );

  return Buffer.from(response.data);
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
    fields: "id, name, mimeType, size, webViewLink, webContentLink",
  });

  return response.data;
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
