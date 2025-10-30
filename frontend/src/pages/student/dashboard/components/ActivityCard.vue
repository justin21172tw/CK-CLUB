<template>
  <q-card flat bordered class="activity-card">
    <q-card-section horizontal>
      <q-card-section class="col-auto flex items-center">
        <q-icon :name="icon" :color="color" size="lg" />
      </q-card-section>

      <q-card-section class="col">
        <div class="text-subtitle1">{{ title }}</div>
        <div class="text-caption text-grey-7">{{ description }}</div>
      </q-card-section>

      <q-card-section class="col-auto flex items-center">
        <div class="text-caption text-grey-6">{{ formattedDate }}</div>
      </q-card-section>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  icon: {
    type: String,
    default: 'event',
  },
  color: {
    type: String,
    default: 'primary',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  date: {
    type: [String, Date],
    required: true,
  },
})

const formattedDate = computed(() => {
  if (typeof props.date === 'string') return props.date
  return props.date.toLocaleDateString('zh-TW')
})
</script>

<style scoped>
.activity-card {
  transition: all 0.3s;
}

.activity-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
