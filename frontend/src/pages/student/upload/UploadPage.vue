<template>
  <q-page class="q-pa-md">
    <div class="column">
      <!-- 上方：說明卡片 -->
      <div class="row q-col-gutter-md q-mb-md">
        <!-- A. 校內指導老師 -->
        <div class="col-6">
          <q-card flat bordered class="q-pa-md">
            <div class="text-h6 text-weight-bold text-center q-mb-md">A. 校內指導老師</div>
            <div class="text-center">不須繳交任何文件</div>
          </q-card>
        </div>

        <!-- B. 外聘指導老師 -->
        <div class="col-6">
          <q-card flat bordered class="q-pa-md">
            <div class="text-h6 text-weight-bold text-center q-mb-md">B. 外聘指導老師</div>
            <div class="q-mb-sm">
              <strong>1.</strong> 所有外聘老師：每年皆須繳交新的會辦單+契約書
            </div>
            <div><strong>2.</strong> 新進外聘老師：需另外繳交一次資料卡。</div>
          </q-card>
        </div>
      </div>

      <!-- 主要區域：表單與範本下載 -->
      <div class="row q-col-gutter-md">
        <!-- 左側：表單區域 -->
        <div class="col-12 col-md-8">
          <q-card flat bordered class="q-pa-lg">
            <div class="text-h5 q-mb-md">
              <q-icon name="description" class="q-mr-sm" />
              外聘指導教師資料繳交表單
            </div>

            <!-- 注意事項 -->
            <q-banner class="bg-blue-1 text-dark q-mb-md" rounded>
              <template v-slot:avatar>
                <q-icon name="info" color="primary" />
              </template>
              <div class="text-subtitle2 text-weight-bold q-mb-sm">注意事項</div>
              <div class="q-mb-sm">
                各位老師社團指導老師好，敬請閱讀以下事項：
                為保障本校同學學習權益，教育局規定社團指導老師必須簽署契約書，並將基本資料提供給人事室查核和社團活動組建檔之用，感謝。
              </div>
              <div class="q-mb-sm">若欲電子簽核，請下載附件，簽署完畢後上傳至此處。</div>
              <div class="text-negative text-weight-bold">
                親筆簽名掃描或電子簽章後上傳表單，請勿以拍照的方式上傳，以免影響您的權益。謝謝！
              </div>
            </q-banner>

            <q-form @submit="onSubmit" class="q-gutter-md">
              <!-- 社團資訊 -->
              <div class="text-subtitle1 text-weight-bold q-mt-md">社團資訊</div>
              <q-separator />

              <q-input
                v-model="formData.academicYear"
                label="學年度 * "
                filled
                placeholder="範例 : 113"
                :rules="[(val) => !!val || '請輸入學年度']"
              />

              <q-select
                v-model="formData.club"
                :options="clubOptions"
                label="社團名稱 *"
                filled
                :rules="[(val) => !!val || '請選擇社團']"
              />

              <q-input v-model="formData.clubLeader" label="社長" filled />

              <!-- 教師資訊 -->
              <div class="text-subtitle1 text-weight-bold q-mt-lg">教師資訊</div>
              <q-separator />

              <q-select
                v-model="formData.teacherRole"
                :options="teacherRoleOptions"
                label="身分 *"
                filled
                :rules="[(val) => !!val || '請選擇身分']"
              />

              <q-input
                v-if="formData.teacherRole === '其他'"
                v-model="formData.teacherRoleOther"
                label="請說明身分 *"
                filled
                placeholder="例如：臨時講師、協同教練等"
                :rules="[(val) => !!val || '請說明您的身分']"
              />

              <q-input
                v-model="formData.teacherName"
                label="指導老師姓名 *"
                filled
                :rules="[(val) => !!val || '請輸入指導老師姓名']"
              />

              <q-input v-model="formData.lineId" label="Line ID *" filled />

              <!-- 繳交項目 -->
              <div class="text-subtitle1 text-weight-bold q-mt-lg">繳交項目</div>
              <q-separator />

              <q-checkbox v-model="formData.items.contractAndAgreement" label="會辦單+契約書" />
              <q-checkbox v-model="formData.items.dataCard" label="資料卡" />
              <q-checkbox v-model="formData.items.others" label="其他" />

              <q-input
                v-if="formData.items.others"
                v-model="formData.items.otherDescription"
                label="其他說明"
                type="textarea"
                filled
                rows="3"
              />

              <!-- 檔案上傳 -->
              <div class="text-subtitle1 text-weight-bold q-mt-lg">檔案上傳</div>
              <q-separator />

              <div class="q-mb-sm text-caption text-grey-7">
                請根據上方勾選的繳交項目上傳對應的檔案
              </div>

              <q-file
                v-model="files.contractFile"
                label="會辦單+契約書 (PDF, 最大 10MB)"
                filled
                accept=".pdf"
                max-file-size="10485760"
                @rejected="onFileRejected"
                :disable="!formData.items.contractAndAgreement"
                :hint="
                  formData.items.contractAndAgreement
                    ? '請上傳簽署完成的PDF檔案'
                    : '請先勾選「會辦單+契約書」'
                "
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>

              <q-file
                v-model="files.dataCardFile"
                label="資料卡 (PDF, 最大 10MB)"
                filled
                accept=".pdf"
                max-file-size="10485760"
                @rejected="onFileRejected"
                :disable="!formData.items.dataCard"
                :hint="formData.items.dataCard ? '請上傳填寫完成的PDF檔案' : '請先勾選「資料卡」'"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>

              <!-- 提交按鈕 -->
              <div class="q-mt-lg">
                <q-btn
                  type="submit"
                  label="提交資料"
                  color="primary"
                  size="lg"
                  :loading="submitting"
                  class="full-width"
                />
              </div>
            </q-form>
          </q-card>
        </div>

        <!-- 右側：範本下載 -->
        <div class="col-12 col-md-4">
          <q-card flat bordered class="q-pa-md sticky-card">
            <div class="text-h6 q-mb-md">
              <q-icon name="download" class="q-mr-sm" />
              範本下載
            </div>

            <q-list separator>
              <q-item
                v-for="template in templates"
                :key="template.id"
                clickable
                @click="handleDownloadTemplate(template.id)"
              >
                <q-item-section avatar>
                  <q-icon name="picture_as_pdf" color="red" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ template.name || template.filename }}</q-item-label>
                  <q-item-label caption>{{ template.description || '點擊下載' }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="download" />
                </q-item-section>
              </q-item>

              <!-- 空狀態 -->
              <q-item v-if="templates.length === 0">
                <q-item-section class="text-center text-grey-6">
                  <div class="q-pa-md">
                    <q-icon name="folder_open" size="48px" class="q-mb-sm" />
                    <div>尚無可用範本</div>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { createSubmission, getTemplates, downloadTemplate } from 'src/services/api'

const $q = useQuasar()

// 表單數據
const formData = ref({
  academicYear: '',
  club: null,
  clubCode: '',
  clubLeader: '',
  teacherRole: null,
  teacherRoleOther: '',
  teacherName: '',
  lineId: '',
  items: {
    contractAndAgreement: false,
    dataCard: false,
    others: false,
    otherDescription: '',
  },
})

// 檔案數據
const files = ref({
  contractFile: null,
  dataCardFile: null,
})

// 社團選項 (從圖片中提取的建中社團列表)
const clubOptions = ref([
  '籃球社',
  '排球社',
  '羽球社',
  '桌球社',
  '網球社',
  '游泳社',
  '田徑社',
  '足球社',
  '棒球社',
  // 可以繼續添加更多社團
])

// 身分選項
const teacherRoleOptions = ref(['主要社團指導老師', '教練', '邀請講師', '其他'])

// 範本列表
const templates = ref([])

// 提交狀態
const submitting = ref(false)

// 載入範本列表
onMounted(async () => {
  try {
    const response = await getTemplates()

    // 處理不同的響應格式
    if (response.templates) {
      templates.value = response.templates
    } else if (response.data) {
      templates.value = response.data
    } else if (Array.isArray(response)) {
      templates.value = response
    }
  } catch (error) {
    console.error('[onMounted] 載入範本失敗:', error)
    $q.notify({
      type: 'negative',
      message: '載入範本列表失敗',
      caption: error.message,
    })
  }
}) // 提交表單
async function onSubmit() {
  console.log('[onSubmit] Starting form submission...')
  console.log('[onSubmit] Form data:', formData.value)
  console.log('[onSubmit] Files:', files.value)

  try {
    submitting.value = true

    // 建立 FormData
    const submitData = new FormData()
    console.log('[onSubmit] Creating FormData...')

    // 添加文字欄位
    Object.keys(formData.value).forEach((key) => {
      if (key === 'items') {
        const itemsJson = JSON.stringify(formData.value[key])
        submitData.append(key, itemsJson)
        console.log(`[onSubmit] Added field "${key}":`, itemsJson)
      } else {
        submitData.append(key, formData.value[key])
        console.log(`[onSubmit] Added field "${key}":`, formData.value[key])
      }
    })

    // 添加檔案
    if (files.value.contractFile) {
      submitData.append('contractFile', files.value.contractFile)
      console.log('[onSubmit] Added contractFile:', files.value.contractFile.name)
    }
    if (files.value.dataCardFile) {
      submitData.append('dataCardFile', files.value.dataCardFile)
      console.log('[onSubmit] Added dataCardFile:', files.value.dataCardFile.name)
    }

    console.log('[onSubmit] Sending request to backend...')

    // 提交到後端
    const response = await createSubmission(submitData)
    console.log('[onSubmit] Response received:', response)

    $q.notify({
      type: 'positive',
      message: '資料提交成功！',
      caption: '請等待管理員審核',
    })

    // 重置表單
    resetForm()
    console.log('[onSubmit] Form reset completed')
  } catch (error) {
    console.error('[onSubmit] Error occurred:', error)
    console.error('[onSubmit] Error details:', {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data,
    })

    $q.notify({
      type: 'negative',
      message: '提交失敗: ' + (error.response?.data?.message || error.message),
    })
  } finally {
    submitting.value = false
  }
}

// 下載範本
async function handleDownloadTemplate(templateId) {
  try {
    $q.loading.show({
      message: '正在下載範本...',
    })

    const result = await downloadTemplate(templateId)

    $q.notify({
      type: 'positive',
      message: `範本「${result.filename}」下載成功`,
      timeout: 2000,
    })
  } catch (error) {
    console.error('[handleDownloadTemplate] Error:', error)

    let errorMessage = '下載失敗，請稍後再試'

    if (error.response?.status === 404) {
      errorMessage = '找不到範本檔案，請聯繫管理員'
    } else if (error.response?.status === 500) {
      errorMessage = '伺服器錯誤，請稍後再試'
    } else if (error.message === 'Network Error') {
      errorMessage = '網路連線錯誤，請檢查網路連線或確認後端服務是否啟動'
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      timeout: 3000,
    })
  } finally {
    $q.loading.hide()
  }
} // 檔案拒絕處理
function onFileRejected(rejectedEntries) {
  $q.notify({
    type: 'negative',
    message: `檔案不符合要求: ${rejectedEntries[0].failedPropValidation}`,
  })
}

// 重置表單
function resetForm() {
  formData.value = {
    academicYear: '',
    club: null,
    clubCode: '',
    clubLeader: '',
    teacherRole: null,
    teacherRoleOther: '',
    teacherName: '',
    lineId: '',
    items: {
      contractAndAgreement: false,
      dataCard: false,
      others: false,
      otherDescription: '',
    },
  }
  files.value = {
    contractFile: null,
    dataCardFile: null,
  }
}
</script>

<style scoped>
.sticky-card {
  position: sticky;
  top: 20px;
}
</style>
