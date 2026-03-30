<template>
  <view class="history-page">

    <!-- 空状态 -->
    <view v-if="sessions.length === 0" class="empty-wrap">
      <text class="empty-icon">💬</text>
      <text class="empty-title">暂无历史会话</text>
      <text class="empty-desc">返回 AI 对话页面开始新对话</text>
    </view>

    <!-- 会话列表 -->
    <scroll-view v-else class="session-list" :scroll-y="true">
      <view
        v-for="s in sessions"
        :key="s.sessionId"
        class="session-item"
        @click="openSession(s)"
      >
        <view class="session-icon-wrap">
          <text class="session-icon">💬</text>
        </view>
        <view class="session-info">
          <text class="session-title">{{ s.title || '新对话' }}</text>
          <text class="session-time">{{ s.lastTime }}</text>
        </view>
        <view class="session-arrow">
          <text class="arrow-icon">›</text>
        </view>
        <view class="session-del" @click.stop="confirmDelete(s.sessionId)">
          <text class="del-icon">🗑</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部新建对话按钮 -->
    <view class="bottom-bar">
      <view class="new-chat-btn" @click="startNewChat">
        <text class="new-chat-icon">✏️</text>
        <text class="new-chat-txt">开始新对话</text>
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
  import { BASE_URL } from '@/config.js'
const sessions = ref([])

function getResponseMessage(body) {
  return (body && (body.message || body.msg)) || ''
}

function getToken() {
  return uni.getStorageSync('token') || ''
}

// ── 每次页面显示时从后端拉取最新会话列表 ─────────────────────────────
onShow(() => {
  const token = getToken()
  if (!token) {
    sessions.value = []
    return
  }
  uni.request({
    url: BASE_URL + '/api/ai/sessions',
    method: 'GET',
    header: { Authorization: 'Bearer ' + token },
    success(res) {
      if (res.data && res.data.code === 200 && Array.isArray(res.data.data)) {
        sessions.value = res.data.data
      } else {
        sessions.value = []
        uni.showToast({ title: getResponseMessage(res.data) || '会话列表加载失败', icon: 'none' })
      }
    },
    fail() {
      sessions.value = []
      uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
    }
  })
})

// ── 操作 ──────────────────────────────────────────
function openSession(s) {
  uni.navigateTo({
    url: '/pages/home/ai_chat?sessionId=' + encodeURIComponent(s.sessionId) +
         '&title=' + encodeURIComponent(s.title || '历史对话')
  })
}

function startNewChat() {
  uni.navigateTo({ url: '/pages/home/ai_chat' })
}

function confirmDelete(sessionId) {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，确定删除该会话吗？',
    confirmText: '删除',
    confirmColor: '#ff4d4f',
    success: ({ confirm }) => {
      if (!confirm) return
      const token = getToken()
      if (!token) return
      uni.request({
        url: BASE_URL + '/api/ai/sessions/' + encodeURIComponent(sessionId),
        method: 'DELETE',
        header: { Authorization: 'Bearer ' + token },
        success(res) {
          if (res.data && res.data.code === 200) {
            sessions.value = sessions.value.filter(s => s.sessionId !== sessionId)
            uni.showToast({ title: '已删除', icon: 'success' })
          } else {
            uni.showToast({ title: getResponseMessage(res.data) || '删除失败', icon: 'none' })
          }
        },
        fail() {
          uni.showToast({ title: '网络异常', icon: 'none' })
        }
      })
    }
  })
}
</script>

<style scoped>
.history-page {
  min-height: 100vh;
  background: #f5f6fa;
  display: flex;
  flex-direction: column;
}

/* ── 空状态 ── */
.empty-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 60rpx;
}
.empty-icon {
  font-size: 100rpx;
  margin-bottom: 32rpx;
}
.empty-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}
.empty-desc {
  font-size: 26rpx;
  color: #aaa;
  text-align: center;
}

/* ── 会话列表 ── */
.session-list {
  flex: 1;
  padding: 16rpx 0;
}

.session-item {
  display: flex;
  align-items: center;
  background: #fff;
  margin: 0 24rpx 16rpx;
  border-radius: 20rpx;
  padding: 28rpx 24rpx;
  gap: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  /* 按压效果 */
  transition: opacity 0.15s;
}
.session-item:active {
  opacity: 0.75;
}

.session-icon-wrap {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4e9afe 0%, #6c63ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.session-icon {
  font-size: 34rpx;
}

.session-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}
.session-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #222;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.session-time {
  font-size: 22rpx;
  color: #bbb;
}

.session-arrow {
  flex-shrink: 0;
}
.arrow-icon {
  font-size: 40rpx;
  color: #ccc;
  font-weight: 300;
  line-height: 1;
}

.session-del {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  background: #fff1f0;
}
.del-icon {
  font-size: 28rpx;
}

/* ── 底部新建按钮 ── */
.bottom-bar {
  padding: 24rpx 40rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #f0f0f0;
}
.new-chat-btn {
  height: 88rpx;
  border-radius: 44rpx;
  background: linear-gradient(135deg, #4e9afe 0%, #6c63ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  box-shadow: 0 6rpx 20rpx rgba(78, 154, 254, 0.35);
}
.new-chat-btn:active {
  opacity: 0.85;
}
.new-chat-icon {
  font-size: 32rpx;
}
.new-chat-txt {
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
}
</style>
