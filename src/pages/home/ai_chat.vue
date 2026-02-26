<template>
  <view class="ai-chat-container">
    <!-- 聊天内容区 -->
    <scroll-view class="chat-list" :scroll-y="true" :scroll-into-view="scrollIntoView">
      <view v-for="(msg, idx) in messages" :key="idx" :id="'msg-'+idx" class="chat-item" :class="msg.role">
        <image v-if="msg.image" :src="msg.image" class="chat-img" mode="aspectFill" />
        <view v-else class="chat-bubble">{{ msg.content }}</view>
      </view>
    </scroll-view>

    <!-- 输入区 -->
    <view class="chat-input-bar">
      <input v-model="inputValue" class="chat-input" placeholder="请输入" @confirm="sendMsg" />
      <button class="send-btn" @click="sendMsg">发送</button>
    </view>
  </view>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'

const messages = ref([
  { role: 'assistant', content: '您好，我是您的健康AI助手，有什么可以帮您？' }
])
const inputValue = ref('')
const scrollIntoView = ref('msg-0')
let questionnaireData = null

onMounted(() => {
  // 读取本地存储的问卷数据（假设key为questionnaireData）
  try {
    questionnaireData = uni.getStorageSync('questionnaireData') || null
  } catch (e) {
    questionnaireData = null
  }
})

function sendMsg() {
  const val = inputValue.value.trim()
  if (!val) return
  messages.value.push({ role: 'user', content: val })
  inputValue.value = ''
  scrollToBottom()
  callAI(val)
}

function scrollToBottom() {
  nextTick(() => {
    scrollIntoView.value = 'msg-' + (messages.value.length - 1)
  })
}

function callAI(text) {
  messages.value.push({ role: 'assistant', content: '生成中……' })
  scrollToBottom()
  // 拼接问卷数据到system prompt
  let systemPrompt = 'You are a helpful assistant.'
  if (questionnaireData) {
    systemPrompt += '\n用户健康问卷信息如下：' + JSON.stringify(questionnaireData)
  }
  uni.request({
    url: 'https://route.showapi.com/3257-1',
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer {C2A8270aB8334d1FA159BCa74De5e0B7}' // 替换为你的appKey
    },
    data: {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      model: 'deepseek-r1-distill-qwen-32b'
    },
    success: (res) => {
      const idx = messages.value.findIndex(m => m.content === '生成中……' && m.role === 'assistant')
      if (idx !== -1) {
        messages.value[idx].content = res.data?.choices?.[0]?.message?.content || 'AI暂无回复'
      }
      scrollToBottom()
    },
    fail: () => {
      const idx = messages.value.findIndex(m => m.content === '生成中……' && m.role === 'assistant')
      if (idx !== -1) messages.value[idx].content = '网络异常，AI未能回复'
      scrollToBottom()
    }
  })
}
</script>

<style scoped>
.ai-chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f6fa;
}
.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  background: #f5f6fa;
}
.chat-item {
  display: flex;
  margin-bottom: 12px;
}
.chat-item.user {
  flex-direction: row-reverse;
}
.chat-bubble {
  max-width: 70vw;
  padding: 10px 16px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.6;
  background: #4e9afe;
  color: #fff;
  align-self: flex-end;
  margin-left: 8px;
  margin-right: 8px;
}
.chat-item.assistant .chat-bubble {
  background: #fff;
  color: #333;
  border: 1px solid #e6e6e6;
  align-self: flex-start;
}
.chat-img {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  margin: 4px 8px;
  object-fit: cover;
  background: #eee;
}
.chat-input-bar {
  display: flex;
  align-items: center;
  padding: 10px 8px;
  background: #fff;
  border-top: 1px solid #eee;
}
.chat-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 15px;
  padding: 8px 12px;
  border-radius: 20px;
  background: #f2f3f5;
  margin-right: 8px;
}
.send-btn {
  background: #4e9afe;
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 8px 18px;
  font-size: 15px;
}
</style>