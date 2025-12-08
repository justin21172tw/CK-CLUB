<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 500px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          <q-icon name="settings" class="q-mr-sm" />
          活動申請選項
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="text-body2 text-grey-7 q-mb-md">
          請根據您的活動性質選擇以下選項，系統將自動計算需要繳交的文件。
        </div>

        <!-- 活動類型 -->
        <div class="q-mb-md">
          <div class="text-subtitle2 text-weight-bold q-mb-sm">
            <q-icon name="location_on" class="q-mr-xs" />
            活動地點
          </div>
          <q-option-group
            v-model="options.activityType"
            :options="activityTypeOptions"
            color="primary"
            inline
          />
        </div>

        <!-- 校外活動選項 -->
        <div v-if="options.activityType === 'external'" class="q-mb-md">
          <q-separator class="q-mb-md" />

          <div class="text-subtitle2 text-weight-bold q-mb-sm">
            <q-icon name="info" class="q-mr-xs" />
            其他選項
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
          <q-separator class="q-mb-md" />

          <div class="text-subtitle2 text-weight-bold q-mb-sm">
            <q-icon name="info" class="q-mr-xs" />
            其他選項
          </div>

          <q-checkbox
            v-model="options.requiresProposal"
            label="需要繳交企劃書（大型活動）"
            color="primary"
          >
            <q-tooltip>一般活動不需要，僅大型活動需繳交</q-tooltip>
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

const show = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

// 選項資料
const options = ref({
  activityType: 'internal', // 'internal' | 'external'
  hasAccommodation: false,
  hasBus: false,
  requiresProposal: false, // 僅校內活動使用
})

// 活動類型選項
const activityTypeOptions = [
  { label: '校內活動', value: 'internal', icon: 'home' },
  { label: '校外活動', value: 'external', icon: 'explore' },
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

const handleConfirm = () => {
  const documentCodes = requiredDocuments.value.map((doc) => doc.code)

  emit('confirm', {
    ...options.value,
    requiredDocuments: documentCodes,
  })

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
    activityType: 'internal',
    hasAccommodation: false,
    hasBus: false,
    requiresProposal: false,
  }
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
</style>
