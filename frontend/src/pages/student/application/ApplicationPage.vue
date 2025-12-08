<template>
  <q-page class="application-page q-pa-md">
    <div class="page-header q-mb-lg">
      <div class="text-h4 text-weight-bold">活動申請</div>
      <div class="text-body2 text-grey-7 q-mt-sm">請填寫完整的活動資訊並上傳所需文件</div>
    </div>

    <q-card class="application-card">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="event" color="primary" size="sm" class="q-mr-sm" />
          活動基本資訊
        </div>

        <q-form @submit="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="form.title"
            label="活動名稱 *"
            outlined
            :rules="[(val) => (val && val.length > 0) || '請輸入活動名稱']"
          />

          <q-input
            v-model="form.description"
            label="活動說明"
            type="textarea"
            outlined
            rows="4"
            hint="簡述活動內容、目的等"
          />

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.startDate"
                label="開始日期 *"
                type="date"
                outlined
                :rules="[(val) => !!val || '請選擇開始日期']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.endDate"
                label="結束日期 *"
                type="date"
                outlined
                :rules="[(val) => !!val || '請選擇結束日期']"
              />
            </div>
          </div>

          <q-input v-model="form.location" label="活動地點 *" outlined :rules="[(val) => !!val || '請輸入活動地點']" />

          <q-separator class="q-my-lg" />

          <div class="text-h6 q-mb-md">
            <q-icon name="settings" color="primary" size="sm" class="q-mr-sm" />
            活動選項
          </div>

          <div class="options-summary q-pa-md bg-blue-1 rounded-borders">
            <div class="row items-center q-gutter-md">
              <q-btn
                unelevated
                color="primary"
                label="設定活動選項"
                icon="tune"
                @click="showOptionsDialog = true"
              />
              <div v-if="activityOptions" class="col">
                <div class="text-body2">
                  <strong>活動類型：</strong>
                  {{ activityOptions.activityType === 'internal' ? '校內活動' : '校外活動' }}
                </div>
                <div v-if="activityOptions.activityType === 'external'" class="text-body2 q-mt-xs">
                  <q-chip
                    v-if="activityOptions.hasAccommodation"
                    dense
                    color="orange"
                    text-color="white"
                    icon="hotel"
                  >
                    需要住宿
                  </q-chip>
                  <q-chip v-if="activityOptions.hasBus" dense color="blue" text-color="white" icon="directions_bus">
                    需要租車
                  </q-chip>
                </div>
                <div v-if="activityOptions.requiresProposal" class="text-body2 q-mt-xs">
                  <q-chip dense color="purple" text-color="white" icon="description"> 需繳交企劃書 </q-chip>
                </div>
                <div class="text-body2 q-mt-sm">
                  <strong>需繳交文件：</strong>
                  {{ activityOptions.requiredDocuments.join('、') }}
                </div>
              </div>
              <div v-else class="col text-grey-7">請點擊按鈕設定活動選項</div>
            </div>
          </div>

          <q-separator class="q-my-lg" />

          <div class="row q-col-gutter-md justify-end">
            <div class="col-12 col-sm-auto">
              <q-btn unelevated label="取消" color="grey-7" to="/dashboard" class="full-width" />
            </div>
            <div class="col-12 col-sm-auto">
              <q-btn
                unelevated
                type="submit"
                label="儲存草稿"
                color="orange"
                :loading="saving"
                :disable="!isFormValid"
                class="full-width"
                @click="isDraft = true"
              />
            </div>
            <div class="col-12 col-sm-auto">
              <q-btn
                unelevated
                type="submit"
                label="提交申請"
                color="primary"
                :loading="saving"
                :disable="!isFormValid || !activityOptions"
                class="full-width"
                @click="isDraft = false"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <activity-options-dialog
      v-model="showOptionsDialog"
      @confirm="handleOptionsConfirm"
      @cancel="handleOptionsCancel"
    />
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { supabase } from 'boot/supabase'
import { useAuth } from 'src/composables/useAuth'
import ActivityOptionsDialog from 'src/components/ActivityOptionsDialog.vue'

const router = useRouter()
const $q = useQuasar()
const { currentUser } = useAuth()

const showOptionsDialog = ref(false)
const saving = ref(false)
const isDraft = ref(false)

const form = ref({
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  location: '',
})

const activityOptions = ref(null)

const isFormValid = computed(() => {
  return (
    form.value.title &&
    form.value.startDate &&
    form.value.endDate &&
    form.value.location
  )
})

function handleOptionsConfirm(options) {
  activityOptions.value = options
  showOptionsDialog.value = false
  $q.notify({
    type: 'positive',
    message: '活動選項已設定',
    position: 'top',
  })
}

function handleOptionsCancel() {
  showOptionsDialog.value = false
}

async function handleSubmit() {
  if (!currentUser.value) {
    $q.notify({
      type: 'negative',
      message: '請先登入',
      position: 'top',
    })
    return
  }

  if (!activityOptions.value && !isDraft.value) {
    $q.notify({
      type: 'warning',
      message: '請先設定活動選項',
      position: 'top',
    })
    return
  }

  try {
    saving.value = true

    const activityData = {
      user_id: currentUser.value.id,
      title: form.value.title,
      description: form.value.description,
      start_date: form.value.startDate,
      end_date: form.value.endDate,
      location: form.value.location,
      status: isDraft.value ? 'draft' : 'pending',
      activity_type: activityOptions.value?.activityType || 'internal',
      has_accommodation: activityOptions.value?.hasAccommodation || false,
      has_bus: activityOptions.value?.hasBus || false,
      requires_proposal: activityOptions.value?.requiresProposal || false,
      required_documents: activityOptions.value?.requiredDocuments || [],
    }

    const { error } = await supabase.from('activities').insert(activityData).select().single()

    if (error) throw error

    $q.notify({
      type: 'positive',
      message: isDraft.value ? '草稿已儲存' : '申請已提交',
      caption: isDraft.value ? '您可以稍後繼續編輯' : '請等待審核',
      position: 'top',
    })

    if (!isDraft.value) {
      await supabase.from('dashboards').update({
        stats: supabase.raw('jsonb_set(stats, \'{pending}\', (COALESCE((stats->>\'pending\')::int, 0) + 1)::text::jsonb)')
      }).eq('user_id', currentUser.value.id)
    }

    router.push('/dashboard')
  } catch (error) {
    console.error('Submit error:', error)
    $q.notify({
      type: 'negative',
      message: '提交失敗',
      caption: error.message || '請稍後再試',
      position: 'top',
    })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.application-page {
  max-width: 1000px;
  margin: 0 auto;
}

.application-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-header {
  padding: 0 8px;
}

.options-summary {
  border: 1px solid #e3f2fd;
}
</style>

