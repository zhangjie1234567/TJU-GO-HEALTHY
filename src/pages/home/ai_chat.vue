<template>
  <view class="ai-chat-page">

    <!-- 聊天主体 -->
    <scroll-view
      class="chat-body"
      :scroll-y="true"
      :scroll-into-view="scrollTarget"
      :scroll-with-animation="true"
    >
      <view class="chat-inner">
      <!-- 欢迎界面（无消息时） -->
      <view v-if="messages.length === 0" class="welcome-wrap">
        <view class="welcome-bot">🤖</view>
        <text class="welcome-title">你好，我是AI健康助手</text>
        <text class="welcome-desc">基于你的健康档案，为你提供个性化饮食与运动建议</text>
        <view class="quick-list">
          <view
            v-for="(q, qi) in quickQuestions"
            :key="qi"
            class="quick-item"
            @click="sendQuickQuestion(q)"
          >
            <text class="quick-text">{{ q }}</text>
          </view>
        </view>
      </view>

      <!-- 消息列表 -->
      <view
        v-for="(msg, idx) in messages"
        :key="msg._localId || idx"
        :id="'msg-' + idx"
      >
        <!-- 用户消息（右侧） -->
        <view v-if="msg.role === 'user'" class="msg-row msg-user">
          <view class="bubble bubble-user">
            <text class="bubble-text">{{ msg.content }}</text>
          </view>
          <image :src="userAvatar" class="msg-avatar" mode="aspectFill" @error="onUserAvatarError" />
        </view>

        <!-- AI消息（左侧） -->
        <view v-else class="msg-row msg-ai">
          <view class="ai-avatar-wrap">
            <text class="ai-avatar-emoji">🤖</text>
          </view>
          <view class="ai-msg-body">
            <!-- 思考过程折叠卡片 -->
            <view v-if="msg.thinking || msg._thinkingLoading" class="thinking-card">
              <view class="thinking-hd" @click="toggleThinking(idx)">
                <text class="thinking-icon">💭</text>
                <text class="thinking-label">{{ msg.loading ? '思考中' : '思考过程' }}</text>
                <text v-if="msg.loading" class="thinking-preview">{{ msg.thinking }}</text>
                <text class="thinking-arrow">{{ msg._showThinking ? '▲' : '▼' }}</text>
              </view>
              <view v-if="msg._showThinking" class="thinking-bd">
                <text class="thinking-text" :user-select="true">{{ formatThinkingContent(msg.thinking) }}</text>
              </view>
            </view>
            <!-- AI回复气泡 -->
            <view class="bubble bubble-ai" :class="{ 'bubble-loading': msg.loading }">
              <view v-if="msg.loading" class="dot-wrap">
                <view class="dot dot1"></view>
                <view class="dot dot2"></view>
                <view class="dot dot3"></view>
              </view>
              <text v-else class="bubble-text" :user-select="true">{{ formatAssistantContent(msg.content) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部锚点 -->
      <view id="msg-bottom" style="height: 16rpx;"></view>
      </view>
    </scroll-view>

    <!-- 输入区 -->
    <view class="input-area">
      <!-- 输入行 -->
      <view class="input-row">
        <textarea
          class="msg-input"
          v-model="inputText"
          placeholder="问点关于健康的事情…"
          :maxlength="500"
          :auto-height="true"
          :disabled="isLoading"
          confirm-type="send"
          @confirm="sendMessage"
        />
      </view>
      <view class="input-footer">
        <text class="char-tip">{{ inputText.length }}/500</text>
        <view
          class="send-btn"
          :class="{ 'send-active': inputText.trim() && !isLoading }"
          @click="sendMessage"
        >
          <text class="send-txt">{{ isLoading ? '…' : '发送' }}</text>
        </view>
      </view>
    </view>

    <!-- 历史会话按钮（右上角，仅欢迎页显示） -->
    <view v-if="messages.length === 0" class="fab-btn fab-top-right" @click="goToHistory">
      <text class="fab-icon">📋</text>
    </view>
    <!-- 新建对话按钮（左上角，仅在有消息时显示） -->
    <view v-if="messages.length > 0" class="fab-btn fab-top-left" @click="handleNewChat">
      <text class="fab-icon">➕</text>
    </view>

  </view>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// ── 常量 ──────────────────────────────────────────
const quickQuestions = [
  '根据我的问卷信息帮我生成详细完整的每周饮食方案和运动计划',
  '帮我制定一周减脂饮食计划',
  '适合我的有氧运动有哪些？',
  '怎样改善睡眠质量？',
  '如何科学补充蛋白质？'
]

// ── 后端 API 配置 ──────────────────────────────────────────
  import { BASE_URL } from '@/config.js'

function getToken() {
  return uni.getStorageSync('token') || ''
}

// ── 状态 ──────────────────────────────────────────
const messages = ref([])
const inputText = ref('')
const isLoading = ref(false)
const scrollTarget = ref('')

const currentSessionId = ref('')
const currentSessionTitle = ref('')
// 标记是否是从历史页面跳转进来的（用于 ➕ 按钮行为）
const isFromHistory = ref(false)

const userAvatar = ref('/static/logo.png')

let _localIdCounter = 0
function nextLocalId() {
  return 'local-' + (++_localIdCounter)
}

function getResponseMessage(body) {
  return (body && (body.message || body.msg)) || ''
}

function formatAssistantContent(text) {
  if (!text) return ''
  let s = String(text)
  // 兼容后端/模型返回的转义换行与异常换行标记
  s = s.replace(/\\r\\n|\\n|\\r/g, '\n')
  s = s.replace(/nn(?=\s*\d+[\.、])/g, '\n\n')
  s = s.replace(/nn(?=\s*[\u4e00-\u9fa5])/g, '\n\n')
  // 移除模型可能混入的思考标签
  s = s.replace(/<think>[\s\S]*?<\/think>/gi, '')
  s = s.replace(/<\/?think>/gi, '')
  // 去掉 Markdown 标题前缀（#、##、###...）
  s = s.replace(/^\s{0,3}#{1,6}\s*/gm, '')
  // 去掉 Markdown 分隔线
  s = s.replace(/^\s{0,3}(-{3,}|\*{3,}|_{3,})\s*$/gm, '')
  // 去掉 Markdown 粗体标记
  s = s.replace(/\*\*/g, '')
  // 合并过多空行
  s = s.replace(/\n{3,}/g, '\n\n')
  return s.trim()
}

function formatThinkingContent(text) {
  if (!text) return ''
  let s = String(text)
  s = s.replace(/\\r\\n|\\n|\\r/g, '\n')
  s = s.replace(/<\/?think>/gi, '')
  return s.trim()
}

function onUserAvatarError() {
  userAvatar.value = '/static/logo.png'
}

// ── 初始化 ──────────────────────────────────────────
onMounted(() => {
  try {
    const info = uni.getStorageSync('userInfo')
    if (info && info.avatar) userAvatar.value = info.avatar
  } catch (_) {}
})

// 接收路由参数（从历史页面跳转时携带 sessionId 和 title）
onLoad((options) => {
  if (options && options.sessionId) {
    isFromHistory.value = true
    loadSession(options.sessionId, decodeURIComponent(options.title || ''))
  }
})

// ── 工具函数 ──────────────────────────────────────────
function scrollToBottom() {
  nextTick(() => {
    scrollTarget.value = 'msg-bottom'
    setTimeout(() => { scrollTarget.value = 'msg-bottom' }, 50)
  })
}

function toggleThinking(idx) {
  const msg = messages.value[idx]
  if (msg) msg._showThinking = !msg._showThinking
}

const thinkingStages = ['正在分析问题', '正在结合健康档案', '正在组织建议结构']
let thinkingTimer = null

function startThinkingAnimation(idx) {
  stopThinkingAnimation()
  let tick = 0
  thinkingTimer = setInterval(() => {
    const msg = messages.value[idx]
    if (!msg || !msg.loading) {
      stopThinkingAnimation()
      return
    }
    const stage = thinkingStages[Math.floor(tick / 4) % thinkingStages.length]
    const dots = '.'.repeat((tick % 3) + 1)
    msg.thinking = `${stage}${dots}`
    msg._thinkingLoading = true
    tick += 1
  }, 450)
}

function stopThinkingAnimation() {
  if (thinkingTimer) {
    clearInterval(thinkingTimer)
    thinkingTimer = null
  }
}

onUnmounted(() => {
  stopThinkingAnimation()
})

// ── 会话管理 ──────────────────────────────────────────
function loadSession(sessionId, title) {
  currentSessionId.value = sessionId
  const displayTitle = title || '历史对话'
  currentSessionTitle.value = displayTitle
  uni.setNavigationBarTitle({ title: displayTitle })

  const token = getToken()
  if (!token) return

  uni.request({
    url: BASE_URL + '/api/ai/sessions/' + encodeURIComponent(sessionId) + '/history',
    method: 'GET',
    header: { Authorization: 'Bearer ' + token },
    success(res) {
      if (res.data && res.data.code === 200 && Array.isArray(res.data.data)) {
        messages.value = res.data.data.map(m => ({
          _localId: nextLocalId(),
          role: m.role,
          content: m.content || '',
          thinking: m.thinking || '',
          _thinkingLoading: false,
          _showThinking: false
        }))
        scrollToBottom()
      } else {
        uni.showToast({ title: getResponseMessage(res.data) || '历史记录加载失败', icon: 'none' })
      }
    },
    fail() {
      uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' })
    }
  })
}

function goToHistory() {
  uni.navigateTo({ url: '/pages/home/ai_history' })
}

function handleNewChat() {
  messages.value = []
  currentSessionId.value = ''
  currentSessionTitle.value = ''
  isFromHistory.value = false
  uni.setNavigationBarTitle({ title: 'AI对话' })
}

// ── 发消息 ──────────────────────────────────────────
function sendQuickQuestion(q) {
  inputText.value = q
  sendMessage()
}

function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isLoading.value) return

  const token = getToken()
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  messages.value.push({ _localId: nextLocalId(), role: 'user', content: text })
  inputText.value = ''
  scrollToBottom()

  const loadingMsg = {
    _localId: nextLocalId(),
    role: 'assistant',
    content: '',
    loading: true,
    thinking: '正在思考.',
    _thinkingLoading: true,
    _showThinking: false
  }
  messages.value.push(loadingMsg)
  const loadingIdx = messages.value.length - 1
  startThinkingAnimation(loadingIdx)
  scrollToBottom()

  isLoading.value = true

  uni.request({
    url: BASE_URL + '/api/ai/chat',
    method: 'POST',
    header: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    data: {
      sessionId: currentSessionId.value || '',
      message: text
    },
    timeout: 120000,
    success(res) {
      stopThinkingAnimation()
      isLoading.value = false
      const body = res.data || {}
      if (res.data && res.data.code === 200 && res.data.data) {
        const data = body.data
        if (!currentSessionId.value) {
          currentSessionId.value = data.sessionId
          const title = text.length > 15 ? text.slice(0, 15) + '…' : text
          currentSessionTitle.value = title
          uni.setNavigationBarTitle({ title })
        }
        if (loadingIdx < 0 || loadingIdx >= messages.value.length) return
        messages.value[loadingIdx] = {
          _localId: loadingMsg._localId,
          role: 'assistant',
          content: data.content || '',
          thinking: formatThinkingContent(data.thinking || ''),
          _thinkingLoading: false,
          _showThinking: false,
          loading: false
        }
      } else {
        if (loadingIdx < 0 || loadingIdx >= messages.value.length) return
        messages.value[loadingIdx] = {
          _localId: loadingMsg._localId,
          role: 'assistant',
          content: getResponseMessage(body) || '回复失败，请稍后重试',
          thinking: '',
          _thinkingLoading: false,
          _showThinking: false,
          loading: false
        }
      }
      scrollToBottom()
    },
    fail(err) {
      stopThinkingAnimation()
      isLoading.value = false
      const isTimeout = err && (err.errMsg || '').includes('timeout')
      if (loadingIdx < 0 || loadingIdx >= messages.value.length) return
      messages.value[loadingIdx] = {
        _localId: loadingMsg._localId,
        role: 'assistant',
        content: isTimeout ? 'AI响应超时，请稍后再试' : '网络异常，请检查网络后重试',
        thinking: '',
        _thinkingLoading: false,
        _showThinking: false,
        loading: false
      }
      scrollToBottom()
    }
  })
}
</script>
<style scoped>
/* ── 页面根容器 ── */
.ai-chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f6fa;
  overflow: hidden;
}

