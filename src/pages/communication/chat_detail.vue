<template>
  <view class="container">
    <view class="chat-list">
      <view v-if="messages.length === 0" class="empty-tip">开始和 {{ target.name }} 聊天吧</view>

      <view
        v-for="msg in messages"
        :key="msg.id"
        class="msg-row"
        :class="{ mine: msg.isMine }"
      >
        <view v-if="!msg.isMine" class="peer-avatar">{{ target.avatar || getNameAvatar(target.name) }}</view>

        <view class="msg-body" :class="{ mine: msg.isMine }">
          <text class="msg-time">{{ formatMessageTime(msg.time) }}</text>
          <view class="bubble" :class="{ mine: msg.isMine }">{{ msg.content }}</view>
        </view>

        <view v-if="msg.isMine" class="mine-avatar">{{ currentUser.avatar || getNameAvatar(currentUser.name) }}</view>
      </view>
    </view>

    <view class="input-bar">
      <input v-model="text" class="msg-input" placeholder="输入消息..." />
      <text class="send-btn" @click="sendMessage">发送</text>
    </view>
  </view>
</template>

<script setup>
import { onLoad, onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { apiRequest } from '../../utils/request'
import { getAuthHeaders, getAuthToken, handleAuthError } from './auth-helper'

const text = ref('')
const threadId = ref('')
const messages = ref([])
const target = ref({ name: '用户', avatar: '🙂' })
const currentUser = ref({ name: '未登录用户', studentId: '', avatar: '' })
const currentUserId = ref(0)

const safeDecode = (value, fallback = '') => {
  if (value === undefined || value === null || value === '') return fallback
  try {
    return decodeURIComponent(String(value))
  } catch (e) {
    return String(value)
  }
}

const loadCurrentUser = () => {
  const rawSaved = uni.getStorageSync('current_user_profile')
  let saved = rawSaved
  if (typeof rawSaved === 'string') {
    try {
      saved = JSON.parse(rawSaved || '{}')
    } catch (e) {
      saved = null
    }
  }
  if (saved?.name) {
    currentUser.value = {
      name: saved.name,
      studentId: saved.studentId || '',
      avatar: saved.avatar || saved.name.slice(0, 1)
    }
    currentUserId.value = Number(uni.getStorageSync('current_user_id') || 0)
    return
  }
  const rememberName = uni.getStorageSync('login_remember_name')
  const rememberId = uni.getStorageSync('login_remember_studentId')
  if (rememberName) {
    currentUser.value = {
      name: rememberName,
      studentId: rememberId || '',
      avatar: rememberName.slice(0, 1)
    }
  }
  currentUserId.value = Number(uni.getStorageSync('current_user_id') || 0)
}

const getNameAvatar = (name) => {
  const text = String(name || '').trim()
  if (!text) return '🙂'
  return text.slice(0, 1)
}

const reloadMessages = async () => {
  if (!threadId.value) return
  if (!getAuthToken()) {
    messages.value = []
    return
  }
  try {
    const res = await apiRequest({ url: `/api/community/chat/${threadId.value}/messages`, method: 'GET', header: getAuthHeaders() })
    messages.value = (res || []).map(item => ({
      id: item.id,
      isMine: Number(item.senderId) === Number(currentUserId.value || 0),
      content: item.content,
      time: item.createTime || Date.now()
    }))
  } catch (e) {
    if (handleAuthError(e)) {
      messages.value = []
      return
    }
    console.error('加载消息失败:', e)
  }
}

const formatMessageTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${hour}:${minute}`
}

onLoad(async (options) => {
  loadCurrentUser()

  const name = safeDecode(options?.name, '用户')
  const avatar = safeDecode(options?.avatar, '🙂')
  target.value = { name, avatar }

  if (!options?.threadId || isNaN(Number(options.threadId))) {
    uni.showToast({ title: '聊天线程不存在', icon: 'none' })
    setTimeout(() => uni.navigateBack({ delta: 1 }), 500)
    return
  }
  threadId.value = Number(options.threadId)

  uni.setNavigationBarTitle({ title: `与${name}私聊` })
  await reloadMessages()
})

onShow(async () => {
  await reloadMessages()
})

const sendMessage = async () => {
  const content = text.value.trim()
  if (!content) return

  if (!getAuthToken()) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  try {
    await apiRequest({
      url: '/api/community/chat/send',
      method: 'POST',
      header: getAuthHeaders(),
      data: { threadId: threadId.value, receiverId: 0, content }
    })
    text.value = ''
    await reloadMessages()
  } catch (e) {
    if (handleAuthError(e)) return
    console.error('发送消息失败:', e)
    uni.showToast({ title: '发送失败，请重试', icon: 'none' })
  }
}
</script>

<style lang="scss" scoped>
$main-blue: #4FA1F2;
$bg-blue: #E3F2FD;

.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, $bg-blue 0%, #F0F9FF 100%);
}

.chat-list {
  flex: 1;
  padding: 20rpx;
}

.empty-tip {
  background: #fff;
  border-radius: 14rpx;
  padding: 20rpx;
  color: #6e8092;
  font-size: 23rpx;
}

.msg-row {
  display: flex;
  align-items: flex-end;
  gap: 10rpx;
  margin-bottom: 18rpx;

  &.mine {
    justify-content: flex-end;
  }
}

.peer-avatar,
.mine-avatar {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  flex-shrink: 0;
}

.peer-avatar {
  background: #ffffff;
  color: #4a6f8f;
}

.mine-avatar {
  background: #d8ecff;
  color: #2f6da6;
}

.msg-body {
  max-width: 72%;
  display: flex;
  flex-direction: column;
  gap: 6rpx;

  &.mine {
    align-items: flex-end;
  }
}

.msg-time {
  font-size: 18rpx;
  color: #90a3b4;
  padding: 0 4rpx;
}

.bubble {
  background: #fff;
  color: #2f3740;
  border-radius: 16rpx;
  padding: 14rpx 16rpx;
  font-size: 24rpx;
  line-height: 1.5;
  box-shadow: 0 2rpx 8rpx rgba(36, 82, 121, 0.08);

  &.mine {
    background: #4FA1F2;
    color: #fff;
  }
}

.input-bar {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 14rpx 16rpx;
  background: #fff;
  border-top: 1rpx solid #e8f0f7;
}

.msg-input {
  flex: 1;
  height: 72rpx;
  background: #f6fbff;
  border-radius: 14rpx;
  padding: 0 14rpx;
  font-size: 24rpx;
}

.send-btn {
  background: $main-blue;
  color: #fff;
  border-radius: 14rpx;
  padding: 12rpx 20rpx;
  font-size: 24rpx;
}
</style>