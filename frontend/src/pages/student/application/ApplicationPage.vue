<template>
  <q-page class="application-page q-pa-md">
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>

    <div class="page-header q-mb-lg">
      <div class="text-h4 text-weight-bold">活動申請</div>
      <div class="text-body2 text-grey-7 q-mt-sm">請填寫完整的活動資訊並上傳所需文件</div>
    </div>

    <q-card class="application-card">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="event" color="primary" size="sm" class="q-mr-sm" />
          活動資訊
        </div>

        <q-form @submit="handleSubmit" class="q-gutter-md">
          <div class="options-summary q-pa-md bg-blue-1 rounded-borders">
            <div class="row items-center q-gutter-md">
              <q-btn
                unelevated
                color="primary"
                :label="isReadonly ? '查看活動資訊' : '設定活動資訊'"
                icon="tune"
                @click="showOptionsDialog = true"
              />
              <div v-if="activityOptions" class="col">
                <div class="text-body2">
                  <strong>主辦社團：</strong>
                  {{ getClubName(activityOptions.clubId) || '未設定' }}
                </div>
                <div class="text-body2 q-mt-xs">
                  <strong>活動名稱：</strong>
                  {{ activityOptions.activityName || '未設定' }}
                </div>
                <div class="text-body2 q-mt-xs">
                  <strong>活動類型：</strong>
                  {{ activityOptions.activityType === 'internal' ? '校內活動' : '校外活動' }}
                </div>
                <div v-if="activityOptions.activityType === 'external'" class="text-body2 q-mt-xs">
                  <q-chip
                    v-if="activityOptions.hasAccommodation"
                    dense
                    color="orange"
                    text-color="white"
                    icon="hotel">
                    需要住宿
                  </q-chip>
                  <q-chip
                    v-if="activityOptions.hasBus"
                    dense
                    color="blue"
                    text-color="white"
                    icon="directions_bus">
                    需要租車
                  </q-chip>
                </div>
                <div v-if="activityOptions.requiresProposal" class="text-body2 q-mt-xs">
                  <q-chip
                    dense
                    color="purple"
                    text-color="white"
                    icon="description">
                    需繳交企劃書
                  </q-chip>
                </div>
                <div class="text-body2 q-mt-sm">
                  <strong>需繳交文件：</strong>
                  {{ getDocumentNames(activityOptions.requiredDocuments) }}
                </div>
              </div>
              <div v-else class="col text-grey-7">請點擊按鈕設定活動資訊</div>
            </div>
          </div>

          <q-separator class="q-my-lg" />

          <div class="row q-col-gutter-md justify-end">
            <div class="col-12 col-sm-auto">
              <q-btn unelevated label="返回" color="grey-7" to="/dashboard" class="full-width" />
            </div>
            <div v-if="!isReadonly" class="col-12 col-sm-auto">
              <q-btn
                unelevated
                type="submit"
                label="登錄活動"
                color="primary"
                icon="how_to_reg"
                :loading="saving"
                :disable="!isFormValid || !activityOptions"
                class="full-width"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <!-- 文件上傳區域 (只在初審通過後顯示) -->
    <q-card v-if="activityStatus === 'approved' && activityOptions" class="q-mt-md">
      <document-upload-section
        :activity-id="activityId"
        :required-document-codes="activityOptions.requiredDocuments || []"
        :existing-files="uploadedFiles"
        :readonly="false"
        @update:files="handleFilesUpdate"
        @upload-complete="handleUploadComplete"
      />
    </q-card>

    <activity-options-dialog
      v-model="showOptionsDialog"
      :readonly="isReadonly"
      :initial-options="activityOptions"
      @confirm="handleOptionsConfirm"
      @cancel="handleOptionsCancel"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { supabase } from 'boot/supabase'
import { useAuth } from 'src/composables/useAuth'
import { getDocumentNames } from 'src/config/constants'
import { getClubName } from 'src/config/clubs'
import ActivityOptionsDialog from 'src/components/ActivityOptionsDialog.vue'
import DocumentUploadSection from 'src/components/DocumentUploadSection.vue'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const { currentUser } = useAuth()

