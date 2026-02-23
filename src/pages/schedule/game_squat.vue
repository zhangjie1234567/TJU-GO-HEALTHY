<template>
  <view class="container">
    <!-- 欢迎画面 -->
    <view v-if="gameState === 'welcome'" class="welcome-screen">
      <view class="logo-section">
        <text class="game-icon">🏋️</text>
        <text class="game-title">智能深蹲挑战</text>
      </view>
      
      <view class="info-box">
        <view class="info-item">
          <text class="info-icon">📱</text>
          <text class="info-text">双手平举握持手机</text>
        </view>
        <view class="info-item">
          <text class="info-icon">⬇️</text>
          <text class="info-text">完成深蹲动作</text>
        </view>
        <view class="info-item">
          <text class="info-icon">💪</text>
          <text class="info-text">自动识别并计数</text>
        </view>
      </view>
      
      <view class="start-btn" @click="startGame">
        开始挑战
      </view>
      
      <view class="best-record">
        <text class="record-label">个人最佳</text>
        <text class="record-value">{{ bestRecord }}</text>
      </view>
    </view>

    <!-- 倒计时画面 -->
    <view v-else-if="gameState === 'countdown'" class="countdown-screen">
      <view class="countdown-text">{{ countdown }}</view>
      <text class="countdown-desc">准备好了吗？</text>
    </view>

    <!-- 游戏进行中 -->
    <view v-else-if="gameState === 'playing'" class="game-screen">
      <!-- 顶部信息 -->
      <view class="top-info">
        <view class="stat-item">
          <text class="stat-label">⏱️ 时长</text>
          <text class="stat-value">{{ formatTime(duration) }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">🔥 卡路里</text>
          <text class="stat-value">{{ calories }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">⚡ 速率</text>
          <text class="stat-value">{{ squatRate }}/分</text>
        </view>
      </view>

      <!-- 中央计数和呼吸灯 -->
      <view class="counter-section">
        <view class="breathing-circle">
          <view class="pulse-ring pulse-1"></view>
          <view class="pulse-ring pulse-2"></view>
          <view class="inner-display">
            <text class="counter-value">{{ squatCount }}</text>
            <text class="counter-unit">下</text>
          </view>
        </view>
      </view>

      <!-- 实时加速度显示 -->
      <view class="status-display">
        <text class="status-text" :class="{ active: isMoving }">{{ statusText }}</text>
      </view>

      <!-- 动态波形图 -->
      <view class="waveform-section">
        <canvas id="waveformCanvas" class="waveform-canvas"></canvas>
        <text class="wave-label">重力加速度波形</text>
      </view>

      <!-- 粒子效果 -->
      <view v-for="particle in particles" :key="particle.id" 
            class="particle" 
            :style="{ left: particle.x + 'px', top: particle.y + 'px', opacity: particle.opacity }">
      </view>

      <!-- 结束按钮 -->
      <view class="game-footer">
        <view class="finish-btn" @click="finishGame">结束运动</view>
      </view>
    </view>

    <!-- 结果报告 -->
    <view v-else-if="gameState === 'finished'" class="result-screen">
      <view class="result-header">
        <text class="result-emoji">🎉</text>
        <text class="result-title">运动成果统计</text>
      </view>

      <view class="result-stats">
        <view class="result-card primary">
          <text class="card-label">总次数</text>
          <text class="card-value">{{ squatCount }}</text>
          <text class="card-unit">次</text>
        </view>

        <view class="result-card">
          <text class="card-label">坚持时长</text>
          <text class="card-value">{{ formatTime(duration) }}</text>
        </view>

        <view class="result-card">
          <text class="card-label">消耗卡路里</text>
          <text class="card-value">{{ calories }}</text>
          <text class="card-unit">kcal</text>
        </view>

        <view class="result-card">
          <text class="card-label">平均速率</text>
          <text class="card-value">{{ squatRate }}</text>
          <text class="card-unit">次/分</text>
        </view>
      </view>

      <view class="achievement-box">
        <text class="achievement-title">🏆 成就达成</text>
        <view class="achievement-list">
          <view v-if="squatCount >= 10" class="achievement-badge">
            <text class="badge-icon">🌟</text>
            <text class="badge-text">坚持10次</text>
          </view>
          <view v-if="squatCount >= 30" class="achievement-badge">
            <text class="badge-icon">💪</text>
            <text class="badge-text">深蹲达人</text>
          </view>
          <view v-if="squatCount >= 50" class="achievement-badge">
            <text class="badge-icon">🔥</text>
            <text class="badge-text">健身狂人</text>
          </view>
          <view v-if="duration >= 60" class="achievement-badge">
            <text class="badge-icon">⏰</text>
            <text class="badge-text">坚持一分钟</text>
          </view>
        </view>
      </view>

      <view class="ranking-box">
        <text class="ranking-title">📊 排名信息</text>
        <text class="ranking-text">超越了 {{ percentile }}% 的用户</text>
      </view>

      <view class="result-actions">
        <view class="action-btn secondary" @click="goBack">← 返回</view>
        <view class="action-btn primary" @click="startGame">再来一次</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 游戏状态管理
const gameState = ref('welcome') // welcome, countdown, playing, finished
const squatCount = ref(0)
const duration = ref(0)
const countdown = ref(3)
const bestRecord = ref(0)
const particles = ref([])
let particleId = 0

// 计算属性
const calories = computed(() => Math.round(squatCount.value * 0.15))
const squatRate = computed(() => {
  const minutes = Math.max(duration.value / 60, 0.01)
  return Math.round(squatCount.value / minutes)
})
const percentile = computed(() => {
  const basePercentile = Math.min(Math.round((squatCount.value / 100) * 100), 99)
  return basePercentile
})

// 传感器数据
const accelerometerData = ref({ x: 0, y: 0, z: 0 })
const yAxisHistory = ref([])
const isMoving = ref(false)
const statusText = computed(() => {
  if (!isMoving.value) return '准备好了'
  return '动作进行中...'
})

// 动作识别参数
const MAX_HISTORY = 15
const SQUAT_DOWN_THRESHOLD = 0.25 // 下蹲阈值
const SQUAT_UP_THRESHOLD = -0.2 // 起立阈值
let lastCountTime = 0
const DEBOUNCE_TIME = 600 // ms，防抖时间增加到避免误判

let isInDownPhase = false
let timerInterval = null
let sensorSubscription = null
let canvasCtx = null
let waveIndex = 0
let frameCount = 0

// 加载本地最佳记录
onMounted(() => {
  try {
    const saved = uni.getStorageSync('squat_best_record')
    if (saved) {
      bestRecord.value = saved
    }
  } catch (e) {
    console.error('加载最佳记录失败', e)
  }
})

const goBack = () => {
  uni.navigateBack()
}

const startGame = () => {
  gameState.value = 'countdown'
  countdown.value = 3
  
  const countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value < 0) {
      clearInterval(countdownTimer)
      gameState.value = 'playing'
      squatCount.value = 0
      duration.value = 0
      yAxisHistory.value = []
      isInDownPhase = false
      lastCountTime = 0
      frameCount = 0
      
      startSensor()
      startTimer()
      initCanvasWaveform()
    }
  }, 1000)
}