/* ── 悬浮按钮 ── */
.fab-btn {
  position: fixed;
  top: calc(var(--window-top) + 20rpx);
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4e9afe 0%, #6c63ff 100%);
  box-shadow: 0 4rpx 16rpx rgba(78, 154, 254, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.fab-top-right {
  right: 24rpx;
}
.fab-top-left {
  left: 24rpx;
}
.fab-icon {
  font-size: 36rpx;
}
.nav-icon {
  font-size: 28rpx;
}
.nav-text {
  font-size: 24rpx;
  color: #666;
}

/* ── 聊天主体 ── */
.chat-body {
  flex: 1;
  overflow: hidden;
}
.chat-inner {
  padding: 20rpx 20rpx 0;
  box-sizing: border-box;
  width: 100%;
}

/* ── 欢迎页 ── */
.welcome-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx 40rpx;
}
.welcome-bot {
  font-size: 100rpx;
  margin-bottom: 24rpx;
}
.welcome-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16rpx;
}
.welcome-desc {
  font-size: 26rpx;
  color: #888;
  text-align: center;
  margin-bottom: 48rpx;
  line-height: 1.6;
}
.quick-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  width: 100%;
}
.quick-item {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx 32rpx;
  border: 1rpx solid #e8eaf0;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}
.quick-text {
  font-size: 27rpx;
  color: #4e9afe;
}

/* ── 消息行 ── */
.msg-row {
  display: flex;
  align-items: flex-end;
  margin-bottom: 24rpx;
  gap: 12rpx;
}
.msg-user {
  flex-direction: row-reverse;
}
.msg-ai {
  flex-direction: row;
}
.msg-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  flex-shrink: 0;
  background: #dde6f5;
}
.ai-avatar-wrap {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4e9afe 0%, #6c63ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ai-avatar-emoji {
  font-size: 34rpx;
}

