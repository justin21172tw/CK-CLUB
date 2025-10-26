import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";

// 初始化 Firebase Admin
initializeApp();

const db = getFirestore();
const storage = getStorage();
const auth = getAuth();

// 導入路由
import authFunctions from "./routes/auth.js";
import submissionFunctions from "./routes/submissions.js";
import templateFunctions from "./routes/templates.js";

// ==================== 認證相關 ====================
export const authVerify = authFunctions.verify;
export const authGetMe = authFunctions.getMe;

// ==================== 提交相關 ====================
export const submissionCreate = submissionFunctions.create;
export const submissionList = submissionFunctions.list;
export const submissionGet = submissionFunctions.get;
export const submissionUpdate = submissionFunctions.update;
export const submissionDelete = submissionFunctions.del;
export const submissionDownloadFile = submissionFunctions.downloadFile;
export const submissionDownloadAll = submissionFunctions.downloadAll;
export const submissionAddMessage = submissionFunctions.addMessage;
export const submissionGetMessages = submissionFunctions.getMessages;

// ==================== 範本相關 ====================
export const templateList = templateFunctions.list;
export const templateDownload = templateFunctions.download;

// 健康檢查
export const health = onRequest({ cors: true }, async (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "CK-CLUB Cloud Functions",
  });
});