const startSensor = () => {
  // 监听加速度传感器
  uni.onAccelerometerChange((res) => {
    accelerometerData.value = {
      x: res.x || 0,
      y: res.y || 0,
      z: res.z || 0
    }

    // 保存历史数据
    yAxisHistory.value.push(res.y || 0)
    if (yAxisHistory.value.length > MAX_HISTORY) {
      yAxisHistory.value.shift()
    }

    // 检测动作
    detectSquatMotion()

    // 更新波形
    if (canvasCtx) {
      updateWaveform(res.y || 0)
    }

    // 检测是否在动
    const recentData = yAxisHistory.value.slice(-5)
    const variance = calculateVariance(recentData)
    isMoving.value = variance > 0.01
  })
}

const detectSquatMotion = () => {
  if (yAxisHistory.value.length < 3) return

  const current = accelerometerData.value.y
  const prev = yAxisHistory.value[yAxisHistory.value.length - 2]
  const change = current - prev

  // 强加速度变化 = 下蹲
  if (change > SQUAT_DOWN_THRESHOLD && !isInDownPhase) {
    isInDownPhase = true
  }
  // 减速度变化 = 起立
  else if (change < SQUAT_UP_THRESHOLD && isInDownPhase) {
    // 完成一次完整的下蹲+起立
    const now = Date.now()
    if (now - lastCountTime > DEBOUNCE_TIME) {
      squatCount.value++
      lastCountTime = now

      // 触发反馈
      triggerFeedback()
    }
    isInDownPhase = false
  }
}

