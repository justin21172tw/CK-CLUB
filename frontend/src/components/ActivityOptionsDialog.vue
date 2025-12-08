<template>
  <q-dialog v-model="show" persistent max-width="800px">
    <q-card style="min-width: 600px; max-width: 800px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          <q-icon name="settings" class="q-mr-sm" />
          活動申請選項
        </div>
        <q-space />
        <q-btn
          v-if="isDev"
          flat
          dense
          round
          icon="science"
          color="orange"
          @click="fillTestData"
          class="q-mr-sm"
        >
          <q-tooltip>快速填寫測試資料</q-tooltip>
        </q-btn>
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-none" style="max-height: 70vh; overflow-y: auto">
        <div class="text-body2 text-grey-7 q-mb-md">
          請根據您的活動性質選擇以下選項，系統將自動計算需要繳交的文件。
        </div>

        <!-- 活動名稱 -->
        <div class="q-mb-md">
          <div class="text-subtitle2 text-weight-bold q-mb-sm">
            <q-icon name="event_note" class="q-mr-xs" />
            活動名稱 *
          </div>
          <q-input
            v-model="options.activityName"
            outlined
            dense
            label="主辦社團 + 活動名稱"
            placeholder="例：測資 Python 程式設計工作坊"
            :rules="[(val) => (val && val.length > 0) || '請填寫活動名稱']"
          />
        </div>

        <!-- 活動描述 -->
        <div class="q-mb-md">
          <div class="text-subtitle2 text-weight-bold q-mb-sm">
            <q-icon name="description" class="q-mr-xs" />
            活動描述（選填）
          </div>
          <q-input
            v-model="options.activityDescription"
            outlined
            type="textarea"
            rows="3"
            label="簡述活動內容、目的、預期成果等"
            placeholder="例：本次工作坊將介紹 Python 基礎語法，並透過實作練習讓同學熟悉程式設計..."
            counter
            maxlength="500"
          />
        </div>

        <q-separator class="q-mb-md" />

        <!-- 活動開始日期與時間 -->
        <div class="q-mb-md">
          <div class="text-subtitle2 text-weight-bold q-mb-sm">
            <q-icon name="event" class="q-mr-xs" />
            活動開始日期與時間 *
          </div>
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                v-model="options.startDate"
                outlined
                dense
                label="開始日期"
                type="date"
                :rules="[(val) => (val && val.length > 0) || '請選擇開始日期']"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="options.startTime"
                outlined
                dense
                label="開始時間"
                type="time"
                :rules="[(val) => (val && val.length > 0) || '請選擇開始時間']"
              />
            </div>
          </div>
        </div>

        <!-- 活動結束日期與時間 -->
        <div class="q-mb-md">
          <div class="text-subtitle2 text-weight-bold q-mb-sm">
            <q-icon name="event" class="q-mr-xs" />
            活動結束日期與時間 *
          </div>
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                v-model="options.endDate"
                outlined
                dense
                label="結束日期"
                type="date"
                :rules="[
                  (val) => (val && val.length > 0) || '請選擇結束日期',
                  (val) => !options.startDate || val >= options.startDate || '結束日期不可早於開始日期',
                ]"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="options.endTime"
                outlined
                dense
                label="結束時間"
                type="time"
                :rules="[(val) => (val && val.length > 0) || '請選擇結束時間']"
              />
            </div>
          </div>
        </div>

        <q-separator class="q-mb-md" />

        <!-- 成果報告書繳交日期 -->
        <div class="q-mb-md">
          <div class="text-subtitle2 text-weight-bold q-mb-sm">
            <q-icon name="assignment" class="q-mr-xs" />
            成果報告書繳交日期 *
          </div>
          <q-input
            v-model="options.reportDeadline"
            outlined
            dense
            label="成果報告書繳交日期"
            type="date"
            :rules="[
              (val) => (val && val.length > 0) || '請選擇成果報告書繳交日期',
              (val) => !options.endDate || val >= options.endDate || '繳交日期不可早於活動結束日期',
            ]"
          />
        </div>

        <q-separator class="q-mb-md" />

        <!-- 有無外校同學 -->
        <div class="q-mb-md">
          <div class="text-subtitle2 text-weight-bold q-mb-sm">
            <q-icon name="people" class="q-mr-xs" />
            有無外校同學 *
          </div>
          <q-option-group
            v-model="options.hasExternalStudents"
            :options="externalStudentsOptions"
            color="primary"
            inline
          />
          <q-input
            v-if="options.hasExternalStudents === 'yes'"
            v-model="options.externalSchoolName"
            outlined
            dense
            label="請填寫外校校名"
            class="q-mt-sm"
            :rules="[(val) => (val && val.length > 0) || '請填寫外校校名']"
          />
        </div>

        <q-separator class="q-mb-md" />

        <!-- 活動類型 -->
        <div class="q-mb-md">
          <div class="text-subtitle2 text-weight-bold q-mb-sm">
            <q-icon name="location_on" class="q-mr-xs" />
            活動地點 *
          </div>
          <q-option-group
            v-model="options.activityType"
            :options="activityTypeOptions"
            color="primary"
            inline
          />
        </div>

        <q-separator class="q-mb-md" />

        <!-- 校外活動選項 -->
        <div v-if="options.activityType === 'external'" class="q-mb-md">
          <div class="text-subtitle2 text-weight-bold q-mb-sm">
            <q-icon name="info" class="q-mr-xs" />
            校外活動選項
          </div>

          <q-checkbox
            v-model="options.hasAccommodation"
            label="有住宿"
            color="primary"
            class="q-mb-sm"
          />

          <q-checkbox v-model="options.hasBus" label="有遊覽車" color="primary" />
        </div>

        <!-- 校內活動選項 -->
        <div v-if="options.activityType === 'internal'" class="q-mb-md">
          <div class="text-subtitle2 text-weight-bold q-mb-sm">
            <q-icon name="info" class="q-mr-xs" />
            校內活動選項
          </div>

          <q-checkbox
            v-model="options.requiresProposal"
            label="需要繳交企劃書（大型活動）"
            color="primary"
          >
            <q-tooltip
              >*若僅為校內場地借用，且非大型活動，則不需要上傳企劃書，請勿勾選此項目。未印出紙本將不受理該核流程。</q-tooltip
            >
          </q-checkbox>
        </div>

        <!-- 需要繳交的文件預覽 -->
        <q-separator class="q-mb-md" />
        <div class="bg-blue-1 q-pa-md rounded-borders">
          <div class="text-subtitle2 text-weight-bold q-mb-sm">
            <q-icon name="assignment" class="q-mr-xs" />
            需要繳交的文件
          </div>
          <q-list dense>
            <q-item v-for="doc in requiredDocuments" :key="doc.code">
              <q-item-section avatar>
                <q-icon name="check_circle" color="positive" size="sm" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ doc.code }}. {{ doc.name }}</q-item-label>
                <q-item-label caption v-if="doc.optional" class="text-orange">
                  （選填）
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="取消" color="grey" @click="handleCancel" />
        <q-btn unelevated label="確認" color="primary" icon="check" @click="handleConfirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const isDev = import.meta.env.DEV

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// 選項資料
const options = ref({
  activityName: '', // 主辦社團 + 活動名稱
  activityDescription: '', // 活動描述（選填）
  startDate: '', // 活動開始日期 (YYYY-MM-DD)
  startTime: '', // 活動開始時間 (HH:mm)
  endDate: '', // 活動結束日期 (YYYY-MM-DD)
  endTime: '', // 活動結束時間 (HH:mm)
  reportDeadline: '', // 成果報告書繳交日期 (YYYY-MM-DD)
  activityType: 'internal', // 'internal' | 'external'
  hasExternalStudents: 'no', // 'yes' | 'no'
  externalSchoolName: '', // 外校校名（當 hasExternalStudents === 'yes' 時必填）
  hasAccommodation: false,
  hasBus: false,
  requiresProposal: false, // 僅校內活動使用
})

