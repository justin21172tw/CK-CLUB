<template>
  <div class="stat-card">
    <div class="row items-center q-gutter-md">
      <q-icon :name="icon" :color="color" size="md" />
      <div class="col">
        <div class="text-h4">{{ value }}</div>
        <div class="text-body2 text-grey-7">{{ label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
  value: {
    type: [Number, String],
    required: true,
  },
  color: {
    type: String,
    default: 'primary',
  },
})
</script>

<style scoped>
.stat-card {
  padding: 16px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
}
</style>