const triggerFeedback = () => {
  // 震动反馈
  uni.vibrateShort()

  // 粒子爆炸效果
  createParticles()
}

const createParticles = () => {
  const centerX = 750 / 2 // 屏幕中心（rpx转px，以375为基准）
  const centerY = 600

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2
    const speed = 2 + Math.random() * 2
    const vx = Math.cos(angle) * speed
    const vy = Math.sin(angle) * speed

    const particle = {
      id: particleId++,
      x: centerX,
      y: centerY,
      vx: vx,
      vy: vy,
      opacity: 1,
      life: 0
    }

    particles.value.push(particle)

    // 动画帧更新
    const startTime = Date.now()
    const updateParticle = () => {
      const elapsed = Date.now() - startTime
      if (elapsed > 500) {
        particles.value = particles.value.filter(p => p.id !== particle.id)
        return
      }

      const progress = elapsed / 500
      particle.x += particle.vx
      particle.y += particle.vy
      particle.vy += 0.1 // 重力
      particle.opacity = 1 - progress

      requestAnimationFrame(updateParticle)
    }

    updateParticle()
  }
}

const initCanvasWaveform = () => {
  const canvas = document.getElementById('waveformCanvas')
  if (!canvas) return

  canvasCtx = canvas.getContext('2d')
  const dpr = uni.getSystemInfoSync().pixelRatio || 1
  
  canvas.width = canvas.offsetWidth * dpr
  canvas.height = canvas.offsetHeight * dpr
  canvasCtx.scale(dpr, dpr)

  waveIndex = 0
}

const updateWaveform = (yValue) => {
  if (!canvasCtx) return

  frameCount++
  if (frameCount % 3 === 0) return // 每3帧更新一次

  const canvas = document.getElementById('waveformCanvas')
  if (!canvas) return

  const width = canvas.offsetWidth
  const height = canvas.offsetHeight
  const centerY = height / 2

  // 清空画布
  canvasCtx.fillStyle = 'rgba(26, 26, 46, 0.5)'
  canvasCtx.fillRect(0, 0, width, height)

  // 绘制波形
  canvasCtx.strokeStyle = '#4FA1F2'
  canvasCtx.lineWidth = 2
  canvasCtx.beginPath()

  const scale = 50
  for (let i = 0; i < yAxisHistory.value.length; i++) {
    const x = (i / MAX_HISTORY) * width
    const y = centerY - (yAxisHistory.value[i] * scale)
    
    if (i === 0) {
      canvasCtx.moveTo(x, y)
    } else {
      canvasCtx.lineTo(x, y)
    }
  }

  canvasCtx.stroke()

  // 绘制填充区域
  canvasCtx.lineTo(width, centerY)
  canvasCtx.lineTo(0, centerY)
  canvasCtx.closePath()
  canvasCtx.fillStyle = 'rgba(79, 161, 242, 0.1)'
  canvasCtx.fill()

  // 绘制实时点
  if (yAxisHistory.value.length > 0) {
    const lastY = yAxisHistory.value[yAxisHistory.value.length - 1]
    const x = width - 10
    const y = centerY - (lastY * scale)

    canvasCtx.fillStyle = '#FF6B6B'
    canvasCtx.beginPath()
    canvasCtx.arc(x, y, 4, 0, Math.PI * 2)
    canvasCtx.fill()
  }
}

