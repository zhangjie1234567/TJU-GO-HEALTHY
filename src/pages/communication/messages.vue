<template>
  <view class="container">
    <view class="tab-row">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentTab === tab.value }"
        @click="currentTab = tab.value"
      >
        {{ tab.label }}
      </view>
    </view>

    <view class="list-card">
      <view v-if="currentList.length === 0" class="empty-tip">暂无消息</view>
      <view v-for="item in currentList" :key="item.id" class="msg-item" @click="handleItemClick(item)">
        <view class="avatar">{{ item.avatar }}</view>
        <view class="content">
          <text class="name">{{ item.name }}</text>
          <text class="text">{{ item.text }}</text>
          <text v-if="item.time" class="inline-time">{{ item.time }}</text>
        </view>
        <view class="right-area">
          <text v-if="item.unread && item.unread > 0" class="unread-dot">{{ item.unread > 99 ? '99+' : item.unread }}</text>
          <text v-else-if="item.badge" class="badge">{{ item.badge }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { getChatThreads } from './community-store'

const tabs = [
  { label: '通知', value: 'notice' },
  { label: '私信', value: 'chat' },
  { label: '评论', value: 'comment' },
  { label: '粉丝', value: 'fans' }
]

const currentTab = ref('notice')
const chatThreads = ref([])

const formatChatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const now = new Date()
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  if (sameDay) {
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${hour}:${minute}`
  }

  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

const loadChatThreads = () => {
  chatThreads.value = getChatThreads().map(item => ({
    id: item.id,
    name: item.name,
    text: item.lastText || '开始聊天吧',
    avatar: item.avatar || '🙂',
    unread: Number(item.unread || 0),
    time: formatChatTime(item.updatedAt) || '刚刚'
  }))
}

onShow(() => {
  loadChatThreads()
})

const data = ref({
  notice: [
    { id: 1, name: '系统通知', text: '本周训练挑战已更新，去看看吧。', avatar: '🔔', badge: 'new', time: '09:20' },
    { id: 2, name: '系统通知', text: '你关注的榜单已刷新。', avatar: '📣', time: '昨天' }
  ],
  chat: [],
  comment: [
    { id: 5, name: '慢跑阿青', text: '评论了你的动态：配速太稳了！', avatar: '🏃', time: '10:42' },
    { id: 6, name: '橙子同学', text: '回复了你：这个食谱我也在做。', avatar: '🍊', time: '昨天' }
  ],
  fans: [
    { id: 7, name: '冰蓝', text: '关注了你', avatar: '🫧', time: '周一' },
    { id: 8, name: '糖糖', text: '关注了你', avatar: '🍬', time: '周日' }
  ]
})

const currentList = computed(() => {
  if (currentTab.value === 'chat') {
    return chatThreads.value
  }
  return data.value[currentTab.value] || []
})

const handleItemClick = (item) => {
  if (currentTab.value !== 'chat') return
  uni.navigateTo({
    url: `/pages/communication/chat_detail?name=${encodeURIComponent(item.name)}&avatar=${encodeURIComponent(item.avatar || '🙂')}`
  })
}
</script>

<style lang="scss" scoped>
$main-blue: #4FA1F2;
$bg-blue: #E3F2FD;

.container {
  min-height: 100vh;
  background: linear-gradient(135deg, $bg-blue 0%, #F0F9FF 100%);
  padding: 20rpx;
}

.tab-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10rpx;
  margin-bottom: 16rpx;
}

.tab-item {
  text-align: center;
  background: #fff;
  border-radius: 12rpx;
  padding: 12rpx 0;
  font-size: 22rpx;
  color: #5a7892;

  &.active {
    background: $main-blue;
    color: #fff;
    font-weight: 600;
  }
}

.list-card {
  background: #fff;
  border-radius: 18rpx;
  padding: 10rpx 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);
}

.empty-tip {
  text-align: center;
  color: #7b8b99;
  font-size: 22rpx;
  padding: 24rpx 0;
}

.msg-item {
  display: flex;
  align-items: center;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #eef5fb;

  &:last-child {
    border-bottom: 0;
  }
}

.avatar {
  width: 56rpx;
  height: 56rpx;
  line-height: 56rpx;
  text-align: center;
  border-radius: 50%;
  background: #eef7ff;
  margin-right: 12rpx;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.right-area {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  min-width: 56rpx;
}

.name {
  font-size: 25rpx;
  color: #333;
  font-weight: 600;
}

.text {
  font-size: 22rpx;
  color: #748596;
}

.inline-time {
  font-size: 20rpx;
  color: #9aa8b5;
}

.badge {
  padding: 4rpx 10rpx;
  border-radius: 12rpx;
  background: #ff6f7b;
  color: #fff;
  font-size: 18rpx;
}

.unread-dot {
  min-width: 28rpx;
  height: 28rpx;
  border-radius: 14rpx;
  background: #ff4d5a;
  color: #fff;
  font-size: 18rpx;
  text-align: center;
  line-height: 28rpx;
  padding: 0 6rpx;
}
</style>