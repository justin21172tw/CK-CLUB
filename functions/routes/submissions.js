import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import Busboy from "busboy";
import archiver from "archiver";
import {
  uploadFile,
  deleteFile,
  getFileMetadata,
  getFolderIds,
} from "../config/drive.js";

/**
 * 驗證 Token (輔助函數)
 */
async function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  try {
    const auth = getAuth();
    const token = authHeader.split("Bearer ")[1];
    const decoded = await auth.verifyIdToken(token);
    return decoded;
  } catch {
    return null;
  }
}

/**
 * 創建提交 (公開 API)
 * POST /api/submissions
 */
export const create = onRequest(
  {
    cors: true,
    maxInstances: 10,
  },
  async (req, res) => {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    try {
      const db = getFirestore();
      const busboy = Busboy({ headers: req.headers });
      const fields = {};
      const filePromises = [];

      busboy.on("field", (fieldname, value) => {
        if (fieldname === "items") {
          try {
            fields[fieldname] = JSON.parse(value);
          } catch {
            fields[fieldname] = value;
          }
        } else {
          fields[fieldname] = value || "";
        }
      });

      busboy.on("file", (fieldname, file, info) => {
        const { filename, mimeType } = info;
        const chunks = [];

        file.on("data", (chunk) => {
          chunks.push(chunk);
        });

        const promise = new Promise(async (resolve, reject) => {
          file.on("end", async () => {
            try {
              const fileBuffer = Buffer.concat(chunks);
              const timestamp = Date.now();
              const storedFilename = `${timestamp}_${filename}`;

              // 取得 Google Drive 資料夾 ID
              const folderIds = getFolderIds();

              // 上傳到 Google Drive
              const driveFile = await uploadFile(
                fileBuffer,
                storedFilename,
                mimeType,
                folderIds.submissions
              );

              resolve({
                fieldname,
                filename,
                storedFilename,
                mimeType,
                size: fileBuffer.length,
                driveFileId: driveFile.fileId,
                webViewLink: driveFile.webViewLink,
                webContentLink: driveFile.webContentLink,
                uploadedAt: new Date().toISOString(),
              });
            } catch (error) {
              reject(error);
            }
          });

          file.on("error", reject);
        });

        filePromises.push(promise);
      });

      busboy.on("finish", async () => {
        try {
          // 等待所有檔案上傳完成
          const uploadedFiles = await Promise.all(filePromises);

          // 整理檔案資訊
          const files = {};
          uploadedFiles.forEach((file) => {
            files[file.fieldname] = file;
          });

          // 建立提交記錄
          const submission = {
            ...fields,
            files,
            submittedBy: "anonymous",
            submitterEmail: fields.lineId || "unknown",
            status: "pending",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // 儲存到 Firestore
          const docRef = await db.collection("submissions").add(submission);

          console.log(`Submission created: ${docRef.id}`);

          return res.status(201).json({
            success: true,
            submissionId: docRef.id,
            data: submission,
          });
        } catch (error) {
          console.error("Submission creation error:", error);
          return res.status(500).json({
            error: "Internal Server Error",
            message: error.message,
          });
        }
      });

      busboy.end(req.rawBody);
    } catch (error) {
      console.error("Create submission error:", error);
      return res.status(500).json({
        error: "Internal Server Error",
        message: error.message,
      });
    }
  }
);

/**
 * 獲取提交列表
 * GET /api/submissions
 */
export const list = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = getFirestore();
    const { status, club, limit = "50" } = req.query;

    let query = db.collection("submissions").orderBy("createdAt", "desc");

    if (status) {
      query = query.where("status", "==", status);
    }
    if (club) {
      query = query.where("club", "==", club);
    }

    query = query.limit(parseInt(limit));

    const snapshot = await query.get();
    const submissions = [];

    snapshot.forEach((doc) => {
      submissions.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return res.json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error("List submissions error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

/**
 * 獲取單筆提交
 * GET /api/submissions/:id
 */
export const get = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = getFirestore();
    const id = req.path.split("/").pop();
    const doc = await db.collection("submissions").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        error: "Not Found",
        message: "找不到該提交記錄",
      });
    }

    return res.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error) {
    console.error("Get submission error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

/**
 * 更新提交狀態
 * PATCH /api/submissions/:id
 */
export const update = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = getFirestore();
    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const id = req.path.split("/").pop();
    const { status, reviewNote } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "無效的狀態值",
      });
    }

    await db
      .collection("submissions")
      .doc(id)
      .update({
        status,
        reviewNote: reviewNote || "",
        reviewedBy: user.uid,
        reviewedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

    return res.json({
      success: true,
      message: "狀態更新成功",
    });
  } catch (error) {
    console.error("Update submission error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

/**
 * 刪除提交
 * DELETE /api/submissions/:id
 */
export const del = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = getFirestore();
    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const id = req.path.split("/").pop();
    const doc = await db.collection("submissions").doc(id).get();

    if (doc.exists) {
      const data = doc.data();

      // 刪除 Storage 中的檔案
      if (data.files) {
        const storage = getStorage();
        const bucket = storage.bucket();
        const deletePromises = Object.values(data.files).map((file) =>
          bucket
            .file(file.storedFilename)
            .delete()
            .catch((err) =>
              console.warn(`Failed to delete file: ${file.storedFilename}`, err)
            )
        );
        await Promise.all(deletePromises);
      }
    }

    await db.collection("submissions").doc(id).delete();

    return res.json({
      success: true,
      message: "刪除成功",
    });
  } catch (error) {
    console.error("Delete submission error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

/**
 * 下載單個檔案
 * GET /api/submissions/:id/files/:filename
 */
export const downloadFile = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = getFirestore();
    const pathParts = req.path.split("/");
    const id = pathParts[pathParts.length - 3];
    const filename = pathParts[pathParts.length - 1];

    const doc = await db.collection("submissions").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Submission not found" });
    }

    const data = doc.data();
    const fileInfo = Object.values(data.files || {}).find((f) =>
      f.storedFilename.includes(filename)
    );

    if (!fileInfo) {
      return res.status(404).json({ error: "File not found" });
    }

    const storage = getStorage();
    const bucket = storage.bucket();
    const file = bucket.file(fileInfo.storedFilename);

    res.setHeader("Content-Type", fileInfo.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileInfo.filename}"`
    );

    file.createReadStream().pipe(res);
  } catch (error) {
    console.error("Download file error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

/**
 * 下載所有檔案 (ZIP)
 * GET /api/submissions/:id/download-all
 */
export const downloadAll = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = getFirestore();
    const id = req.path.split("/")[req.path.split("/").length - 2];

    const doc = await db.collection("submissions").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Submission not found" });
    }

    const data = doc.data();
    const archive = archiver("zip", { zlib: { level: 9 } });

    const zipFilename = `${data.club}_${data.teacherName}_${id}.zip`;
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${zipFilename}"`
    );

    archive.pipe(res);

    const storage = getStorage();
    const bucket = storage.bucket();

    for (const fileInfo of Object.values(data.files || {})) {
      const file = bucket.file(fileInfo.storedFilename);
      const stream = file.createReadStream();
      archive.append(stream, { name: fileInfo.filename });
    }

    await archive.finalize();
  } catch (error) {
    console.error("Download all error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

/**
 * 新增訊息
 * POST /api/submissions/:id/messages
 */
export const addMessage = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = getFirestore();
    const user = await verifyToken(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const id = req.path.split("/")[req.path.split("/").length - 2];
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "訊息內容不能為空" });
    }

    const message = {
      from: "admin",
      fromEmail: user.email,
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    await db
      .collection("submissions")
      .doc(id)
      .update({
        messages: db.FieldValue.arrayUnion(message),
        updatedAt: new Date().toISOString(),
      });

    return res.json({
      success: true,
      message: "訊息已送出",
      data: message,
    });
  } catch (error) {
    console.error("Add message error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

/**
 * 獲取訊息列表
 * GET /api/submissions/:id/messages
 */
export const getMessages = onRequest({ cors: true }, async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = getFirestore();
    const id = req.path.split("/")[req.path.split("/").length - 2];
    const doc = await db.collection("submissions").doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Not found" });
    }

    const data = doc.data();

    return res.json({
      success: true,
      data: data.messages || [],
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

export default {
  create,
  list,
  get,
  update,
  del,
  downloadFile,
  downloadAll,
  addMessage,
  getMessages,
};
