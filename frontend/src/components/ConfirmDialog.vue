<template>
  <q-dialog v-model="isVisible" persistent>
    <q-card class="confirm-dialog-card">
      <q-card-section class="row items-center q-pb-none">
        <div class="icon-wrapper q-mr-md">
          <q-icon :name="icon" :color="iconColor" size="32px" />
        </div>
        <div class="text-h6 text-white text-weight-bold">{{ title }}</div>
        <q-space />
        <q-btn flat round dense icon="close" color="white" @click="handleCancel" />
      </q-card-section>

      <q-card-section class="q-pt-md">
        <p class="text-body1 text-white-9">{{ message }}</p>
      </q-card-section>

      <q-card-actions align="right" class="q-px-md q-pb-md">
        <q-btn
          flat
          :label="cancelText"
          color="white"
          class="cancel-btn"
          @click="handleCancel"
          no-caps
        />
        <q-btn
          unelevated
          :label="confirmText"
          :color="confirmColor"
          class="confirm-btn"
          @click="handleConfirm"
          no-caps
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
  title: {
    type: String,
    default: '確認操作',
  },
  message: {
    type: String,
    required: true,
  },
  confirmText: {
    type: String,
    default: '確認',
  },
  cancelText: {
    type: String,
    default: '取消',
  },
  icon: {
    type: String,
    default: 'help_outline',
  },
  iconColor: {
    type: String,
    default: 'warning',
  },
  confirmColor: {
    type: String,
    default: 'primary',
  },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const isVisible = ref(props.modelValue)

watch(
  () => props.modelValue,
  (val) => {
    isVisible.value = val
  },
)

watch(isVisible, (val) => {
  emit('update:modelValue', val)
})

const handleConfirm = () => {
  emit('confirm')
  isVisible.value = false
}

const handleCancel = () => {
  emit('cancel')
  isVisible.value = false
}
</script>

<style scoped>
.confirm-dialog-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 20px 60px 0 rgba(0, 0, 0, 0.3);
}

.icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  padding: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.text-white-9 {
  color: rgba(255, 255, 255, 0.9);
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 8px 20px;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.confirm-btn {
  border-radius: 8px;
  padding: 8px 20px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

@media (max-width: 480px) {
  .confirm-dialog-card {
    min-width: unset;
    max-width: 90vw;
  }
}
</style>