// 活動類型選項
const activityTypeOptions = [
  { label: '校內活動', value: 'internal', icon: 'home' },
  { label: '校外活動', value: 'external', icon: 'explore' },
]

// 有無外校同學選項
const externalStudentsOptions = [
  { label: '有', value: 'yes' },
  { label: '無', value: 'no' },
]

// 文件定義
const documentDefinitions = {
  A: { code: 'A', name: '活動登錄表單', optional: false },
  B: { code: 'B', name: '校內場地申請表', optional: false },
  C: { code: 'C', name: '校外活動申請表', optional: false },
  D: { code: 'D', name: '企劃書', optional: false },
  E: { code: 'E', name: '家長同意書', optional: false },
  F: { code: 'F', name: '保險（保單/收據/名冊）', optional: false },
  G: { code: 'G', name: '住宿合格證明', optional: false },
  H: { code: 'H', name: '車輛契約書', optional: false },
}

// 計算需要的文件
const requiredDocuments = computed(() => {
  const docs = []

  if (options.value.activityType === 'internal') {
    // 校內活動：A, B, (D)
    docs.push(documentDefinitions.A)
    docs.push(documentDefinitions.B)
    if (options.value.requiresProposal) {
      docs.push(documentDefinitions.D)
    }
  } else {
    // 校外活動：A, C, D, E, F 為基本
    docs.push(documentDefinitions.A)
    docs.push(documentDefinitions.C)
    docs.push(documentDefinitions.D)
    docs.push(documentDefinitions.E)
    docs.push(documentDefinitions.F)

    // 根據住宿和遊覽車加入 G, H
    if (options.value.hasAccommodation) {
      docs.push(documentDefinitions.G)
    }
    if (options.value.hasBus) {
      docs.push(documentDefinitions.H)
    }
  }

  return docs
})

