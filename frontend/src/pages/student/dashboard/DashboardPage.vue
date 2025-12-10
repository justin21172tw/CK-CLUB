<template>
  <q-page class="dashboard-page">
    <!-- 背景漸層 -->
    <div class="gradient-background"></div>

    <!-- Loading overlay -->
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="white" />
    </q-inner-loading>

    <div class="dashboard-content q-pa-md">
      <div class="row q-col-gutter-md">
        <!-- 左側：統計資訊與快速操作 -->
        <div class="col-12 col-lg-3">
          <!-- Header -->
          <div class="glass-card header-card q-mb-md">
            <div class="text-h5 text-white text-weight-bold">學生儀表板</div>
            <div class="text-subtitle2 text-white-8">歡迎回來，{{ userName }}</div>
          </div>

          <!-- Statistics -->
          <div class="glass-card q-mb-md">
            <div class="row items-center justify-between q-mb-md">
              <div class="text-subtitle2 text-weight-bold text-white">統計資訊</div>
              <q-btn flat dense round icon="refresh" size="sm" color="white" @click="handleRefresh">
                <q-tooltip>重新整理</q-tooltip>
              </q-btn>
            </div>
            <div class="q-gutter-sm">
              <dashboard-stat-card
                icon="pending"
                label="待審核"
                :value="stats.pending"
                color="orange"
              />
              <dashboard-stat-card
                icon="check_circle"
                label="已通過"
                :value="stats.approved"
                color="green"
              />
              <dashboard-stat-card
                icon="campaign"
                label="未讀公告"
                :value="stats.unread"
                color="blue"
              />
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="glass-card">
            <div class="text-subtitle2 text-weight-bold q-mb-md text-white">快速操作</div>
            <div class="q-gutter-sm">
              <q-btn
                unelevated
                class="action-btn"
                icon="article"
                label="活動申請"
                to="/application"
                no-caps
                size="md"
              />
              <q-btn
                unelevated
                class="action-btn"
                icon="campaign"
                label="查看公告"
                to="/announcement"
                no-caps
                size="md"
              />
              <q-btn
                unelevated
                class="action-btn"
                icon="notifications"
                label="我的通知"
                to="/notice"
                no-caps
                size="md"
              />
            </div>
          </div>
        </div>

        <!-- 右側：最近活動卡片網格 -->
        <div class="col-12 col-lg-9">
          <div class="text-h6 q-mb-md text-white text-weight-bold">最近活動</div>

          <!-- Activities grid -->
          <div class="row q-col-gutter-md">
            <!-- 新增提交案卡片 -->
            <div class="col-12 col-sm-6 col-md-4">
              <div
                class="glass-card create-card cursor-pointer"
                @click="showSubmissionDialog = true"
              >
                <div class="card-content text-center">
                  <div class="icon-wrapper">
                    <q-icon name="add_circle" color="white" size="42px" />
                  </div>
                  <div class="text-subtitle1 text-weight-bold text-white q-mt-sm">新增提交案</div>
                  <div class="text-caption text-white-8 q-mt-xs">開始建立新的申請</div>
                </div>
                <div class="card-footer">
                  <q-icon name="arrow_forward" color="white" size="18px" />
                  <span class="text-white text-body2">立即申請</span>
                </div>
              </div>
            </div>

            <!-- Existing activity cards -->
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="col-12 col-sm-6 col-md-4"
            >
              <div class="glass-card activity-card cursor-pointer" @click="goToActivity(activity)">
                <div class="card-content text-center">
                  <div class="icon-wrapper">
                    <q-icon name="event" color="primary" size="42px" />
                  </div>
                  <div class="text-subtitle1 text-weight-medium text-white q-mt-sm">
                    {{ activity.title }}
                  </div>
                  <div class="text-caption text-white-7 q-mt-xs">
                    {{ activity.status === 'pending' ? '待審核' : activity.status === 'approved' ? '已通過' : '草稿' }}
                  </div>
                </div>
                <div class="card-footer">
                  <q-icon name="arrow_forward" color="white" size="18px" />
                  <span class="text-white text-body2">查看詳情</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 選擇提交類型的懸浮視窗 -->
    <q-dialog v-model="showSubmissionDialog" class="submission-dialog">
      <q-card class="dialog-card">
        <q-card-section class="dialog-header">
          <div class="text-h6 text-white text-weight-bold">選擇提交類型</div>
          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </q-card-section>

        <q-card-section class="dialog-content">
          <div class="row q-col-gutter-md">
            <!-- 活動申請選項 -->
            <div class="col-12 col-sm-6">
              <div class="option-card" @click="handleSubmissionClick('activity')">
                <div class="option-icon-wrapper">
                  <q-icon name="event" color="white" size="48px" />
                </div>
                <div class="text-h6 text-white text-weight-bold q-mt-md">活動申請</div>
                <div class="text-body2 text-white-8 q-mt-sm">申請社團活動、活動企劃等相關事項</div>
                <div class="option-arrow">
                  <q-icon name="arrow_forward" color="white" size="24px" />
                </div>
              </div>
            </div>

            <!-- 教師資料提交選項 -->
            <div class="col-12 col-sm-6">
              <div class="option-card" @click="handleSubmissionClick('teacher')">
                <div class="option-icon-wrapper">
                  <q-icon name="school" color="white" size="48px" />
                </div>
                <div class="text-h6 text-white text-weight-bold q-mt-md">教師資料提交</div>
                <div class="text-body2 text-white-8 q-mt-sm">提交教師相關文件、資料等</div>
                <div class="option-arrow">
                  <q-icon name="arrow_forward" color="white" size="24px" />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- 活動選項對話框 -->
    <activity-options-dialog
      v-model="showActivityOptionsDialog"
      @confirm="handleActivityOptionsConfirm"
      @cancel="handleActivityOptionsCancel"
    />

    <!-- 確認對話框 -->
    <confirm-dialog
      v-model="showConfirmDialog"
      :title="confirmConfig.title"
      :message="confirmConfig.message"
      :icon="confirmConfig.icon"
      :icon-color="confirmConfig.iconColor"
      confirm-text="確認新增"
      cancel-text="取消"
      @confirm="handleConfirmSubmission"
      @cancel="handleCancelSubmission"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuth } from 'src/composables/useAuth'