const startTimer = () => {
  timerInterval = setInterval(() => {
    if (gameState.value === 'playing') {
      duration.value++
    }
  }, 1000)
}

const finishGame = () => {
  gameState.value = 'finished'
  stopGame()

  // 保存最佳记录
  if (squatCount.value > bestRecord.value) {
    bestRecord.value = squatCount.value
    try {
      uni.setStorageSync('squat_best_record', bestRecord.value)
    } catch (e) {
      console.error('保存最佳记录失败', e)
    }
  }
}

const stopGame = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  uni.offAccelerometerChange()
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const calculateVariance = (arr) => {
  if (arr.length === 0) return 0
  const mean = arr.reduce((a, b) => a + b) / arr.length
  const variance = arr.reduce((a, b) => a + (b - mean) ** 2) / arr.length
  return Math.sqrt(variance)
}

onUnmounted(() => {
  stopGame()
})
</script>

<style lang="scss" scoped>
$dark-bg: #1A1A2E;
$neon-blue: #4FA1F2;
$vibrant-orange: #FF6B6B;
$dark-text: #E0E0E0;

.container {
  background: $dark-bg;
  min-height: 100vh;
  color: $dark-text;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ===== 欢迎画面 ===== */
.welcome-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 20rpx;
  background: linear-gradient(135deg, $dark-bg 0%, #2A2A4E 100%);

  .logo-section {
    text-align: center;
    margin-bottom: 60rpx;

    .game-icon {
      font-size: 120rpx;
      display: block;
      margin-bottom: 20rpx;
      animation: bounce 2s ease-in-out infinite;
    }

    .game-title {
      font-size: 48rpx;
      font-weight: 700;
      color: $neon-blue;
      text-shadow: 0 0 20rpx rgba(79, 161, 242, 0.5);
    }
  }

  .info-box {
    background: rgba(79, 161, 242, 0.1);
    border: 2rpx solid rgba(79, 161, 242, 0.3);
    border-radius: 20rpx;
    padding: 30rpx 24rpx;
    margin-bottom: 60rpx;
    width: 100%;

    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .info-icon {
        font-size: 40rpx;
        margin-right: 16rpx;
      }

      .info-text {
        font-size: 26rpx;
        color: $dark-text;
      }
    }
  }

  .start-btn {
    background: linear-gradient(135deg, $neon-blue 0%, #80D0FF 100%);
    color: white;
    padding: 20rpx 60rpx;
    border-radius: 28rpx;
    font-size: 32rpx;
    font-weight: 700;
    margin-bottom: 40rpx;
    box-shadow: 0 8rpx 24rpx rgba(79, 161, 242, 0.4);
    transition: all 0.2s ease;

    &:active {
      transform: scale(0.95);
      box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.2);
    }
  }

  .best-record {
    text-align: center;

    .record-label {
      font-size: 20rpx;
      color: #999;
      display: block;
      margin-bottom: 8rpx;
    }

    .record-value {
      font-size: 56rpx;
      font-weight: 700;
      color: $vibrant-orange;
      text-shadow: 0 0 15rpx rgba(255, 107, 107, 0.3);
    }
  }
}

/* ===== 倒计时画面 ===== */
.countdown-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, rgba(79, 161, 242, 0.2), transparent);

  .countdown-text {
    font-size: 200rpx;
    font-weight: 700;
    color: $neon-blue;
    text-shadow: 0 0 40rpx rgba(79, 161, 242, 0.5);
    animation: pulse-count 1s linear;
  }

  .countdown-desc {
    font-size: 32rpx;
    color: #999;
    margin-top: 30rpx;
  }
}

