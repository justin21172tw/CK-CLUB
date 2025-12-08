<template>
  <q-page class="upload-page q-pa-md">
    <div class="page-header q-mb-lg">
      <div class="text-h4 text-weight-bold">文件上傳</div>
      <div class="text-body2 text-grey-7 q-mt-sm">上傳活動申請所需文件</div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-8">
        <q-card class="upload-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="cloud_upload" color="primary" size="sm" class="q-mr-sm" />
              選擇活動
            </div>

            <q-select
              v-model="selectedActivity"
              :options="activities"
              option-label="title"
              option-value="id"
              label="選擇要上傳文件的活動 *"
              outlined
              emit-value
              map-options
              :loading="loadingActivities"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey"> 沒有可上傳文件的活動 </q-item-section>
                </q-item>
              </template>
            </q-select>

            <div v-if="selectedActivityData" class="q-mt-md q-pa-md bg-blue-1 rounded-borders">
              <div class="text-body2">
                <strong>活動名稱：</strong>{{ selectedActivityData.title }}
              </div>
              <div class="text-body2 q-mt-xs">
                <strong>活動日期：</strong>{{ selectedActivityData.start_date }} 至
                {{ selectedActivityData.end_date }}
              </div>
              <div class="text-body2 q-mt-xs">
                <strong>需繳交文件：</strong>
                <q-chip
                  v-for="doc in selectedActivityData.required_documents"
                  :key="doc"
                  dense
                  color="primary"
                  text-color="white"
                  class="q-ml-xs"
                >
                  {{ doc }}
                </q-chip>
              </div>
            </div>
          </q-card-section>

          <q-separator v-if="selectedActivity" />

          <q-card-section v-if="selectedActivity">
            <div class="text-h6 q-mb-md">
              <q-icon name="attach_file" color="primary" size="sm" class="q-mr-sm" />
              上傳文件
            </div>

            <div v-for="docCode in selectedActivityData?.required_documents" :key="docCode" class="q-mb-lg">
              <div class="text-subtitle2 text-weight-bold q-mb-sm">{{ getDocumentName(docCode) }}</div>

              <q-file
                v-model="uploadFiles[docCode]"
                outlined
                :label="`選擇 ${getDocumentName(docCode)} 文件`"
                accept=".pdf,.doc,.docx,image/*"
                max-file-size="10485760"
                @rejected="onFileRejected"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
                <template v-slot:hint> 支援格式：PDF, Word, 圖片 | 最大 10MB </template>
              </q-file>

              <div v-if="uploadedDocuments[docCode]" class="q-mt-sm">
                <q-chip removable color="green" text-color="white" icon="check_circle" @remove="removeDocument(docCode)">
                  {{ uploadedDocuments[docCode].document_name }}
                </q-chip>
              </div>
            </div>

            <div class="row q-col-gutter-md q-mt-md">
              <div class="col-12 col-sm-6">
                <q-btn
                  unelevated
                  label="上傳所有文件"
                  color="primary"
                  icon="cloud_upload"
                  :loading="uploading"
                  :disable="!hasFilesToUpload"
                  @click="uploadAllFiles"
                  class="full-width"
                />
              </div>
              <div class="col-12 col-sm-6">
                <q-btn unelevated label="返回" color="grey-7" to="/dashboard" class="full-width" />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="info-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="info" color="primary" size="sm" class="q-mr-sm" />
              注意事項
            </div>

            <q-list dense>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="check_circle" color="positive" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>支援格式</q-item-label>
                  <q-item-label>PDF, Word (.doc/.docx), 圖片</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="folder" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>檔案大小限制</q-item-label>
                  <q-item-label>單個文件最大 10MB</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="description" color="orange" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>文件要求</q-item-label>
                  <q-item-label>請確保文件清晰可讀</q-item-label>
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="security" color="blue" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>隱私保護</q-item-label>
                  <q-item-label>文件僅管理員可見</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <q-card v-if="selectedActivity" class="progress-card q-mt-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">上傳進度</div>
            <div class="text-caption text-grey-7 q-mb-sm">
              已上傳 {{ uploadedCount }} / {{ totalRequired }} 份文件
            </div>
            <q-linear-progress :value="uploadProgress" color="primary" class="q-mt-sm" />
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { supabase } from 'boot/supabase'
import { useAuth } from 'src/composables/useAuth'
import { DOCUMENT_CODES } from 'src/config/constants'

const $q = useQuasar()
const { currentUser } = useAuth()