const showOptionsDialog = ref(false)
const saving = ref(false)
const activityId = ref(null)
const loading = ref(false)
const activityStatus = ref(null)
const uploadedFiles = ref({})

const activityOptions = ref(null)

// 判斷是否為唯讀模式（已登錄後就不可修改）
const isReadonly = computed(() => {
  return activityStatus.value === 'registered' ||
         activityStatus.value === 'approved' ||
         activityStatus.value === 'rejected'
})

const isFormValid = computed(() => {
  return activityOptions.value !== null && activityOptions.value.activityName
})

// Load activity data if ID is provided in route
onMounted(async () => {
  const id = route.query.id
  if (id) {
    activityId.value = id
    await loadActivity(id)
  }
})

async function loadActivity(id) {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    if (data) {
      activityStatus.value = data.status || 'draft'

      // Load options from JSONB field and club_id from dedicated column
      if (data.options) {
        activityOptions.value = {
          ...data.options,
          clubId: data.club_id || '',
        }
      }

      // Load uploaded files if exists
      if (data.uploaded_files) {
        uploadedFiles.value = data.uploaded_files
      }else{
        console.log( "no uploaded files found" );
      }
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '載入活動資料失敗',
      caption: error.message,
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

function handleOptionsConfirm(options) {
  activityOptions.value = options
  showOptionsDialog.value = false
  $q.notify({
    type: 'positive',
    message: '活動資訊已設定',
    position: 'top',
  })
}

function handleOptionsCancel() {
  showOptionsDialog.value = false
}

// 處理文件列表更新
async function handleFilesUpdate(files) {
  uploadedFiles.value = files

  // 更新資料庫中的 uploaded_files 欄位
  if (activityId.value) {
    try {
      const { error } = await supabase
        .from('activities')
        .update({ uploaded_files: files })
        .eq('id', activityId.value)

        console.log( `[application.vue-handleFilesUpdate:] `, files );
      if (error) throw error
    } catch (error) {
      console.log( "[application.vue-handleFilesUpdate]Failed to update uploaded files in database.", error );
    }
  }
}

function handleUploadComplete() {
  // File upload completed
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

  if (isReadonly.value) {
    $q.notify({
      type: 'warning',
      message: '活動已登錄，無法修改',
      position: 'top',
    })
    return
  }

  if (!activityOptions.value) {
    $q.notify({
      type: 'warning',
      message: '請先設定活動資訊',
      position: 'top',
    })
    return
  }

  try {
    saving.value = true

    // 從 options 中移除 clubId，只存到獨立的 club_id 欄位
    const { clubId, ...optionsWithoutClubId } = activityOptions.value

    // DEBUG: 確認 clubId 值
    alert(`DEBUG: clubId = "${clubId}", type = ${typeof clubId}`)

    const activityData = {
      title: activityOptions.value.activityName,
      description: activityOptions.value.activityDescription || '',
      type: 'activity',
      status: 'registered',
      club_id: clubId || null,
      options: optionsWithoutClubId,
    }

    // Update existing activity or create new one
    if (activityId.value) {
      // Update existing activity
      const { error } = await supabase
        .from('activities')
        .update(activityData)
        .eq('id', activityId.value)
        .select()
        .single()

      if (error) throw error

      $q.notify({
        type: 'positive',
        message: '活動已更新',
        caption: '等待社活組初審',
        position: 'top',
      })
    } else {
      // Create new activity
      activityData.user_id = currentUser.value.id

      const { error } = await supabase
        .from('activities')
        .insert(activityData)
        .select()
        .single()

      if (error) throw error

      $q.notify({
        type: 'positive',
        message: '活動已成功登錄',
        caption: '請等待社活組初審，通過後即可上傳文件',
        position: 'top',
      })

      // Update pending count in dashboard
      await supabase.from('dashboards').update({
        stats: supabase.raw('jsonb_set(stats, \'{pending}\', (COALESCE((stats->>\'pending\')::int, 0) + 1)::text::jsonb)')
      }).eq('user_id', currentUser.value.id)
    }

    router.push('/dashboard')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: '登錄失敗',
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

