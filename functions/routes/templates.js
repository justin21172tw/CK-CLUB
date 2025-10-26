import { onRequest } from "firebase-functions/v2/https";
import { getStorage } from "firebase-admin/storage";
import {
  listFiles,
  getFolderIds,
  downloadFile as downloadFromDrive,
} from "../config/drive.js";

/**
 * 獲取範本列表
 * GET /api/templates
 */
export const list = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 從 Google Drive 獲取範本資料夾中的文件
    const folderIds = getFolderIds();
    const files = await listFiles(folderIds.templates);

    // 將 Drive 文件轉換為範本格式
    const templates = files.map((file, index) => ({
      id: file.id,
      name: file.name,
      filename: file.name,
      mimeType: file.mimeType,
      size: file.size,
      createdTime: file.createdTime,
      webViewLink: file.webViewLink,
      downloadUrl: `/api/templates/download/${file.id}`,
    }));

    return res.json({
      success: true,
      templates: templates,
      count: templates.length,
    });
  } catch (error) {
    console.error("Template list error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

/**
 * 下載範本
 * GET /api/templates/download/:id
 */
export const download = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 從 URL 中提取文件 ID
    const fileId = req.path.split("/").pop();

    if (!fileId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Missing file ID",
      });
    }

    // 從 Google Drive 下載文件
    const fileBuffer = await downloadFromDrive(fileId);

    // 獲取文件元數據以設置正確的 Content-Type
    const { getFileMetadata } = await import("../config/drive.js");
    const metadata = await getFileMetadata(fileId);

    res.setHeader(
      "Content-Type",
      metadata.mimeType || "application/octet-stream"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${metadata.name}"`
    );
    res.setHeader("Content-Length", fileBuffer.length);

    // 發送文件
    res.send(fileBuffer);
  } catch (error) {
    console.error("Template download error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

export default {
  list,
  download,
};
