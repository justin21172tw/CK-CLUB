<template>
  <q-page class="dashboard-page">
    <!-- Loading overlay -->
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>

    <div class="dashboard-content q-pa-md">
      <div class="row q-col-gutter-md">
        <!-- 左側：統計資訊與快速操作 -->
        <div class="col-12 col-lg-3">
          <!-- Header -->
          <q-card class="header-card q-mb-md">
            <q-card-section>
              <div class="text-h5 text-primary text-weight-bold">學生儀表板</div>
              <div class="text-subtitle2 text-grey-7">歡迎回來，{{ userName }}</div>
            </q-card-section>
          </q-card>

          <!-- Statistics -->
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <div class="text-subtitle2 text-weight-bold">統計資訊</div>
                <q-btn flat dense round icon="refresh" size="sm" color="primary" @click="handleRefresh">
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
            </q-card-section>
          </q-card>

          <!-- Quick Actions -->
          <q-card>
            <q-card-section>
              <div class="text-subtitle2 text-weight-bold q-mb-md">快速操作</div>
              <div class="q-gutter-sm">
                <q-btn
                  unelevated
                  class="action-btn"
                  icon="article"
                  label="活動申請"
                  to="/application"
                  color="primary"
                  no-caps
                  size="md"
                />
                <q-btn
                  unelevated
                  class="action-btn"
                  icon="campaign"
                  label="查看公告"
                  to="/announcement"
                  color="primary"
                  no-caps
                  size="md"
                />
                <q-btn
                  unelevated
                  class="action-btn"
                  icon="notifications"
                  label="我的通知"
                  to="/notice"
                  color="primary"
                  no-caps
                  size="md"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- 右側：最近活動卡片網格 -->
        <div class="col-12 col-lg-9">
          <div class="text-h6 q-mb-md text-weight-bold">最近活動</div>

          <!-- Activities grid -->
          <div class="row q-col-gutter-md">
            <!-- 新增提交案卡片 -->
            <div class="col-12 col-sm-6 col-md-4">
              <q-card
                class="create-card cursor-pointer"
                @click="showSubmissionDialog = true"
              >
                <q-card-section class="card-content text-center">
                  <div class="icon-wrapper">
                    <q-icon name="add_circle" color="primary" size="42px" />
                  </div>
                  <div class="text-subtitle1 text-weight-bold q-mt-md">新增活動登錄案</div>
                  <div class="text-caption text-grey-6">開始建立您的活動申請</div>
                </q-card-section>
                <q-separator />
                <q-card-section class="card-footer">
                  <q-icon name="arrow_forward" color="primary" size="20px" />
                </q-card-section>
              </q-card>
            </div>

            <!-- Existing activity cards -->
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="col-12 col-sm-6 col-md-4"
            >
              <q-card class="activity-card cursor-pointer" @click="goToActivity(activity)">
                <q-card-section class="card-content">
                  <div class="text-h6 text-weight-bold q-mb-sm">{{ activity.title }}</div>
                  <div class="text-caption text-grey-6">{{ activity.description || '暫無描述' }}</div>
                  <div class="q-mt-md">
                    <q-chip
                      :color="getStatusColor(activity.status)"
                      text-color="white"
                      dense
                      size="sm"
                    >
                      {{ getStatusText(activity.status) }}
                    </q-chip>
                  </div>
                </q-card-section>
                <q-separator />
                <q-card-section class="card-footer">
                  <q-icon name="event" color="grey-6" size="16px" />
                  <span class="text-caption text-grey-6">{{ formatDate(activity.created_at) }}</span>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 選擇提交類型的懸浮視窗 -->
    <q-dialog v-model="showSubmissionDialog" class="submission-dialog">
      <q-card class="dialog-card">
        <q-card-section class="dialog-header">
          <div class="text-h6 text-weight-bold">選擇登錄類型</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="dialog-content">
          <div class="row q-col-gutter-md">
            <!-- 活動申請選項 -->
            <div class="col-12 col-sm-6">
              <q-card class="option-card" @click="handleSubmissionClick('activity')">
                <q-card-section class="text-center">
                  <div class="option-icon-wrapper">
                    <q-icon name="event" color="primary" size="48px" />
                  </div>
                  <div class="text-h6 text-weight-bold q-mt-md">活動登錄</div>
                  <div class="text-body2 text-grey-6 q-mt-sm">登錄社團活動、活動企劃等相關事項</div>
                  <div class="option-arrow q-mt-md">
                    <q-icon name="arrow_forward" color="primary" size="24px" />
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- 教師資料提交選項 -->
            <div class="col-12 col-sm-6">
              <q-card class="option-card" @click="handleSubmissionClick('teacher')">
                <q-card-section class="text-center">
                  <div class="option-icon-wrapper">
                    <q-icon name="school" color="primary" size="48px" />
                  </div>
                  <div class="text-h6 text-weight-bold q-mt-md">教師資料提交</div>
                  <div class="text-body2 text-grey-6 q-mt-sm">提交教師相關文件、資料等</div>
                  <div class="option-arrow q-mt-md">
                    <q-icon name="arrow_forward" color="primary" size="24px" />
                  </div>
                </q-card-section>
              </q-card>
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
      confirm-text="確認登錄"
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
    title: '確認登錄活動',
    message: '您即將登錄此活動，登錄後所有資料將無法修改。確定要繼續嗎？',
    icon: 'how_to_reg',
    iconColor: 'primary',
    activityData: {
      title: '活動登錄（未命名）',
      type: 'activity',
      icon: 'event',
      color: 'primary',
      link: '/application',
      status: 'registered',
    },
  },
  teacher: {
    title: '確認新增教師資料提交',
    message: '您即將建立新的教師資料提交案。確定要繼續嗎？',
    icon: 'school',
    iconColor: 'positive',
    activityData: {
      title: '教師資料提交（未命名）',
      type: 'teacher',
      icon: 'school',
      color: 'positive',
      link: '/upload',
      status: 'registered',
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

  optionsText += `\n\n需繳交文件：${options.requiredDocuments.join(', ')}\n\n`
  optionsText += `\n\n⚠️ 登錄後所有資料將無法修改，請仔細確認。`

  confirmConfig.value = {
    title: '確認登錄活動',
    message: optionsText,
    icon: 'how_to_reg',
    iconColor: 'warning',
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

// 獲取狀態顏色
function getStatusColor(status) {
  const colorMap = {
    'registered': 'orange',
    'approved': 'green',
    'rejected': 'red',
    'draft': 'grey'
  }
  return colorMap[status] || 'grey'
}

// 獲取狀態文字
function getStatusText(status) {
  const textMap = {
    'registered': '待初審',
    'approved': '初審通過',
    'rejected': '已駁回',
    'draft': '草稿'
  }
  return textMap[status] || '未知狀態'
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    return `${diffDays} 天前`
  } else {
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }
}
</script>

<style scoped>
/* 頁面主體 */
.dashboard-page {
  position: relative;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 內容容器 */
.dashboard-content {
  position: relative;
}

/* Header 卡片 */
.header-card {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
}

.header-card .text-primary {
  color: white !important;
}

.header-card .text-grey-7 {
  color: rgba(255, 255, 255, 0.8) !important;
}

/* 快速操作按鈕 */
.action-btn {
  width: 100%;
  padding: 12px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

/* 新增提交案卡片 */
.create-card {
  cursor: pointer;
  height: 100%;
  border: 2px dashed #1976d2;
  transition: all 0.3s ease;
}

.create-card:hover {
  border-color: #1565c0;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(25, 118, 210, 0.2);
}

/* 活動卡片 */
.activity-card {
  cursor: pointer;
  height: 100%;
  transition: all 0.3s ease;
}

.activity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* 卡片內容區域 */
.card-content {
  padding: 20px 16px;
}

/* 圖示包裝器 */
.icon-wrapper {
  background: #e3f2fd;
  border-radius: 50%;
  padding: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.create-card:hover .icon-wrapper,
.activity-card:hover .icon-wrapper {
  background: #bbdefb;
  transform: scale(1.1);
}

/* 卡片底部 */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  transition: all 0.3s ease;
}

/* 響應式調整 */
@media (max-width: 1023px) {
  .card-content {
    padding: 16px;
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
  min-width: 600px;
  max-width: 90vw;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 選項卡片 */
.option-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
  border: 2px solid #e0e0e0;
}

.option-card:hover {
  transform: translateY(-4px);
  border-color: #1976d2;
  box-shadow: 0 8px 24px rgba(25, 118, 210, 0.2);
}

.option-icon-wrapper {
  background: #e3f2fd;
  border-radius: 50%;
  padding: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.option-card:hover .option-icon-wrapper {
  background: #bbdefb;
  transform: scale(1.1);
}

.option-arrow {
  transition: all 0.3s ease;
}

.option-card:hover .option-arrow {
  transform: translateX(4px);
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
