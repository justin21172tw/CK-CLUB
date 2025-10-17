<template>
  <q-page class="q-pa-md">
    <!-- 開發模式警告橫幅 -->
    <q-banner v-if="isDevMode" class="bg-warning text-white q-mb-md" rounded>
      <template v-slot:avatar>
        <q-icon name="construction" />
      </template>
      <strong>🔧 開發模式</strong> - 您正在使用本地管理員權限
    </q-banner>

    <div class="q-mb-md row justify-between items-center">
      <div class="text-h4">
        <q-icon name="admin_panel_settings" class="q-mr-sm" />
        後台管理 - 提交資料審核
      </div>

      <!-- 篩選器 -->
      <div class="row q-gutter-sm">
        <q-select
          v-model="filters.status"
          :options="statusOptions"
          label="狀態篩選"
          outlined
          dense
          style="min-width: 150px"
          @update:model-value="loadSubmissions"
        />

        <q-btn flat round icon="refresh" @click="loadSubmissions" color="primary">
          <q-tooltip>重新載入</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- 統計卡片 -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-overline">待審核</div>
            <div class="text-h4 text-warning">{{ stats.pending }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-overline">已通過</div>
            <div class="text-h4 text-positive">{{ stats.approved }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-overline">已拒絕</div>
            <div class="text-h4 text-negative">{{ stats.rejected }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 資料列表 -->
    <q-table
      flat
      bordered
      :rows="submissions"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination="pagination"
      @row-click="onRowClick"
    >
      <!-- 狀態欄位自定義 -->
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-badge
            :color="getStatusColor(props.row.status)"
            :label="getStatusLabel(props.row.status)"
          />
        </q-td>
      </template>

      <!-- 操作欄位 -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            dense
            icon="visibility"
            @click.stop="viewSubmission(props.row)"
            color="primary"
          >
            <q-tooltip>查看詳情</q-tooltip>
          </q-btn>

          <q-btn
            v-if="props.row.status === 'pending'"
            flat
            round
            dense
            icon="check"
            @click.stop="approveSubmission(props.row)"
            color="positive"
          >
            <q-tooltip>批准</q-tooltip>
          </q-btn>

          <q-btn
            v-if="props.row.status === 'pending'"
            flat
            round
            dense
            icon="close"
            @click.stop="rejectSubmission(props.row)"
            color="negative"
          >
            <q-tooltip>拒絕</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- 詳情對話框 -->
    <q-dialog v-model="showDetailDialog" maximized>
      <q-card v-if="selectedSubmission">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">提交詳情</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-md">
            <!-- 基本資訊 -->
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle1 text-weight-bold">基本資訊</div>
                <q-separator class="q-my-sm" />
                <div class="row q-col-gutter-md">
                  <div class="col-6">
                    <div><strong>社團：</strong>{{ selectedSubmission.club }}</div>
                  </div>
                  <div class="col-6">
                    <div><strong>社長：</strong>{{ selectedSubmission.clubLeader }}</div>
                  </div>
                  <div class="col-6">
                    <div><strong>年級：</strong>{{ selectedSubmission.grade }}</div>
                  </div>
                  <div class="col-6">
                    <div><strong>教師姓名：</strong>{{ selectedSubmission.teacherName }}</div>
                  </div>
                  <div class="col-6">
                    <div><strong>Line ID：</strong>{{ selectedSubmission.lineId }}</div>
                  </div>
                  <div class="col-6">
                    <div><strong>提交者：</strong>{{ selectedSubmission.submitterEmail }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- 繳交項目 -->
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle1 text-weight-bold">繳交項目</div>
                <q-separator class="q-my-sm" />
                <q-list>
                  <q-item v-if="selectedSubmission.items?.contractAndAgreement">
                    <q-item-section avatar>
                      <q-icon name="check_circle" color="positive" />
                    </q-item-section>
                    <q-item-section>會辦單+契約書</q-item-section>
                  </q-item>
                  <q-item v-if="selectedSubmission.items?.dataCard">
                    <q-item-section avatar>
                      <q-icon name="check_circle" color="positive" />
                    </q-item-section>
                    <q-item-section>資料卡</q-item-section>
                  </q-item>
                  <q-item v-if="selectedSubmission.items?.others">
                    <q-item-section avatar>
                      <q-icon name="check_circle" color="positive" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>其他</q-item-label>
                      <q-item-label caption>
                        {{ selectedSubmission.items.otherDescription }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>

            <!-- 上傳檔案 -->
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle1 text-weight-bold">上傳檔案</div>
                <q-separator class="q-my-sm" />
                <q-list>
                  <q-item
                    v-for="(file, key) in selectedSubmission.files"
                    :key="key"
                    clickable
                    @click="openFile(file.url)"
                  >
                    <q-item-section avatar>
                      <q-icon name="picture_as_pdf" color="red" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ file.filename }}</q-item-label>
                      <q-item-label caption>
                        上傳時間：{{ formatDate(file.uploadedAt) }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-icon name="open_in_new" />
                    </q-item-section>
                  </q-item>
                </q-list>

                <q-separator class="q-my-sm" />

                <q-btn
                  label="下載所有檔案 (ZIP)"
                  icon="download"
                  color="primary"
                  flat
                  @click="downloadAllFiles(selectedSubmission)"
                  class="full-width"
                />
              </q-card-section>
            </q-card>

            <!-- 訊息與回覆 -->
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle1 text-weight-bold">訊息與回覆</div>
                <q-separator class="q-my-sm" />

                <!-- 訊息列表 -->
                <q-timeline v-if="submissionMessages.length > 0" color="primary" class="q-mb-md">
                  <q-timeline-entry
                    v-for="(msg, idx) in submissionMessages"
                    :key="idx"
                    :title="msg.from === 'admin' ? '管理員' : '使用者'"
                    :subtitle="formatDate(msg.timestamp)"
                    :icon="msg.from === 'admin' ? 'admin_panel_settings' : 'person'"
                    :color="msg.from === 'admin' ? 'primary' : 'secondary'"
                  >
                    <div>{{ msg.content }}</div>
                    <div class="text-caption text-grey-6">{{ msg.fromEmail }}</div>
                  </q-timeline-entry>
                </q-timeline>

                <div v-else class="text-grey-6 q-mb-md">尚無訊息</div>

                <!-- 新增訊息 -->
                <q-input
                  v-model="newMessage"
                  label="輸入回覆訊息"
                  type="textarea"
                  filled
                  rows="3"
                  class="q-mb-sm"
                />

                <q-btn
                  label="送出訊息"
                  icon="send"
                  color="primary"
                  @click="sendMessage"
                  :disable="!newMessage || newMessage.trim() === ''"
                />
              </q-card-section>
            </q-card>

            <!-- 審核操作 (僅待審核時顯示) -->
            <q-card v-if="selectedSubmission.status === 'pending'" flat bordered>
              <q-card-section>
                <div class="text-subtitle1 text-weight-bold">審核操作</div>
                <q-separator class="q-my-sm" />

                <q-input
                  v-model="reviewNote"
                  label="審核備註"
                  type="textarea"
                  filled
                  rows="3"
                  class="q-mb-md"
                />

                <div class="row q-gutter-sm">
                  <q-btn
                    label="批准"
                    icon="check"
                    color="positive"
                    @click="approveSubmission(selectedSubmission)"
                  />
                  <q-btn
                    label="拒絕"
                    icon="close"
                    color="negative"
                    @click="rejectSubmission(selectedSubmission)"
                  />
                </div>
              </q-card-section>
            </q-card>

            <!-- 審核記錄 (已審核時顯示) -->
            <q-card v-else flat bordered>
              <q-card-section>
                <div class="text-subtitle1 text-weight-bold">審核記錄</div>
                <q-separator class="q-my-sm" />
                <div>
                  <strong>狀態：</strong>
                  <q-badge
                    :color="getStatusColor(selectedSubmission.status)"
                    :label="getStatusLabel(selectedSubmission.status)"
                  />
                </div>
                <div><strong>審核備註：</strong>{{ selectedSubmission.reviewNote || '無' }}</div>
                <div>
                  <strong>審核時間：</strong>{{ formatDate(selectedSubmission.reviewedAt) }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn label="關閉" flat v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAuth } from 'src/composables/useAuth'
import {
  getSubmissions,
  updateSubmissionStatus,
  downloadSubmissionFiles,
  getSubmissionMessages,
  addSubmissionMessage,
} from 'src/services/api'

const $q = useQuasar()
const { isDevMode } = useAuth()

// 身分限制已撤除 - 所有人都可以訪問此頁面

// 資料
const submissions = ref([])
const selectedSubmission = ref(null)
const loading = ref(false)
const showDetailDialog = ref(false)
const reviewNote = ref('')
const submissionMessages = ref([])
const newMessage = ref('')

// 篩選器
const filters = ref({
  status: 'all',
})

const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '待審核', value: 'pending' },
  { label: '已通過', value: 'approved' },
  { label: '已拒絕', value: 'rejected' },
]

// 分頁設定
const pagination = ref({
  rowsPerPage: 10,
})

// 表格欄位
const columns = [
  {
    name: 'club',
    label: '社團',
    align: 'left',
    field: 'club',
    sortable: true,
  },
  {
    name: 'teacherName',
    label: '教師姓名',
    align: 'left',
    field: 'teacherName',
    sortable: true,
  },
  {
    name: 'grade',
    label: '年級',
    align: 'center',
    field: 'grade',
    sortable: true,
  },
  {
    name: 'status',
    label: '狀態',
    align: 'center',
    field: 'status',
    sortable: true,
  },
  {
    name: 'createdAt',
    label: '提交時間',
    align: 'left',
    field: 'createdAt',
    format: (val) => formatDate(val),
    sortable: true,
  },
  {
    name: 'actions',
    label: '操作',
    align: 'center',
  },
]

// 統計資料
const stats = computed(() => {
  return {
    pending: submissions.value.filter((s) => s.status === 'pending').length,
    approved: submissions.value.filter((s) => s.status === 'approved').length,
    rejected: submissions.value.filter((s) => s.status === 'rejected').length,
  }
})

// 載入提交資料
async function loadSubmissions() {
  loading.value = true
  try {
    const params = {}
    if (filters.value.status !== 'all') {
      params.status = filters.value.status
    }

    const response = await getSubmissions(params)
    submissions.value = response.data
  } catch (error) {
    console.error('載入失敗:', error)
    $q.notify({
      type: 'negative',
      message: '載入資料失敗: ' + (error.response?.data?.message || error.message),
    })
  } finally {
    loading.value = false
  }
}

// 查看詳情
async function viewSubmission(submission) {
  selectedSubmission.value = submission
  reviewNote.value = submission.reviewNote || ''
  newMessage.value = ''
  showDetailDialog.value = true

  // 載入訊息
  try {
    const response = await getSubmissionMessages(submission.id)
    submissionMessages.value = response.data || []
  } catch (error) {
    console.error('載入訊息失敗:', error)
    submissionMessages.value = []
  }
}

// 批准提交
async function approveSubmission(submission) {
  try {
    await updateSubmissionStatus(submission.id, {
      status: 'approved',
      reviewNote: reviewNote.value,
    })

    $q.notify({
      type: 'positive',
      message: '已批准提交',
    })

    showDetailDialog.value = false
    loadSubmissions()
  } catch (error) {
    console.error('批准失敗:', error)
    $q.notify({
      type: 'negative',
      message: '批准失敗: ' + (error.response?.data?.message || error.message),
    })
  }
}

// 拒絕提交
async function rejectSubmission(submission) {
  try {
    await updateSubmissionStatus(submission.id, {
      status: 'rejected',
      reviewNote: reviewNote.value,
    })

    $q.notify({
      type: 'positive',
      message: '已拒絕提交',
    })

    showDetailDialog.value = false
    loadSubmissions()
  } catch (error) {
    console.error('拒絕失敗:', error)
    $q.notify({
      type: 'negative',
      message: '拒絕失敗: ' + (error.response?.data?.message || error.message),
    })
  }
}

// 開啟檔案
function openFile(url) {
  window.open(url, '_blank')
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-TW')
}

// 取得狀態顏色
function getStatusColor(status) {
  const colors = {
    pending: 'warning',
    approved: 'positive',
    rejected: 'negative',
  }
  return colors[status] || 'grey'
}

// 取得狀態標籤
function getStatusLabel(status) {
  const labels = {
    pending: '待審核',
    approved: '已通過',
    rejected: '已拒絕',
  }
  return labels[status] || status
}

// 列點擊事件
function onRowClick(evt, row) {
  viewSubmission(row)
}

// 下載所有檔案
async function downloadAllFiles(submission) {
  try {
    $q.loading.show({ message: '正在打包檔案...' })

    const filename = `${submission.club}_${submission.teacherName}_${submission.id}`
    await downloadSubmissionFiles(submission.id, filename)

    $q.notify({
      type: 'positive',
      message: '檔案下載成功',
    })
  } catch (error) {
    console.error('下載失敗:', error)
    $q.notify({
      type: 'negative',
      message: '下載失敗: ' + (error.response?.data?.message || error.message),
    })
  } finally {
    $q.loading.hide()
  }
}

// 送出訊息
async function sendMessage() {
  if (!newMessage.value || newMessage.value.trim() === '') {
    return
  }

  try {
    await addSubmissionMessage(selectedSubmission.value.id, newMessage.value)

    $q.notify({
      type: 'positive',
      message: '訊息已送出',
    })

    // 重新載入訊息
    const response = await getSubmissionMessages(selectedSubmission.value.id)
    submissionMessages.value = response.data || []

    // 清空輸入框
    newMessage.value = ''
  } catch (error) {
    console.error('送出訊息失敗:', error)
    $q.notify({
      type: 'negative',
      message: '送出失敗: ' + (error.response?.data?.message || error.message),
    })
  }
}

// 初始化
onMounted(() => {
  loadSubmissions()
})
</script>

<style scoped>
.q-table tbody td {
  cursor: pointer;
}
</style>
