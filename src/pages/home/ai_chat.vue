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
const MESSAGES_STORAGE_KEY = 'aiChatMessages'
const PLAN_STORAGE_KEY = 'myPlan'

onMounted(() => {
  // 读取本地存储的对话历史
  try {
    const savedMessages = uni.getStorageSync(MESSAGES_STORAGE_KEY)
    if (savedMessages && Array.isArray(savedMessages) && savedMessages.length > 0) {
      messages.value = savedMessages
      // 滚动到最后一条消息
      nextTick(() => {
        scrollIntoView.value = 'msg-' + (messages.value.length - 1)
      })
    }
  } catch (e) {
    console.warn('读取对话历史失败:', e)
  }
  
  // 读取本地存储的问卷数据
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
  saveMessages()
  scrollToBottom()
  callAI(val)
}

function saveMessages() {
  try {
    uni.setStorageSync(MESSAGES_STORAGE_KEY, messages.value)
  } catch (e) {
    console.warn('保存对话历史失败:', e)
  }
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
  let systemPrompt = '你是一个专业的健康助手，擅长根据用户的健康信息提供专业的饮食和运动建议。'
  if (questionnaireData) {
    systemPrompt = `你是一个专业的健康助手。用户的健康信息如下：${JSON.stringify(questionnaireData)}\n请根据用户的健康状况、目标和习惯，提供科学、可行的健康建议。`
  }
  
  // TODO: 将 'your_appKey' 替换为您实际的ShowAPI appKey
  const appKey = 'C2A8270aB8334d1FA159BCa74De5e0B7'
  const apiUrl = `https://route.showapi.com/3257-1?appKey=${appKey}`
  
  uni.request({
    url: apiUrl,
    method: 'POST',
    header: {
      'Content-Type': 'application/json'
    },
    data: {
      model: 'deepseek-r1-distill-qwen-32b',
      stream: false,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      temperature: 0.3
    },
    success: (res) => {
      console.log('AI响应完整内容:', res)
      console.log('状态码:', res.statusCode)
      console.log('响应数据:', res.data)
      
      const idx = messages.value.findIndex(m => m.content === '生成中……' && m.role === 'assistant')
      if (idx !== -1) {
        try {
          // 判断响应格式：ShowAPI 格式 或 标准 OpenAI 格式
          if (res.data.showapi_res_code !== undefined) {
            // ShowAPI 格式
            if (res.data.showapi_res_code === 0) {
              const content = res.data?.showapi_res_body?.choices?.[0]?.message?.content || 'AI暂无回复'
              messages.value[idx].content = content
              // 保存对话历史
              saveMessages()
              // 自动提取饮食和运动计划
              extractAndSavePlan(content)
            } else {
              const errorMsg = res.data.showapi_res_error || `调用失败(错误码: ${res.data.showapi_res_code})`
              messages.value[idx].content = `抱歉，${errorMsg}`
              console.error('ShowAPI错误:', { code: res.data.showapi_res_code, error: res.data.showapi_res_error })
              uni.showToast({ title: errorMsg, icon: 'none', duration: 2000 })
            }
          } else if (res.data.choices && Array.isArray(res.data.choices)) {
            // 标准 OpenAI 格式响应
            const content = res.data.choices[0]?.message?.content || 'AI暂无回复'
            messages.value[idx].content = content
            console.log('成功获取AI回复(OpenAI格式)')
            // 保存对话历史
            saveMessages()
            // 自动提取饮食和运动计划
            extractAndSavePlan(content)
          } else {
            // 未知格式
            messages.value[idx].content = '抱歉，API返回格式异常'
            console.error('未知的响应格式:', res.data)
            uni.showToast({ title: '返回格式异常', icon: 'none', duration: 2000 })
          }
        } catch (e) {
          console.error('解析响应出错:', e)
          messages.value[idx].content = `解析错误: ${e.message}`
          uni.showToast({ title: '解析响应失败', icon: 'none', duration: 2000 })
        }
      }
      scrollToBottom()
    },
    fail: (err) => {
      console.error('请求失败:', err)
      const idx = messages.value.findIndex(m => m.content === '生成中……' && m.role === 'assistant')
      if (idx !== -1) {
        messages.value[idx].content = `网络异常，请稍后重试。(${err.errMsg || '未知错误'})`
      }
      scrollToBottom()
      uni.showToast({
        title: '网络请求失败',
        icon: 'none',
        duration: 2000
      })
    }
  })
}

function extractAndSavePlan(content) {
  if (!content) return
  
  try {
    const planData = {}
    
    // 提取饮食方案 - 从"### **饮食方案**"到下一个"###"或文末
    let dietMatch = content.match(/### \*\*饮食方案\*\*([\s\S]*?)(?=###|$)/)
    if (dietMatch) {
      let diet = dietMatch[1].trim()
      // 转换 Markdown 四级标题为纯文本（保留所有内容）
      diet = diet.replace(/#### \*\*([^*]+)\*\*：/g, '$1：')
      diet = diet.replace(/#### \*\*([^*]+)\*\*/g, '$1')
      // 去掉开头的空行
      diet = diet.replace(/^\n+/, '')
      if (diet) planData.diet = diet
    }
    
    // 提取运动方案 - 从"### **运动方案**"到下一个"###"或文末
    let exerciseMatch = content.match(/### \*\*运动方案\*\*([\s\S]*?)(?=###|$)/)
    if (exerciseMatch) {
      let exercise = exerciseMatch[1].trim()
      // 转换 Markdown 四级标题为纯文本（保留所有内容）
      exercise = exercise.replace(/#### \*\*([^*]+)\*\*：/g, '$1：')
      exercise = exercise.replace(/#### \*\*([^*]+)\*\*/g, '$1')
      // 去掉开头的空行
      exercise = exercise.replace(/^\n+/, '')
      if (exercise) planData.exercise = exercise
    }
    
    // 如果没有匹配到标准格式，尝试备选方案
    if (!planData.diet && !planData.exercise) {
      // 尝试匹配 ## 的标题
      let dietMatch2 = content.match(/## \*?\*?饮食\*?\*?([\s\S]*?)(?=##|###|$)/)
      if (dietMatch2) {
        let diet = dietMatch2[1].trim().replace(/^\n+/, '')
        diet = diet.replace(/#### \*\*([^*]+)\*\*：/g, '$1：')
        diet = diet.replace(/#### \*\*([^*]+)\*\*/g, '$1')
        if (diet) planData.diet = diet
      }
      
      let exerciseMatch2 = content.match(/## \*?\*?运动\*?\*?([\s\S]*?)(?=##|###|$)/)
      if (exerciseMatch2) {
        let exercise = exerciseMatch2[1].trim().replace(/^\n+/, '')
        exercise = exercise.replace(/#### \*\*([^*]+)\*\*：/g, '$1：')
        exercise = exercise.replace(/#### \*\*([^*]+)\*\*/g, '$1')
        if (exercise) planData.exercise = exercise
      }
    }
    
    // 如果成功提取至少一个计划，保存到本地
    if (Object.keys(planData).length > 0) {
      const existingPlan = uni.getStorageSync(PLAN_STORAGE_KEY) || {}
      const updatedPlan = { ...existingPlan, ...planData }
      uni.setStorageSync(PLAN_STORAGE_KEY, updatedPlan)
      console.log('饮食运动方案已保存:', updatedPlan)
    }
  } catch (e) {
    console.warn('提取和保存方案失败:', e)
  }
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