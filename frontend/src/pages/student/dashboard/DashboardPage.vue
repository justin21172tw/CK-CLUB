<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- 左側：統計資訊與快速操作 -->
      <div class="col-12 col-lg-3">
        <!-- Header -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-h6">學生儀表板</div>
            <div class="text-caption text-grey-7">歡迎回來，{{ userName }}</div>
          </q-card-section>
        </q-card>

        <!-- Statistics -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-subtitle2 text-weight-bold q-mb-md">統計資訊</div>
            <div class="q-gutter-sm">
              <dashboard-stat-card
                icon="pending"
                label="待審核"
                :value="stats.pending"
                color="orange"
              />
              <dashboard-stat-card
                icon="check_circle"
                label="已通過"
                :value="stats.approved"
                color="green"
              />
              <dashboard-stat-card
                icon="campaign"
                label="未讀公告"
                :value="stats.unread"
                color="blue"
              />
            </div>
          </q-card-section>
        </q-card>

        <!-- Quick Actions -->
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle2 text-weight-bold q-mb-md">快速操作</div>
            <div class="q-gutter-sm">
              <q-btn
                unelevated
                color="primary"
                icon="article"
                label="活動申請"
                to="/application"
                class="full-width"
                size="md"
              />
              <q-btn
                unelevated
                color="info"
                icon="campaign"
                label="查看公告"
                to="/announcement"
                class="full-width"
                size="md"
              />
              <q-btn
                unelevated
                color="secondary"
                icon="notifications"
                label="我的通知"
                to="/notice"
                class="full-width"
                size="md"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 右側：最近活動卡片網格 -->
      <div class="col-12 col-lg-9">
        <div class="text-h6 q-mb-md">最近活動</div>
        <div class="row q-col-gutter-md">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card flat bordered class="activity-card cursor-pointer" @click="goTo(activity.link)">
              <q-card-section class="text-center q-pa-lg">
                <q-icon :name="activity.icon" :color="activity.color" size="64px" class="q-mb-md" />
                <div class="text-subtitle1 text-weight-medium">{{ activity.title }}</div>
                <div class="text-caption text-grey-7 q-mt-sm">{{ activity.date }}</div>
              </q-card-section>
              <q-card-section class="text-center bg-grey-1">
                <q-btn flat dense icon="arrow_forward" label="查看詳情" color="primary" />
              </q-card-section>
            </q-card>
          </div>

          <!-- 空狀態佔位卡片 -->
          <div class="col-12 col-sm-6 col-md-4">
            <q-card flat bordered class="activity-card-placeholder">
              <q-card-section class="text-center q-pa-xl">
                <q-icon name="add_circle_outline" size="48px" color="grey-5" />
                <div class="text-body2 text-grey-6 q-mt-md">尚無更多活動</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from 'src/composables/useAuth'
import DashboardStatCard from './components/DashboardStatCard.vue'

const router = useRouter()
const { currentUser } = useAuth()

const userName = computed(() => currentUser.value?.displayName || '學生')

const stats = ref({
  pending: 2,
  approved: 5,
  unread: 3,
})

const recentActivities = ref([
  {
    id: 1,
    icon: 'article',
    color: 'primary',
    title: '社團活動申請',
    date: '7 個月前',
    link: '/application',
  },
  {
    id: 2,
    icon: 'campaign',
    color: 'info',
    title: '期末活動通知',
    date: '1 年前',
    link: '/announcement',
  },
  {
    id: 3,
    icon: 'check_circle',
    color: 'positive',
    title: '申請已核准',
    date: '2 年前',
    link: '/application',
  },
])

function goTo(path) {
  router.push(path)
}
</script>

<style scoped>
.activity-card {
  transition: all 0.3s ease;
  height: 100%;
}

.activity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.activity-card-placeholder {
  height: 100%;
  border: 2px dashed #e0e0e0;
  background: #fafafa;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