import { useDashboard } from 'src/composables/useDashboard'
import DashboardStatCard from './components/DashboardStatCard.vue'
import ConfirmDialog from 'src/components/ConfirmDialog.vue'
import ActivityOptionsDialog from 'src/components/ActivityOptionsDialog.vue'

const router = useRouter()
const $q = useQuasar()
const { currentUser } = useAuth()
const {
  stats,
  recentActivities,
  loadingStats,
  loadingActivities,
  initializeDashboard,
  subscribeToStats,
  subscribeToActivities,
  refreshDashboard,
  createActivity,
  unsubscribe
} = useDashboard()

const userName = computed(() => currentUser.value?.displayName || '學生')
const loading = computed(() => loadingStats.value || loadingActivities.value)

// 控制懸浮視窗顯示
const showSubmissionDialog = ref(false)
const showActivityOptionsDialog = ref(false)
const showConfirmDialog = ref(false)

// 暫存選擇的提交類型
const pendingSubmissionType = ref(null)
const pendingActivityOptions = ref(null)

// 確認對話框設定
const confirmConfig = ref({
  title: '',
  message: '',
  icon: 'help_outline',
  iconColor: 'warning',
})

// 提交類型配置
const submissionTypeConfig = {
  activity: {
    title: '確認新增活動申請',
    message: '您即將建立新的活動申請案。確定要繼續嗎？',
    icon: 'event',
    iconColor: 'primary',
    activityData: {
      title: '活動申請（草稿）',
      type: 'activity',
      icon: 'event',
      color: 'primary',
      link: '/application',
      status: 'draft',
    },
  },
  teacher: {
    title: '確認新增教師資料提交',
    message: '您即將建立新的教師資料提交案。確定要繼續嗎？',
    icon: 'school',
    iconColor: 'positive',
    activityData: {
      title: '教師資料提交（草稿）',
      type: 'teacher',
      icon: 'school',
      color: 'positive',
      link: '/upload',
      status: 'draft',
    },
  },
}

// Initialize dashboard on mount
onMounted(async () => {
  await initializeDashboard()
  subscribeToStats()
  subscribeToActivities()
})