// 重置選項（切換活動類型時）
watch(
  () => options.value.activityType,
  (newType) => {
    if (newType === 'internal') {
      options.value.hasAccommodation = false
      options.value.hasBus = false
    } else {
      options.value.requiresProposal = false
    }
  },
)

// 清空外校校名（當選擇無外校同學時）
watch(
  () => options.value.hasExternalStudents,
  (newValue) => {
    if (newValue === 'no') {
      options.value.externalSchoolName = ''
    }
  },
)

const handleConfirm = () => {
  console.log('[ActivityOptionsDialog] handleConfirm called')
  console.log('[ActivityOptionsDialog] Current options:', options.value)

  // 驗證基本必填欄位
  const requiredFields = {
    activityName: options.value.activityName,
    startDate: options.value.startDate,
    startTime: options.value.startTime,
    endDate: options.value.endDate,
    endTime: options.value.endTime,
    reportDeadline: options.value.reportDeadline,
  }
  console.log('[ActivityOptionsDialog] Required fields check:', requiredFields)

  if (!options.value.activityName || !options.value.startDate || !options.value.startTime ||
      !options.value.endDate || !options.value.endTime || !options.value.reportDeadline) {
    console.warn('[ActivityOptionsDialog] Validation failed: missing required fields')
    const missing = []
    if (!options.value.activityName) missing.push('活動名稱')
    if (!options.value.startDate) missing.push('開始日期')
    if (!options.value.startTime) missing.push('開始時間')
    if (!options.value.endDate) missing.push('結束日期')
    if (!options.value.endTime) missing.push('結束時間')
    if (!options.value.reportDeadline) missing.push('報告繳交日期')
    console.warn('[ActivityOptionsDialog] Missing fields:', missing)
    alert(`請填寫所有必填欄位（標記 * 的欄位）\n缺少：${missing.join('、')}`)
    return
  }

  // 驗證：如果有外校同學但未填寫校名
  if (options.value.hasExternalStudents === 'yes' && !options.value.externalSchoolName) {
    console.warn('[ActivityOptionsDialog] Validation failed: missing external school name')
    alert('請填寫外校校名')
    return
  }

  const documentCodes = requiredDocuments.value.map((doc) => doc.code)

  const confirmData = {
    ...options.value,
    requiredDocuments: documentCodes,
  }

  console.log('[ActivityOptionsDialog] Emitting confirm with data:', confirmData)

  emit('confirm', confirmData)

  show.value = false
  resetOptions()
}

const handleCancel = () => {
  emit('cancel')
  show.value = false
  resetOptions()
}

const resetOptions = () => {
  options.value = {
    activityName: '',
    activityDescription: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    reportDeadline: '',
    activityType: 'internal',
    hasExternalStudents: 'no',
    externalSchoolName: '',
    hasAccommodation: false,
    hasBus: false,
    requiresProposal: false,
  }
}

// 快速填寫測試資料（開發用）
const fillTestData = () => {
  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)
  const twoWeeksLater = new Date(today)
  twoWeeksLater.setDate(today.getDate() + 14)

  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
  }

  options.value = {
    activityName: '測資 ',
    activityDescription: '此為開發用測試資料。',
    startDate: formatDate(nextWeek),
    startTime: '14:00',
    endDate: formatDate(nextWeek),
    endTime: '17:00',
    reportDeadline: formatDate(twoWeeksLater),
    activityType: 'internal',
    hasExternalStudents: 'no',
    externalSchoolName: '',
    hasAccommodation: false,
    hasBus: false,
    requiresProposal: true,
  }
}

// 在開發環境中暴露到 window 物件
if (import.meta.env.DEV) {
  window.fillActivityTestData = fillTestData
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
</style>