const loadingActivities = ref(false)
const uploading = ref(false)
const activities = ref([])
const selectedActivity = ref(null)
const uploadFiles = ref({})
const uploadedDocuments = ref({})

const selectedActivityData = computed(() => {
  return activities.value.find((a) => a.id === selectedActivity.value)
})

const hasFilesToUpload = computed(() => {
  return Object.keys(uploadFiles.value).some((key) => uploadFiles.value[key])
})

const uploadedCount = computed(() => {
  return Object.keys(uploadedDocuments.value).length
})

const totalRequired = computed(() => {
  return selectedActivityData.value?.required_documents?.length || 0
})

const uploadProgress = computed(() => {
  if (totalRequired.value === 0) return 0
  return uploadedCount.value / totalRequired.value
})

function getDocumentName(code) {
  return `${code}. ${DOCUMENT_CODES[code] || '未知文件'}`
}

async function fetchActivities() {
  if (!currentUser.value) return

  try {
    loadingActivities.value = true

    const { data, error } = await supabase
      .from('activities')
      .select('id, title, start_date, end_date, required_documents, status')
      .eq('user_id', currentUser.value.id)
      .in('status', ['draft', 'pending'])
      .order('created_at', { ascending: false })

    if (error) throw error

    activities.value = data || []
  } catch (error) {
    console.error('Fetch activities error:', error)
    $q.notify({
      type: 'negative',
      message: '載入活動失敗',
      caption: error.message,
      position: 'top',
    })
  } finally {
    loadingActivities.value = false
  }
}

async function fetchUploadedDocuments() {
  if (!selectedActivity.value) return

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('activity_id', selectedActivity.value)

    if (error) throw error

    uploadedDocuments.value = {}
    data.forEach((doc) => {
      uploadedDocuments.value[doc.document_code] = doc
    })
  } catch (error) {
    console.error('Fetch documents error:', error)
  }
}

async function uploadAllFiles() {
  if (!selectedActivity.value) return

  try {
    uploading.value = true

    for (const docCode of Object.keys(uploadFiles.value)) {
      const file = uploadFiles.value[docCode]
      if (!file) continue

      if (uploadedDocuments.value[docCode]) {
        continue
      }

      const fileExt = file.name.split('.').pop()
      const filePath = `${currentUser.value.id}/${selectedActivity.value}/${docCode}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from('activity-documents').upload(filePath, file, {
        upsert: true,
      })

      if (uploadError) throw uploadError

      const { error: insertError } = await supabase.from('documents').insert({
        activity_id: selectedActivity.value,
        document_code: docCode,
        document_name: getDocumentName(docCode),
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
      })

      if (insertError) throw insertError
    }

    $q.notify({
      type: 'positive',
      message: '文件上傳成功',
      position: 'top',
    })

    uploadFiles.value = {}
    await fetchUploadedDocuments()
  } catch (error) {
    console.error('Upload error:', error)
    $q.notify({
      type: 'negative',
      message: '上傳失敗',
      caption: error.message,
      position: 'top',
    })
  } finally {
    uploading.value = false
  }
}

async function removeDocument(docCode) {
  const doc = uploadedDocuments.value[docCode]
  if (!doc) return

  try {
    const { error: deleteStorageError } = await supabase.storage.from('activity-documents').remove([doc.file_path])

    if (deleteStorageError) throw deleteStorageError

    const { error: deleteDbError } = await supabase.from('documents').delete().eq('id', doc.id)

    if (deleteDbError) throw deleteDbError

    delete uploadedDocuments.value[docCode]

    $q.notify({
      type: 'info',
      message: '文件已刪除',
      position: 'top',
    })
  } catch (error) {
    console.error('Delete error:', error)
    $q.notify({
      type: 'negative',
      message: '刪除失敗',
      caption: error.message,
      position: 'top',
    })
  }
}

function onFileRejected(rejectedEntries) {
  $q.notify({
    type: 'negative',
    message: '文件不符合要求',
    caption: rejectedEntries[0].failedPropValidation === 'max-file-size' ? '文件大小超過 10MB' : '文件格式不支援',
    position: 'top',
  })
}

watch(selectedActivity, () => {
  if (selectedActivity.value) {
    fetchUploadedDocuments()
  }
})

onMounted(() => {
  fetchActivities()
})
</script>

<style scoped>
.upload-page {
  max-width: 1200px;
  margin: 0 auto;
}

.upload-card,
.info-card,
.progress-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.page-header {
  padding: 0 8px;
}
</style>
