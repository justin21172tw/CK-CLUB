<template>
  <q-dialog v-model="show" persistent max-width="800px">
    <q-card style="min-width: 600px; max-width: 800px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          <q-icon name="event" class="q-mr-sm" />
          活動基本資訊
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-none" style="max-height: 70vh; overflow-y: auto">
        <q-form @submit.prevent="handleConfirm" class="q-gutter-md">
          <q-input
            v-model="localForm.title"
            label="活動名稱 *"
            outlined
            :readonly="readonly"
            :rules="[(val) => (val && val.length > 0) || '請輸入活動名稱']"
          />

          <q-input
            v-model="localForm.description"
            label="活動說明"
            type="textarea"
            outlined
            rows="4"
            :readonly="readonly"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="取消" color="grey-7" @click="handleCancel" />
        <q-btn
          v-if="!readonly"
          unelevated
          label="確認"
          color="primary"
          icon="check"
          @click="handleConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  initialData: {
    type: Object,
    default: () => ({
      title: '',
      description: '',
    }),
  },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const show = ref(props.modelValue)
const localForm = ref({ ...props.initialData })

watch(
  () => props.modelValue,
  (val) => {
    show.value = val
    if (val) {
      localForm.value = { ...props.initialData }
    }
  }
)

watch(show, (val) => {
  emit('update:modelValue', val)
})

watch(
  () => props.initialData,
  (val) => {
    localForm.value = { ...val }
  },
  { deep: true }
)

function handleConfirm() {
  emit('confirm', { ...localForm.value })
  show.value = false
}

function handleCancel() {
  emit('cancel')
  show.value = false
}
</script>
