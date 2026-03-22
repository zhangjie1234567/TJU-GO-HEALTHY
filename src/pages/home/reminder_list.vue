<template>
  <view class="page-wrap">
    <view class="header-card">
      <text class="header-title">已设置健康提醒</text>
      <text class="header-desc">同类型可设置多条，不同时间将分别保存</text>
    </view>

    <view class="toolbar">
      <view class="toolbar-btn" @click="goSetReminder">去设置提醒</view>
      <view class="toolbar-btn primary" @click="loadReminders">刷新</view>
    </view>

    <view v-if="loading" class="status-text">加载中...</view>
    <view v-else-if="reminders.length === 0" class="status-text">暂无提醒，去首页添加吧</view>

    <view v-else class="list-wrap">
      <view v-for="item in reminders" :key="item.id" class="reminder-card">
        <view class="row-top">
          <text class="type-badge">{{ typeLabel(item.reminder_type) }}</text>
          <text class="time-text">{{ item.reminder_time }}</text>
        </view>
        <view class="title-text">{{ item.reminder_title }}</view>
        <view class="row-bottom">
          <text :class="['status-tag', item.is_enabled === 1 ? 'enabled' : 'disabled']">
            {{ item.is_enabled === 1 ? '已启用' : '未启用' }}
          </text>
          <text :class="['status-tag', item.calendar_sync_status === 1 ? 'enabled' : 'disabled']">
            {{ item.calendar_sync_status === 1 ? '日历已同步' : '日历未同步' }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { BASE_URL } from '@/config.js'

const reminders = ref([])
const loading = ref(false)

function getToken() {
  return uni.getStorageSync('token') || ''
}

function typeLabel(type) {
  const map = {
    weight: '体重提醒',
    drink: '饮水提醒',
    exercise: '运动提醒',
    fasting: '断食提醒'
  }
  return map[type] || '健康提醒'
}

function goSetReminder() {
  uni.navigateBack({
    fail: () => {
      uni.reLaunch({ url: '/pages/home/home' })
    }
  })
}

function loadReminders() {
  const token = getToken()
  if (!token) {
    reminders.value = []
    console.warn('[ReminderList][API] token为空，未发起后端请求')
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  loading.value = true
  console.log('[ReminderList][API] request GET /api/plan/reminder')
  uni.request({
    url: BASE_URL + '/api/plan/reminder',
    method: 'GET',
    header: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    success(res) {
      console.log('[ReminderList][API] response GET /api/plan/reminder', {
        statusCode: res.statusCode,
        body: res.data
      })
      if (res.statusCode === 200 && res.data && res.data.code === 200) {
        const list = Array.isArray(res.data.data) ? res.data.data : []
        reminders.value = list.sort((a, b) => String(a.reminder_time).localeCompare(String(b.reminder_time)))
      } else {
        reminders.value = []
        uni.showToast({
          title: (res.data && res.data.message) || '加载提醒失败',
          icon: 'none'
        })
      }
    },
    fail(err) {
      reminders.value = []
      console.error('[ReminderList][API] fail GET /api/plan/reminder', err)
      uni.showToast({
        title: (err && err.errMsg) || '加载提醒失败',
        icon: 'none'
      })
    },
    complete() {
      loading.value = false
    }
  })
}

onShow(() => {
  loadReminders()
})
</script>

<style scoped>
.page-wrap {
  min-height: 100vh;
  background: #f6f8fb;
  padding: 24rpx;
  box-sizing: border-box;
}

.header-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(44, 62, 80, 0.06);
}

.header-title {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #1f2d3d;
}

.header-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #75808f;
}

.toolbar {
  margin-top: 20rpx;
  display: flex;
  gap: 16rpx;
}

.toolbar-btn {
  flex: 1;
  text-align: center;
  padding: 18rpx 0;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #4d5b6a;
  background: #e8edf3;
}

.toolbar-btn.primary {
  background: #53b1ef;
  color: #ffffff;
}

.status-text {
  margin-top: 40rpx;
  text-align: center;
  font-size: 28rpx;
  color: #8b97a6;
}

.list-wrap {
  margin-top: 20rpx;
}

.reminder-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 22rpx;
  box-shadow: 0 8rpx 24rpx rgba(44, 62, 80, 0.06);
  margin-bottom: 16rpx;
}

.row-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10rpx;
}

.type-badge {
  font-size: 24rpx;
  color: #1b6fa8;
  background: #e8f4fc;
  padding: 6rpx 12rpx;
  border-radius: 999rpx;
}

.time-text {
  font-size: 25rpx;
  color: #5d6b79;
}

.title-text {
  margin-top: 14rpx;
  font-size: 30rpx;
  color: #25313d;
  font-weight: 500;
}

.row-bottom {
  margin-top: 14rpx;
  display: flex;
  gap: 12rpx;
}

.status-tag {
  font-size: 23rpx;
  padding: 6rpx 10rpx;
  border-radius: 8rpx;
}

.status-tag.enabled {
  color: #1d7f4f;
  background: #e5f8ee;
}

.status-tag.disabled {
  color: #8a4f4f;
  background: #fcecec;
}
</style>
