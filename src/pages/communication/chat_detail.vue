<template>
  <view class="container">
    <view class="chat-list">
      <view v-if="messages.length === 0" class="empty-tip">开始和 {{ target.name }} 聊天吧</view>

      <view
        v-for="msg in messages"
        :key="msg.id"
        class="msg-row"
        :class="{ mine: msg.sender === currentUser.name }"
      >
        <view>
          <view class="bubble">{{ msg.content }}</view>
          <text class="msg-time">{{ formatMessageTime(msg.time) }}</text>
        </view>
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
import {
  appendChatMessage,
  getChatMessages,
  markChatThreadRead,
  openOrCreateChatThread,
  upsertChatThread
} from './community-store'
import { apiRequest } from '../../utils/request'

const text = ref('')
const threadId = ref('')
const useApi = ref(false)
const messages = ref([])
const target = ref({ name: '用户', avatar: '🙂' })
const currentUser = ref({ name: '未登录用户', studentId: '', avatar: '' })

const loadCurrentUser = () => {
  const saved = uni.getStorageSync('current_user_profile')
  if (saved?.name) {
    currentUser.value = {
      name: saved.name,
      studentId: saved.studentId || '',
      avatar: saved.avatar || saved.name.slice(0, 1)
    }
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
}

const reloadMessages = async () => {
  if (!threadId.value) return
  if (useApi.value) {
    try {
      const res = await apiRequest({ url: `/api/community/chat/${threadId.value}/messages`, method: 'GET' })
      messages.value = (res || []).map(item => ({
        id: item.id,
        sender: item.senderId === (uni.getStorageSync('current_user_id') || 1) ? currentUser.value.name : target.value.name,
        content: item.content,
        time: item.createTime || Date.now()
      }))
    } catch (e) {
      console.error('加载消息失败:', e)
    }
  } else {
    messages.value = getChatMessages(threadId.value).map(item => ({
      ...item,
      time: item.time || Date.now()
    }))
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

  const name = decodeURIComponent(options?.name || '用户')
  const avatar = decodeURIComponent(options?.avatar || '🙂')
  target.value = { name, avatar }

  if (options?.threadId && !isNaN(Number(options.threadId))) {
    useApi.value = true
    threadId.value = Number(options.threadId)
  } else {
    const thread = openOrCreateChatThread(name, avatar)
    threadId.value = thread.id
    markChatThreadRead(threadId.value)
  }

  uni.setNavigationBarTitle({ title: `与${name}私聊` })
  await reloadMessages()
})

onShow(async () => {
  if (threadId.value && !useApi.value) {
    markChatThreadRead(threadId.value)
  }
  await reloadMessages()
})

const sendMessage = async () => {
  const content = text.value.trim()
  if (!content) return

  if (useApi.value) {
    try {
      const userId = uni.getStorageSync('current_user_id') || 1
      await apiRequest({
        url: '/api/community/chat/send',
        method: 'POST',
        header: { 'X-User-Id': userId },
        data: { threadId: threadId.value, receiverId: 0, content }
      })
      text.value = ''
      await reloadMessages()
    } catch (e) {
      console.error('发送消息失败:', e)
      uni.showToast({ title: '发送失败，请重试', icon: 'none' })
    }
  } else {
    appendChatMessage(threadId.value, currentUser.value.name, content)
    upsertChatThread({
      id: threadId.value,
      name: target.value.name,
      avatar: target.value.avatar,
      lastText: content,
      updatedAt: Date.now()
    })
    text.value = ''
    reloadMessages()
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
  margin-bottom: 12rpx;

  > view {
    display: flex;
    flex-direction: column;
    gap: 4rpx;
  }

  .bubble {
    max-width: 72%;
    background: #fff;
    color: #333;
    border-radius: 14rpx;
    padding: 14rpx 16rpx;
    font-size: 24rpx;
    line-height: 1.5;
  }

  &.mine {
    justify-content: flex-end;

    .bubble {
      background: $main-blue;
      color: #fff;
    }
  }
}

.msg-time {
  font-size: 18rpx;
  color: #9aa8b5;
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