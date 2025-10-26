import { onRequest, onCall } from "firebase-functions/v2/https";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

/**
 * 檢查教育網域
 */
function checkEducationDomain(email) {
  if (!email) return false;

  const allowedDomains = ["gl.ck.tp.edu.tw", "ck.tp.edu.tw", "tp.edu.tw"];

  return allowedDomains.some((domain) => email.endsWith(`@${domain}`));
}

/**
 * 驗證 ID Token 並返回用戶資訊
 * POST /api/auth/verify
 */
export const verify = onRequest({ cors: true }, async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        error: "Bad Request",
        message: "缺少 idToken",
      });
    }

    // 獲取服務實例
    const auth = getAuth();
    const db = getFirestore();

    // 驗證 token
    const decodedToken = await auth.verifyIdToken(idToken);
    const { uid, email } = decodedToken;

    // 檢查教育網域
    if (!checkEducationDomain(email)) {
      return res.status(403).json({
        error: "Forbidden",
        message: "僅限建國中學教育帳號登入",
      });
    }

    // 判斷角色
    let role = "teacher";
    if (email.includes("admin") || email.includes("affair")) {
      role = "admin";
    }

    // 儲存用戶資料
    await db.collection("users").doc(uid).set(
      {
        uid,
        email,
        role,
        lastLogin: new Date().toISOString(),
      },
      { merge: true }
    );

    // 設置 custom claims
    await auth.setCustomUserClaims(uid, { role });

    return res.json({
      success: true,
      user: { uid, email, role },
    });
  } catch (error) {
    console.error("Auth verify error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

/**
 * 獲取當前用戶資訊
 * GET /api/auth/me
 */
export const getMe = onRequest({ cors: true }, async (req, res) => {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "未提供身份驗證令牌",
      });
    }

    // 獲取服務實例
    const auth = getAuth();
    const db = getFirestore();

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await auth.verifyIdToken(idToken);

    // 從 Firestore 獲取用戶資料
    const userDoc = await db.collection("users").doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        error: "Not Found",
        message: "用戶不存在",
      });
    }

    return res.json({
      success: true,
      user: userDoc.data(),
    });
  } catch (error) {
    console.error("Auth getMe error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

export default {
  verify,
  getMe,
};