/* ===== 游戏进行中 ===== */
.game-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-info {
  display: flex;
  justify-content: space-around;
  padding: 24rpx 16rpx;
  background: rgba(79, 161, 242, 0.1);
  border-bottom: 1rpx solid rgba(79, 161, 242, 0.2);

  .stat-item {
    text-align: center;
    flex: 1;

    .stat-label {
      font-size: 18rpx;
      color: #888;
      display: block;
      margin-bottom: 6rpx;
    }

    .stat-value {
      font-size: 32rpx;
      font-weight: 700;
      color: $neon-blue;
      text-shadow: 0 0 10rpx rgba(79, 161, 242, 0.4);
    }
  }
}

.counter-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  .breathing-circle {
    position: relative;
    width: 340rpx;
    height: 340rpx;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(79, 161, 242, 0.2), rgba(79, 161, 242, 0.05));
    border: 3rpx solid $neon-blue;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 0 40rpx rgba(79, 161, 242, 0.2),
                0 0 60rpx rgba(79, 161, 242, 0.3);

    .pulse-ring {
      position: absolute;
      border-radius: 50%;
      border: 2rpx solid $neon-blue;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      &.pulse-1 {
        width: 100%;
        height: 100%;
        animation: pulse-ring 1.5s ease-out infinite;
      }

      &.pulse-2 {
        width: 85%;
        height: 85%;
        animation: pulse-ring 1.5s ease-out infinite 0.5s;
      }
    }

    .inner-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 2;

      .counter-value {
        font-size: 140rpx;
        font-weight: 700;
        color: $neon-blue;
        text-shadow: 0 0 30rpx rgba(79, 161, 242, 0.6),
                     0 0 60rpx rgba(79, 161, 242, 0.3);
        line-height: 1;
      }

      .counter-unit {
        font-size: 32rpx;
        color: #888;
        margin-top: 8rpx;
      }
    }
  }
}

.status-display {
  text-align: center;
  padding: 12rpx 20rpx;
  margin: 0 20rpx 12rpx;
  background: rgba(255, 107, 107, 0.1);
  border: 1rpx solid rgba(255, 107, 107, 0.3);
  border-radius: 12rpx;

  .status-text {
    font-size: 20rpx;
    color: #888;
    transition: all 0.2s ease;

    &.active {
      color: $vibrant-orange;
      font-weight: 600;
    }
  }
}

.waveform-section {
  padding: 12rpx 16rpx;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1rpx solid rgba(79, 161, 242, 0.2);
  border-bottom: 1rpx solid rgba(79, 161, 242, 0.2);

  .waveform-canvas {
    width: 100%;
    height: 80rpx;
    display: block;
    border-radius: 8rpx;
  }

  .wave-label {
    font-size: 14rpx;
    color: #666;
    text-align: center;
    display: block;
    margin-top: 6rpx;
  }
}

.particle {
  position: fixed;
  width: 12rpx;
  height: 12rpx;
  background: $neon-blue;
  border-radius: 50%;
  pointer-events: none;
  box-shadow: 0 0 10rpx $neon-blue;
  z-index: 10;
}