// Cleanup on unmount
onUnmounted(() => {
  unsubscribe()
})

// Refresh stats when navigating back to dashboard
const handleRefresh = async () => {
  await refreshDashboard()
}

// 處理提交類型點擊
const handleSubmissionClick = (type) => {
  showSubmissionDialog.value = false
  pendingSubmissionType.value = type

  // 活動申請需要先選擇選項
  if (type === 'activity') {
    showActivityOptionsDialog.value = true
  } else {
    // 其他類型直接顯示確認對話框
    const config = submissionTypeConfig[type]
    if (config) {
      confirmConfig.value = { ...config }
      showConfirmDialog.value = true
    }
  }
}

// 處理活動選項確認
const handleActivityOptionsConfirm = (options) => {
  pendingActivityOptions.value = options

  // 設定確認對話框內容（包含選項資訊）
  const activityTypeLabel = options.activityType === 'internal' ? '校內' : '校外'
  let optionsText = `活動類型：${activityTypeLabel}`

  if (options.activityType === 'external') {
    optionsText += `\n住宿：${options.hasAccommodation ? '是' : '否'}`
    optionsText += `\n遊覽車：${options.hasBus ? '是' : '否'}`
  } else if (options.requiresProposal) {
    optionsText += `\n需繳交企劃書`
  }

  optionsText += `\n\n需繳交文件：${options.requiredDocuments.join(', ')}`

  confirmConfig.value = {
    title: '確認新增活動申請',
    message: optionsText,
    icon: 'event',
    iconColor: 'primary',
  }

  showConfirmDialog.value = true
}

// 處理活動選項取消
const handleActivityOptionsCancel = () => {
  pendingSubmissionType.value = null
  pendingActivityOptions.value = null
}

// 確認新增提交案
const handleConfirmSubmission = async () => {
  const type = pendingSubmissionType.value
  const config = submissionTypeConfig[type]

  if (!config) {
    pendingSubmissionType.value = null
    return
  }

  try {
    console.log('[DashboardPage] Starting activity creation...')
    console.log('[DashboardPage] Type:', type)
    console.log('[DashboardPage] Pending options:', pendingActivityOptions.value)

    // 準備活動資料
    let activityData = {
      title: config.activityData.title || '未命名活動',
      description: config.activityData.description || '',
      type: config.activityData.type,
    }

    // 如果是活動申請，加入完整選項資料到 options 欄位
    if (type === 'activity' && pendingActivityOptions.value) {
      activityData.title = pendingActivityOptions.value.activityName || activityData.title
      activityData.description = pendingActivityOptions.value.activityDescription || ''
      activityData.options = {
        activityName: pendingActivityOptions.value.activityName,
        activityDescription: pendingActivityOptions.value.activityDescription,
        startDate: pendingActivityOptions.value.startDate,
        startTime: pendingActivityOptions.value.startTime,
        endDate: pendingActivityOptions.value.endDate,
        endTime: pendingActivityOptions.value.endTime,
        reportDeadline: pendingActivityOptions.value.reportDeadline,
        activityType: pendingActivityOptions.value.activityType,
        hasExternalStudents: pendingActivityOptions.value.hasExternalStudents,
        externalSchoolName: pendingActivityOptions.value.externalSchoolName,
        hasAccommodation: pendingActivityOptions.value.hasAccommodation || false,
        hasBus: pendingActivityOptions.value.hasBus || false,
        requiresProposal: pendingActivityOptions.value.requiresProposal || false,
        requiredDocuments: pendingActivityOptions.value.requiredDocuments || [],
      }
    }

    console.log('[DashboardPage] Final activity data:', activityData)

    // 顯示載入提示
    const dismissLoading = $q.notify({
      type: 'ongoing',
      message: '正在建立活動...',
      timeout: 0,
      spinner: true,
    })

    try {
      // 建立活動卡片
      const result = await createActivity(activityData)
      console.log('[DashboardPage] Activity created successfully:', result)

      // 關閉載入提示
      dismissLoading()

      // 顯示成功訊息
      $q.notify({
        type: 'positive',
        message: '活動案已建立',
        caption: '您可以在儀表板上查看狀態',
        position: 'top',
        timeout: 2000,
      })

      // 導向對應頁面
      if (type === 'teacher') {
        window.open('#/upload', '_blank')
      }
    } catch (innerError) {
      // 關閉載入提示
      dismissLoading()
      throw innerError
    }
  } catch (error) {
    console.error('[DashboardPage] Failed to create activity:', error)
    console.error('[DashboardPage] Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
    $q.notify({
      type: 'negative',
      message: '建立失敗',
      caption: error.message || '請稍後再試',
      position: 'top',
      timeout: 5000,
    })
  } finally {
    pendingSubmissionType.value = null
  }
}

// 取消新增提交案
const handleCancelSubmission = () => {
  pendingSubmissionType.value = null
  pendingActivityOptions.value = null
}

function goToActivity(activity) {
  // 導向到 application 頁面，可以傳遞活動 ID
  router.push({
    path: '/application',
    query: { id: activity.id }
  })
}
</script>

<style scoped>
/* 頁面主體 */
.dashboard-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

/* 漸層背景 */
.gradient-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    #667eea 0%,
    #764ba2 25%,
    #f093fb 50%,
    #4facfe 75%,
    #00f2fe 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  z-index: -1;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 內容容器 */
.dashboard-content {
  position: relative;
  z-index: 1;
}

/* 玻璃態卡片基礎樣式 */
.glass-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

/* Header 卡片特殊樣式 */
.header-card {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.4);
}

