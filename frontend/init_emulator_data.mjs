/**
 * Firestore Emulator 測試資料初始化腳本
 *
 * 用途: 在本地 Emulator 中建立測試資料
 * 執行: node init_emulator_data.js
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  setDoc,
  Timestamp,
} from "firebase/firestore";

// Emulator 不需要真實的 API Key
const firebaseConfig = {
  apiKey: "fake-api-key",
  authDomain: "fake-auth-domain",
  projectId: "demo-project", // 使用 demo-project
  storageBucket: "fake-storage-bucket",
  messagingSenderId: "fake-sender-id",
  appId: "fake-app-id",
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 連接到 Emulator (預設端口 8080)
connectFirestoreEmulator(db, "127.0.0.1", 8080);

console.log("🔌 已連接到 Firestore Emulator (localhost:8080)");

// ===== 測試資料 (與 init_activity_data.js 相同) =====

// 1. 活動範本
const activityTemplates = [
  {
    id: "internal_no_proposal",
    data: {
      templateId: "internal_no_proposal",
      templateName: "校內活動(不需企劃書)",
      activityType: "校內活動",
      options: {
        hasAccommodation: false,
        hasBus: false,
        requiresProposal: false,
      },
      requiredDocuments: [
        {
          type: "consent",
          name: "家長同意書",
          description: "每位參與學生一份",
          required: true,
          multiple: true,
        },
      ],
      approvalFlow: {
        levels: ["staff", "leader", "director"],
        allowSkipLevel: true,
      },
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  },
  {
    id: "internal_with_proposal",
    data: {
      templateId: "internal_with_proposal",
      templateName: "校內活動(需企劃書)",
      activityType: "校內活動",
      options: {
        hasAccommodation: false,
        hasBus: false,
        requiresProposal: true,
      },
      requiredDocuments: [
        {
          type: "proposal",
          name: "活動企劃書",
          description: "詳細說明活動內容與目的",
          required: true,
          multiple: false,
        },
        {
          type: "consent",
          name: "家長同意書",
          description: "每位參與學生一份",
          required: true,
          multiple: true,
        },
      ],
      approvalFlow: {
        levels: ["staff", "leader", "director"],
        allowSkipLevel: true,
      },
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  },
  {
    id: "external_full",
    data: {
      templateId: "external_full",
      templateName: "校外活動(住宿+租車)",
      activityType: "校外活動",
      options: { hasAccommodation: true, hasBus: true, requiresProposal: true },
      requiredDocuments: [
        {
          type: "proposal",
          name: "活動企劃書",
          description: "詳細說明活動內容與目的",
          required: true,
          multiple: false,
        },
        {
          type: "consent",
          name: "家長同意書",
          description: "每位參與學生一份",
          required: true,
          multiple: true,
        },
        {
          type: "accommodation",
          name: "住宿資料",
          description: "住宿地點與安全說明",
          required: true,
          multiple: false,
        },
        {
          type: "bus",
          name: "租車資料",
          description: "車輛與司機資訊",
          required: true,
          multiple: false,
        },
      ],
      approvalFlow: {
        levels: ["staff", "leader", "director"],
        allowSkipLevel: true,
      },
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  },
  {
    id: "external_no_accommodation",
    data: {
      templateId: "external_no_accommodation",
      templateName: "校外活動(僅租車)",
      activityType: "校外活動",
      options: {
        hasAccommodation: false,
        hasBus: true,
        requiresProposal: true,
      },
      requiredDocuments: [
        {
          type: "proposal",
          name: "活動企劃書",
          description: "詳細說明活動內容與目的",
          required: true,
          multiple: false,
        },
        {
          type: "consent",
          name: "家長同意書",
          description: "每位參與學生一份",
          required: true,
          multiple: true,
        },
        {
          type: "bus",
          name: "租車資料",
          description: "車輛與司機資訊",
          required: true,
          multiple: false,
        },
      ],
      approvalFlow: {
        levels: ["staff", "leader", "director"],
        allowSkipLevel: true,
      },
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  },
];

// 2. 測試使用者
const testUsers = [
  {
    id: "test_student_001",
    data: {
      uid: "test_student_001",
      email: "student001@ck.tp.edu.tw",
      displayName: "測試學生001",
      roles: ["student"],
      club: "籃球社",
      clubPosition: "社員",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      preferences: { notifications: true, emailNotifications: false },
    },
  },
  {
    id: "test_staff_001",
    data: {
      uid: "test_staff_001",
      email: "staff001@ck.tp.edu.tw",
      displayName: "測試幹事001",
      roles: ["staff"],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      preferences: { notifications: true, emailNotifications: true },
    },
  },
  {
    id: "test_leader_001",
    data: {
      uid: "test_leader_001",
      email: "leader001@ck.tp.edu.tw",
      displayName: "測試組長001",
      roles: ["leader"],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      preferences: { notifications: true, emailNotifications: true },
    },
  },
  {
    id: "test_director_001",
    data: {
      uid: "test_director_001",
      email: "director001@ck.tp.edu.tw",
      displayName: "測試主任001",
      roles: ["director"],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      preferences: { notifications: true, emailNotifications: true },
    },
  },
  {
    id: "test_admin_001",
    data: {
      uid: "test_admin_001",
      email: "admin001@ck.tp.edu.tw",
      displayName: "測試管理員001",
      roles: ["admin"],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
      preferences: { notifications: true, emailNotifications: true },
    },
  },
];

// 3. 測試活動
const testActivities = [
  {
    id: "test_activity_001",
    data: {
      activityName: "籃球社期末聯誼賽",
      activityDate: Timestamp.fromDate(new Date("2024-06-15")),
      activityLocation: "建中體育館",
      participantCount: 30,
      activityType: "校內活動",
      hasAccommodation: false,
      hasBus: false,
      requiresProposal: false,
      club: "籃球社",
      clubLeader: "王小明",
      instructor: "李老師",
      activityPurpose: "促進社員交流,增進球技",
      activityContent: "舉辦社內籃球比賽,分組對抗",
      expectedOutcome: "提升團隊合作精神",
      hasBudget: false,
      budgetAmount: 0,
      budgetDescription: "",
      status: "draft",
      currentReviewer: null,
      reviewedBy: { staff: false, leader: false, director: false },
      skippedLevels: [],
      requiredDocuments: ["家長同意書"],
      uploadedDocuments: [],
      documentsComplete: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      submittedAt: null,
      submittedBy: "test_student_001",
      submitterEmail: "student001@ck.tp.edu.tw",
    },
  },
  {
    id: "test_activity_002",
    data: {
      activityName: "羽球社校外交流賽",
      activityDate: Timestamp.fromDate(new Date("2024-07-20")),
      activityLocation: "台北市立體育館",
      participantCount: 25,
      activityType: "校外活動",
      hasAccommodation: false,
      hasBus: true,
      requiresProposal: true,
      club: "羽球社",
      clubLeader: "張小華",
      instructor: "陳教練",
      activityPurpose: "與他校羽球社交流,提升競技水平",
      activityContent: "前往台北市立體育館進行友誼賽",
      expectedOutcome: "增進校際交流,學習他校訓練方法",
      hasBudget: true,
      budgetAmount: 5000,
      budgetDescription: "租車費用",
      status: "pending_staff",
      currentReviewer: "staff",
      reviewedBy: { staff: false, leader: false, director: false },
      skippedLevels: [],
      requiredDocuments: ["活動企劃書", "家長同意書", "租車資料"],
      uploadedDocuments: ["活動企劃書", "家長同意書"],
      documentsComplete: false,
      createdAt: Timestamp.fromDate(new Date("2024-05-01")),
      updatedAt: Timestamp.now(),
      submittedAt: Timestamp.fromDate(new Date("2024-05-10")),
      submittedBy: "test_student_001",
      submitterEmail: "student001@ck.tp.edu.tw",
    },
  },
];

// 4. 系統設定
const systemSettings = {
  id: "system",
  data: {
    academicYear: "113",
    semester: "2",
    applicationEnabled: true,
    maintenanceMode: false,
    clubList: [
      "籃球社",
      "排球社",
      "羽球社",
      "桌球社",
      "網球社",
      "游泳社",
      "田徑社",
      "足球社",
      "棒球社",
      "熱舞社",
      "吉他社",
      "管樂社",
      "合唱團",
      "美術社",
      "攝影社",
      "電影社",
      "辯論社",
      "英語演講社",
      "日語社",
      "程式設計社",
    ],
    updatedAt: Timestamp.now(),
    updatedBy: "system",
  },
};

// ===== 執行初始化 =====

async function initializeData() {
  console.log("🚀 開始初始化 Emulator 測試資料...\n");

  try {
    // 1. 建立活動範本
    console.log("📋 建立活動範本...");
    for (const template of activityTemplates) {
      await setDoc(doc(db, "activity_templates", template.id), template.data);
      console.log(`  ✅ ${template.data.templateName}`);
    }

    // 2. 建立測試使用者
    console.log("\n👥 建立測試使用者...");
    for (const user of testUsers) {
      await setDoc(doc(db, "users", user.id), user.data);
      console.log(
        `  ✅ ${user.data.displayName} (${user.data.roles.join(", ")})`
      );
    }

    // 3. 建立測試活動
    console.log("\n📝 建立測試活動...");
    for (const activity of testActivities) {
      await setDoc(doc(db, "activities", activity.id), activity.data);
      console.log(
        `  ✅ ${activity.data.activityName} (${activity.data.status})`
      );
    }

    // 4. 建立系統設定
    console.log("\n⚙️  建立系統設定...");
    await setDoc(doc(db, "settings", systemSettings.id), systemSettings.data);
    console.log(
      `  ✅ 學年度: ${systemSettings.data.academicYear}, 學期: ${systemSettings.data.semester}`
    );

    console.log("\n✨ Emulator 資料初始化完成!");
  } catch (error) {
    console.error("❌ 初始化失敗:", error);
    throw error;
  }
}

// 執行
initializeData()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    process.exit(1);
  });