.game-footer {
  padding: 16rpx 20rpx 30rpx;
  background: linear-gradient(to top, $dark-bg, transparent);

  .finish-btn {
    background: linear-gradient(135deg, $vibrant-orange 0%, #FF8C8C 100%);
    color: white;
    padding: 16rpx 40rpx;
    border-radius: 24rpx;
    font-size: 28rpx;
    font-weight: 700;
    text-align: center;
    box-shadow: 0 8rpx 20rpx rgba(255, 107, 107, 0.3);

    &:active {
      transform: scale(0.95);
    }
  }
}

/* ===== 结果报告 ===== */
.result-screen {
  flex: 1;
  overflow-y: auto;
  padding: 30rpx 20rpx;

  .result-header {
    text-align: center;
    margin-bottom: 40rpx;

    .result-emoji {
      font-size: 80rpx;
      display: block;
      margin-bottom: 12rpx;
      animation: bounce 0.6s ease-out;
    }

    .result-title {
      font-size: 40rpx;
      font-weight: 700;
      color: $neon-blue;
      text-shadow: 0 0 20rpx rgba(79, 161, 242, 0.4);
    }
  }

  .result-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12rpx;
    margin-bottom: 30rpx;

    .result-card {
      background: rgba(79, 161, 242, 0.1);
      border: 2rpx solid rgba(79, 161, 242, 0.2);
      border-radius: 16rpx;
      padding: 20rpx;
      text-align: center;
      transition: all 0.2s ease;

      &.primary {
        grid-column: 1 / -1;
        background: rgba(79, 161, 242, 0.15);
        border-color: $neon-blue;
      }

      .card-label {
        font-size: 18rpx;
        color: #888;
        display: block;
        margin-bottom: 8rpx;
      }

      .card-value {
        font-size: 48rpx;
        font-weight: 700;
        color: $neon-blue;
        text-shadow: 0 0 15rpx rgba(79, 161, 242, 0.3);
        display: block;
      }

      .card-unit {
        font-size: 16rpx;
        color: #666;
        margin-top: 4rpx;
      }
    }
  }

  .achievement-box {
    background: rgba(255, 107, 107, 0.1);
    border: 2rpx solid rgba(255, 107, 107, 0.3);
    border-radius: 16rpx;
    padding: 20rpx;
    margin-bottom: 20rpx;

    .achievement-title {
      font-size: 24rpx;
      font-weight: 700;
      color: $vibrant-orange;
      margin-bottom: 16rpx;
      display: block;
    }

    .achievement-list {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;

      .achievement-badge {
        background: rgba(255, 107, 107, 0.2);
        border: 1rpx solid $vibrant-orange;
        border-radius: 12rpx;
        padding: 12rpx 16rpx;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6rpx;
        flex: 0 0 calc(50% - 6rpx);

        .badge-icon {
          font-size: 32rpx;
        }

        .badge-text {
          font-size: 16rpx;
          color: $dark-text;
          font-weight: 600;
        }
      }
    }
  }

  .ranking-box {
    background: rgba(79, 161, 242, 0.1);
    border: 2rpx solid rgba(79, 161, 242, 0.2);
    border-radius: 16rpx;
    padding: 20rpx;
    text-align: center;
    margin-bottom: 30rpx;

    .ranking-title {
      font-size: 24rpx;
      font-weight: 700;
      color: $neon-blue;
      margin-bottom: 12rpx;
      display: block;
    }

    .ranking-text {
      font-size: 24rpx;
      color: $vibrant-orange;
      font-weight: 600;
      text-shadow: 0 0 10rpx rgba(255, 107, 107, 0.3);
    }
  }

  .result-actions {
    display: flex;
    gap: 12rpx;
    margin-bottom: 20rpx;

    .action-btn {
      flex: 1;
      padding: 18rpx 30rpx;
      border-radius: 24rpx;
      font-size: 28rpx;
      font-weight: 700;
      text-align: center;

      &.primary {
        background: linear-gradient(135deg, $neon-blue 0%, #80D0FF 100%);
        color: white;
        box-shadow: 0 8rpx 20rpx rgba(79, 161, 242, 0.3);
      }

      &.secondary {
        background: rgba(79, 161, 242, 0.1);
        color: $neon-blue;
        border: 2rpx solid $neon-blue;
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }
}

/* ===== 动画 ===== */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20rpx);
  }
}

@keyframes pulse-count {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.1);
    opacity: 0.5;
  }
}

@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.4);
    opacity: 0;
  }
}
</style>
