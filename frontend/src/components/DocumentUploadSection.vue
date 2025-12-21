<template>
  <q-card>
    <q-card-section>
      <div class="text-h6 q-mb-md">
        <q-icon name="upload_file" color="primary" class="q-mr-sm" />
        文件上傳
      </div>

      <q-list separator>
        <q-item 
          v-for="doc in allDocuments" 
          :key="doc.code"
          :class="{ 'document-disabled': !isDocumentRequired(doc.code) }"
        >
          <q-item-section avatar>
            <q-icon 
              v-if="isDocumentRequired(doc.code)"
              :name="uploadedFiles[doc.code] ? 'check_circle' : 'radio_button_unchecked'"
              :color="uploadedFiles[doc.code] ? 'positive' : 'grey'" 
            />
            <q-icon 
              v-else
              name="block"
              color="grey-5" 
            />
          </q-item-section>

          <q-item-section>
            <q-item-label :class="{ 'text-grey-5': !isDocumentRequired(doc.code) }">
              {{ doc.code }}. {{ doc.name }}
            </q-item-label>
            <q-item-label caption v-if="uploadedFiles[doc.code]">
              已上傳: {{ uploadedFiles[doc.code].name }}
            </q-item-label>
            <q-item-label caption v-if="!isDocumentRequired(doc.code)" class="text-grey-5">
              本次活動不須上傳
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <div v-if="isDocumentRequired(doc.code)" class="row q-gutter-sm">
              <!-- 上傳按鈕 -->
              <q-btn
                v-if="!uploadedFiles[doc.code]"
                dense
                flat
                icon="upload"
                color="primary"
                @click="triggerFileInput(doc.code)"
              >
                <q-tooltip>上傳文件</q-tooltip>
              </q-btn>

              <!-- 查看按鈕 -->
              <q-btn
                v-if="uploadedFiles[doc.code]"
                dense
                flat
                icon="visibility"
                color="primary"
                @click="viewFile(doc.code)"
              >
                <q-tooltip>查看文件</q-tooltip>
              </q-btn>

              <!-- 重新上傳按鈕 -->
              <q-btn
                v-if="uploadedFiles[doc.code]"
                dense
                flat
                icon="refresh"
                color="orange"
                @click="triggerFileInput(doc.code)"
              >
                <q-tooltip>重新上傳</q-tooltip>
              </q-btn>

              <!-- 刪除按鈕 -->
              <q-btn
                v-if="uploadedFiles[doc.code]"
                dense
                flat
                icon="delete"
                color="negative"
                @click="confirmDelete(doc.code)"
              >
                <q-tooltip>刪除文件</q-tooltip>
              </q-btn>
            </div>
            <div v-else class="text-grey-5 text-caption">
              —
            </div>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- 隱藏的文件輸入 -->
      <input
        ref="fileInputRef"
        type="file"
        style="display: none"
        :accept="acceptedFileTypes"
        @change="handleFileSelect"
      />

      <!-- 上傳進度 -->
      <q-linear-progress
        v-if="uploading"
        :value="uploadProgress / 100"
        color="primary"
        class="q-mt-md"
      />
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useStorage } from 'src/composables/useStorage'
import { DOCUMENT_DEFINITIONS } from 'src/config/constants'

const props = defineProps({
  activityId: {
    type: String,
    required: true,
  },
  requiredDocumentCodes: {
    type: Array,
    required: true,
  },
  existingFiles: {
    type: Object,
    default: () => ({}),
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:files', 'upload-complete'])

const $q = useQuasar()
const {
  uploading,
  uploadProgress,
  uploadFile,
  getSignedUrl,
  deleteFile,
  validateFileType,
  validateFileSize
} = useStorage()

const fileInputRef = ref(null)
const currentDocCode = ref(null)
const uploadedFiles = ref({ ...props.existingFiles })

// 檢查文件是否需要上傳
const isDocumentRequired = (code) => {
  return props.requiredDocumentCodes.includes(code)
}

// 所有文件定義列表（需要上傳的在上，不需要的在下，各組內按代碼排序）
const allDocuments = computed(() => {
  return Object.values(DOCUMENT_DEFINITIONS).sort((a, b) => {
    const aRequired = isDocumentRequired(a.code)
    const bRequired = isDocumentRequired(b.code)
    
    // 需要上傳的排在前面
    if (aRequired && !bRequired) return -1
    if (!aRequired && bRequired) return 1
    
    // 同組內按代碼排序
    return a.code.localeCompare(b.code)
  })
})

// 接受的文件類型
const acceptedFileTypes = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.zip'

// 觸發文件選擇
const triggerFileInput = (docCode) => {
  if (props.readonly) {
    $q.notify({
      type: 'warning',
      message: '活動已登錄，無法修改文件',
      position: 'top',
    })
    return
  }

  currentDocCode.value = docCode
  fileInputRef.value?.click()
}

// 處理文件選擇
const handleFileSelect = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 驗證文件類型
  if (!validateFileType(file)) {
    $q.notify({
      type: 'negative',
      message: '不支援的文件格式',
      caption: '請上傳 PDF、Word 文檔、圖片或 ZIP 檔案',
      position: 'top',
    })
    return
  }

  // 驗證文件大小（50MB）
  if (!validateFileSize(file, 50 * 1024 * 1024)) {
    $q.notify({
      type: 'negative',
      message: '文件太大',
      caption: '文件大小不能超過 50MB',
      position: 'top',
    })
    return
  }

  try {
    const result = await uploadFile(file, props.activityId, currentDocCode.value)

    uploadedFiles.value[currentDocCode.value] = {
      name: file.name,
      path: result.path,
      url: result.url,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    }

    emit('update:files', uploadedFiles.value)
    emit('upload-complete', currentDocCode.value, uploadedFiles.value[currentDocCode.value])

    $q.notify({
      type: 'positive',
      message: '文件上傳成功',
      caption: `${DOCUMENT_DEFINITIONS[currentDocCode.value].name} 已上傳`,
      position: 'top',
    })
  } catch (error) {
    console.error('Upload error:', error)
    $q.notify({
      type: 'negative',
      message: '上傳失敗',
      caption: error.message,
      position: 'top',
    })
  }

  // 重置文件輸入
  event.target.value = ''
  currentDocCode.value = null
}

// 查看文件
const viewFile = async (docCode) => {
  try {
    const fileInfo = uploadedFiles.value[docCode]
    if (!fileInfo) return

    // 獲取簽名 URL
    const signedUrl = await getSignedUrl(fileInfo.path, 3600)

    // 在新窗口打開
    window.open(signedUrl, '_blank')
  } catch (error) {
    console.error('View file error:', error)
    $q.notify({
      type: 'negative',
      message: '無法查看文件',
      caption: error.message,
      position: 'top',
    })
  }
}

// 確認刪除
const confirmDelete = (docCode) => {
  $q.dialog({
    title: '確認刪除',
    message: `確定要刪除 ${DOCUMENT_DEFINITIONS[docCode].name} 嗎？`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    await handleDelete(docCode)
  })
}

// 刪除文件
const handleDelete = async (docCode) => {
  try {
    const fileInfo = uploadedFiles.value[docCode]
    if (!fileInfo) return

    await deleteFile(fileInfo.path)

    delete uploadedFiles.value[docCode]
    emit('update:files', uploadedFiles.value)

    $q.notify({
      type: 'positive',
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
</script>

<style scoped>
.q-item {
  min-height: 60px;
}

.document-disabled {
  opacity: 0.5;
  background-color: #fafafa;
}
</style>
