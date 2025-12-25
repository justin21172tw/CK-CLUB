<template>
  <q-dialog v-model="show" persistent max-width="800px">
    <q-card style="min-width: 600px; max-width: 800px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          <q-icon name="settings" class="q-mr-sm" />
          活動登錄選項
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
          請根據您的活動性質選擇以下選項，系統將自動計算需要繳交的文件。<br />
          <strong>登錄後所有資料將無法修改</strong>，請仔細確認。
        </div>

        <!-- 主辦社團 -->
        <div class="q-mb-md">
          <div class="text-subtitle2 text-weight-bold q-mb-sm">
            <q-icon name="groups" class="q-mr-xs" />
            主辦社團 *
          </div>
          <q-select
            v-model="options.clubId"
            :options="clubOptions"
            option-label="name"
            option-value="id"
            outlined
            dense
            :readonly="readonly"
            :disable="readonly"
            label="請選擇主辦社團"
            emit-value
            map-options
            :rules="[(val) => !!val || '請選擇主辦社團']"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.name }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.id }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
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
            :readonly="readonly"
            label="活動名稱"
            placeholder="例：Python 程式設計工作坊"
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
            :readonly="readonly"
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
                :readonly="readonly"
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
                :readonly="readonly"
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
                :readonly="readonly"
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
                :readonly="readonly"
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
            :readonly="readonly"
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
            :disable="readonly"
            color="primary"
            inline
          />
          <q-input
            v-if="options.hasExternalStudents === 'yes'"
            v-model="options.externalSchoolName"
            outlined
            dense
            :readonly="readonly"
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
            :disable="readonly"
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
            :disable="readonly"
            color="primary"
            class="q-mb-sm"
          />

          <q-checkbox v-model="options.hasBus" label="有遊覽車" :disable="readonly" color="primary" />
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
            :disable="readonly"
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
        <q-btn flat :label="readonly ? '關閉' : '取消'" color="grey" @click="handleCancel" />
        <q-btn
          v-if="!readonly"
          unelevated
          label="確認登錄"
          color="primary"
          icon="how_to_reg"
          @click="handleConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { DOCUMENT_DEFINITIONS } from 'src/config/constants'
import { CLUBS } from 'src/config/clubs'

const props = defineProps({
  modelValue: Boolean,
  readonly: {
    type: Boolean,
    default: false,
  },
  initialOptions: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const isDev = import.meta.env.DEV

const clubOptions = CLUBS

const show = computed({
  get: () => props.modelValue,
  set: (val) => {
    if (!val && !props.readonly) {
      resetOptions()
    }
    emit('update:modelValue', val)
  },
})

// 選項資料
const options = ref({
  clubId: '', // 主辦社團 ID
  activityName: '', // 活動名稱
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

// 計算需要的文件
const requiredDocuments = computed(() => {
  const docs = []

  if (options.value.activityType === 'internal') {
    // 校內活動：A, B, (D)
    docs.push(DOCUMENT_DEFINITIONS.A)
    docs.push(DOCUMENT_DEFINITIONS.B )
    if (options.value.requiresProposal) {
      docs.push(DOCUMENT_DEFINITIONS.D)
    }
  } else {
    // 校外活動：A, C, D, E, F 為基本
    docs.push(DOCUMENT_DEFINITIONS.A)
    docs.push(DOCUMENT_DEFINITIONS.C)
    docs.push(DOCUMENT_DEFINITIONS.D)
    docs.push(DOCUMENT_DEFINITIONS.E)
    docs.push(DOCUMENT_DEFINITIONS.F)

    // 根據住宿和遊覽車加入 G, H
    if (options.value.hasAccommodation) {
      docs.push(DOCUMENT_DEFINITIONS.G)
    }
    if (options.value.hasBus) {
      docs.push(DOCUMENT_DEFINITIONS.H)
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

// 當對話框打開且有初始選項時，載入它們
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && props.initialOptions) {
      options.value = { ...props.initialOptions }
    }
  },
)

const handleConfirm = () => {
  // 驗證基本必填欄位

  if (!options.value.clubId || !options.value.activityName || !options.value.startDate || !options.value.startTime ||
      !options.value.endDate || !options.value.endTime || !options.value.reportDeadline) {
    const missing = []
    if (!options.value.clubId) missing.push('主辦社團')
    if (!options.value.activityName) missing.push('活動名稱')
    if (!options.value.startDate) missing.push('開始日期')
    if (!options.value.startTime) missing.push('開始時間')
    if (!options.value.endDate) missing.push('結束日期')
    if (!options.value.endTime) missing.push('結束時間')
    if (!options.value.reportDeadline) missing.push('報告繳交日期')
    alert(`請填寫所有必填欄位（標記 * 的欄位）\n缺少：${missing.join('、')}`)
    return
  }

  // 驗證：如果有外校同學但未填寫校名
  if (options.value.hasExternalStudents === 'yes' && !options.value.externalSchoolName) {
    alert('請填寫外校校名')
    return
  }

  const documentCodes = requiredDocuments.value.map((doc) => doc.code)

  console.log('[optionDialog]options.value:', options.value)  //debug log
  console.log('[optionDialog]clubId:', options.value.clubId)
  const confirmData = {
    ...options.value,
    requiredDocuments: documentCodes,
  }
  console.log('[optionDialog]confirmData:', confirmData)   //debug log

  emit('confirm', confirmData)

  show.value = false
  resetOptions()
}

const handleCancel = () => {
  emit('cancel')
  show.value = false
  if (!props.readonly) {
    resetOptions()
  }
}

const resetOptions = () => {
  options.value = {
    clubId: '',
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
    clubId: 'Test',
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
