<template>
  <q-layout view="hHh lpR fFf">
    <!-- Header -->
    <q-header class="bg-primary text-white no-print" elevated height-hint="98">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="/icons/CKHS-LOGO.png" style="width: 40px; height: 40px" />
          </q-avatar>
          <span v-if="$q.screen.gt.xs" class="q-pl-sm cursor-pointer" @click="goHome">
            建中社團管理平台
          </span>
          <span v-else class="q-pl-sm cursor-pointer" @click="goHome"> 社團管理平台 </span>
        </q-toolbar-title>

        <q-space />

        <!-- 頁面選擇按鈕 -->
        <div class="row q-gutter-xs q-mr-md">
          <q-btn
            v-for="link in linksList"
            :key="link.title"
            :to="link.link"
            @click="changeSelected(link.title)"
            flat
            dense
            :label="link.title"
            :icon="link.icon"
            :class="{ 'active-page': selected === link.title }"
            class="page-btn"
          />
        </div>

        <q-btn flat dense :icon="Dark.isActive ? 'dark_mode' : 'nights_stay'" @click="toggleDark" />

        <!-- 未登入：顯示登入按鈕 -->
        <q-btn
          v-if="!isAuthenticated"
          flat
          dense
          icon="login"
          label="登入"
          @click="showLoginDialog = true"
        />

        <!-- 已登入：顯示用戶資訊和登出按鈕 -->
        <div v-else class="row items-center q-gutter-sm">
          <q-avatar size="32px">
            <img v-if="currentUser?.photoURL" :src="currentUser.photoURL" />
            <q-icon v-else name="account_circle" size="32px" />
          </q-avatar>
          <span v-if="$q.screen.gt.xs" class="text-body2">
            {{ currentUser?.displayName || currentUser?.email }}
          </span>
          <q-btn flat dense round icon="logout" @click="handleSignOut">
            <q-tooltip>登出</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Main Content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Login Dialog -->
    <q-dialog v-model="showLoginDialog">
      <q-card style="width: 340px; min-height: 240px">
        <q-card-section class="text-center q-pb-sm">
          <div class="text-h5 text-weight-medium">登入系統</div>
        </q-card-section>

        <q-card-section class="column items-center q-gutter-sm q-px-lg q-pt-md">
          <!-- Google 登入按鈕 -->
          <q-btn
            unelevated
            color="primary"
            label="使用 GOOGLE 登入"
            @click="handleGoogleSignIn"
            :loading="loading"
            :disable="loading"
            size="md"
            class="full-width"
            style="height: 44px; font-size: 14px"
            no-caps
          />

          <!-- 開發模式登入 (僅開發環境顯示) -->
          <q-btn
            v-if="DEV_MODE"
            unelevated
            color="orange"
            label="開發模式登入"
            @click="handleDevSignIn"
            :loading="loading"
            :disable="loading"
            size="md"
            class="full-width"
            style="height: 44px; font-size: 14px"
            no-caps
          />
        </q-card-section>

        <!-- 錯誤訊息 -->
        <q-card-section v-if="error" class="text-center text-negative q-pt-sm">
          <q-icon name="error" size="sm" />
          <div class="text-caption">{{ error }}</div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="取消" color="grey-7" @click="showLoginDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { Dark, LocalStorage, Notify } from 'quasar'
import { useRouter } from 'vue-router'
import { useAuth } from 'src/composables/useAuth'

const router = useRouter()
const selected = ref('頁面選單')
const showLoginDialog = ref(false)

// Firebase Auth
const { currentUser, loading, error, isAuthenticated, signIn, signInAsDev, signOut, DEV_MODE } =
  useAuth()

// 處理 Google 登入
async function handleGoogleSignIn() {
  const result = await signIn()
  if (result.success) {
    showLoginDialog.value = false
    Notify.create({
      type: 'positive',
      message: `歡迎，${result.user.displayName || result.user.email}！`,
      position: 'top',
    })
  } else {
    Notify.create({
      type: 'negative',
      message: `登入失敗：${result.error}`,
      position: 'top',
    })
  }
}

// 處理開發模式登入
function handleDevSignIn() {
  const result = signInAsDev()
  if (result.success) {
    showLoginDialog.value = false
    Notify.create({
      type: 'warning',
      message: '🔧 已使用開發模式登入',
      position: 'top',
    })
  }
}

// 處理登出
async function handleSignOut() {
  const result = await signOut()
  if (result.success) {
    Notify.create({
      type: 'info',
      message: '已登出',
      position: 'top',
    })
    router.push('/')
  }
}

function changeSelected(name) {
  selected.value = name
}

function goHome() {
  router.push('/')
  selected.value = '頁面選單'
}

function toggleDark() {
  Dark.toggle()
  LocalStorage.set('dark', Dark.isActive)
}

const linksList = [
  { title: '活動申請', icon: 'article', link: '/application' },
  { title: '公告', icon: 'campaign', link: '/announcement' },
  { title: '教師資料上傳', icon: 'cloud', link: '/upload' },
  { title: '公假登錄', icon: 'event', link: '/official-leave' },
  { title: '社團銷曠', icon: 'edit', link: '/skip' },
  { title: '違規紀錄', icon: 'warning', link: '/notice' },
  { title: '社團評鑑', icon: 'star', link: '/evaluation' },
  { title: '社課重補修', icon: 'school', link: '/retakecourses' },
  { title: '關於', icon: 'info', link: '/about' },
]
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.page-btn {
  transition:
    background-color 0.2s,
    transform 0.1s;
}

.page-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.active-page {
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: bold;
}
</style>