/* ── 气泡 ── */
.bubble {
  max-width: 72vw;
  padding: 20rpx 26rpx;
  border-radius: 24rpx;
  font-size: 28rpx;
  line-height: 1.65;
  word-break: break-word;
}
.bubble-user {
  background: #4e9afe;
  color: #fff;
  border-bottom-right-radius: 6rpx;
}
.bubble-ai {
  background: #fff;
  color: #222;
  border: 1rpx solid #e8eaf0;
  border-bottom-left-radius: 6rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04);
}
.bubble-loading {
  padding: 24rpx 32rpx;
}
.bubble-text {
  white-space: pre-wrap;
}

/* AI消息包含思考卡片时的布局 */
.ai-msg-body {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
  max-width: 72vw;
}

/* ── 思考过程卡片 ── */
.thinking-card {
  background: #f8f9ff;
  border: 1rpx solid #dde6f5;
  border-radius: 16rpx;
  overflow: hidden;
}
.thinking-hd {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 20rpx;
  cursor: pointer;
}
.thinking-icon {
  font-size: 26rpx;
}
.thinking-label {
  font-size: 24rpx;
  color: #6c63ff;
  font-weight: 500;
  flex-shrink: 0;
}
.thinking-preview {
  flex: 1;
  font-size: 22rpx;
  color: #7a8ba0;
  margin-left: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.thinking-arrow {
  font-size: 20rpx;
  color: #999;
  margin-left: 8rpx;
}
.thinking-bd {
  padding: 0 20rpx 16rpx;
  border-top: 1rpx solid #e8eaf0;
}
.thinking-text {
  font-size: 23rpx;
  color: #888;
  line-height: 1.7;
  white-space: pre-wrap;
}

/* ── 打点加载动画 ── */
.dot-wrap {
  display: flex;
  gap: 8rpx;
  align-items: center;
}
.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: #aaa;
  animation: bounce 1.2s infinite;
}
.dot2 { animation-delay: 0.2s; }
.dot3 { animation-delay: 0.4s; }
@keyframes bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
  40% { transform: translateY(-10rpx); opacity: 1; }
}