/* 快速操作按鈕 */
.action-btn {
  width: 100%;
  background: rgba(255, 255, 255, 0.25);
  color: white;
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 500;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  transform: translateX(4px);
  box-shadow: 0 4px 16px rgba(255, 255, 255, 0.2);
}

/* 新增提交案卡片 */
.create-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%);
  border: 2px solid rgba(255, 255, 255, 0.4);
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.create-card:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.4) 0%, rgba(168, 85, 247, 0.4) 100%);
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 16px 48px 0 rgba(99, 102, 241, 0.4);
}

/* 活動卡片 */
.activity-card {
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.activity-card:hover {
  transform: translateY(-6px) scale(1.02);
}

/* 卡片內容區域 */
.card-content {
  flex: 1;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 圖示包裝器 */
.icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.glass-card:hover .icon-wrapper {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1) rotate(5deg);
}

/* 卡片底部 */
.card-footer {
  background: rgba(255, 255, 255, 0.15);
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.glass-card:hover .card-footer {
  background: rgba(255, 255, 255, 0.25);
}

/* 文字顏色輔助類 */
.text-white-8 {
  color: rgba(255, 255, 255, 0.8);
}

.text-white-7 {
  color: rgba(255, 255, 255, 0.7);
}

/* 響應式調整 */
@media (max-width: 1023px) {
  .glass-card {
    padding: 20px;
  }

  .card-content {
    padding: 16px 12px;
  }
}

/* 光滑滾動 */
* {
  scroll-behavior: smooth;
}

/* 游標樣式 */
.cursor-pointer {
  cursor: pointer;
}

/* 懸浮視窗樣式 */
.dialog-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  min-width: 600px;
  max-width: 90vw;
  box-shadow: 0 20px 60px 0 rgba(0, 0, 0, 0.3);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.dialog-content {
  padding: 32px 28px;
}

/* 選項卡片 */
.option-card {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  padding: 32px 24px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.option-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.option-card:hover {
  transform: translateY(-8px) scale(1.05);
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 20px 60px 0 rgba(99, 102, 241, 0.5);
}

.option-card:hover::before {
  opacity: 1;
}

.option-icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.option-card:hover .option-icon-wrapper {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.15) rotate(-5deg);
}

.option-arrow {
  margin-top: auto;
  padding-top: 24px;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.option-card:hover .option-arrow {
  opacity: 1;
  transform: translateX(8px);
}

/* 響應式調整 - Dialog */
@media (max-width: 768px) {
  .dialog-card {
    min-width: unset;
    width: 95vw;
    margin: 16px;
  }

  .dialog-content {
    padding: 24px 16px;
  }

  .option-card {
    padding: 24px 16px;
    margin-bottom: 16px;
  }
}
</style>