/* ── 输入区 ── */
.input-area {
  background: #fff;
  border-top: 1rpx solid #eee;
  padding: 16rpx 20rpx 20rpx;
  flex-shrink: 0;
}
.input-row {
  display: flex;
  align-items: flex-end;
  gap: 12rpx;
}
.msg-input {
  flex: 1;
  min-height: 72rpx;
  max-height: 200rpx;
  font-size: 28rpx;
  color: #222;
  background: #f5f6fa;
  border-radius: 18rpx;
  padding: 18rpx 22rpx;
  box-sizing: border-box;
  line-height: 1.5;
}
.input-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16rpx;
  margin-top: 12rpx;
}
.char-tip {
  font-size: 22rpx;
  color: #bbb;
}
.send-btn {
  min-width: 120rpx;
  height: 64rpx;
  border-radius: 32rpx;
  background: #d0dff7;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 32rpx;
}
.send-active {
  background: #4e9afe;
}
.send-txt {
  font-size: 28rpx;
  color: #fff;
  font-weight: 500;
}

/* ── 历史会话抽屉 ── */
.drawer-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
}
.session-drawer {
  width: 72vw;
  max-width: 560rpx;
  height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  border-radius: 0;
}
.drawer-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 32rpx 24rpx;
  border-bottom: 1rpx solid #eee;
  flex-shrink: 0;
}
.drawer-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1a1a1a;
}
.drawer-close {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #f5f6fa;
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-icon {
  font-size: 26rpx;
  color: #888;
}
.session-scroll {
  flex: 1;
  overflow: hidden;
}
.no-session {
  display: flex;
  justify-content: center;
  padding: 60rpx 0;
}
.no-session-txt {
  font-size: 26rpx;
  color: #bbb;
}
.session-item {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid #f0f2f5;
}
.session-active {
  background: #f0f6ff;
}
.session-info {
  flex: 1;
  min-width: 0;
}
.session-t {
  font-size: 28rpx;
  color: #222;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  margin-bottom: 6rpx;
}
.session-active .session-t {
  color: #4e9afe;
  font-weight: 500;
}
.session-time {
  font-size: 22rpx;
  color: #bbb;
}
.session-del {
  padding: 8rpx 12rpx;
}
.del-icon {
  font-size: 30rpx;
}
</style>