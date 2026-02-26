<template>
  <view class="container">
    <!-- 欢迎画面 -->
    <view v-if="gameState === 'welcome'" class="welcome-screen">
      <view class="logo-section">
        <text class="game-icon">🧘</text>
        <text class="game-title">平衡保持挑战</text>
      </view>
      
      <view class="instruction-box">
        <view class="instruction-item">
          <text class="inst-icon">📱</text>
          <text class="inst-text">手机平放在背部或手中</text>
        </view>
        <view class="instruction-item">
          <text class="inst-icon">💪</text>
          <text class="inst-text">做平板支撑或单腿站立</text>
        </view>
        <view class="instruction-item">
          <text class="inst-icon">⚖️</text>
          <text class="inst-text">保持手机平衡不倾斜</text>
        </view>
        <view class="instruction-item">
          <text class="inst-icon">⏱️</text>
          <text class="inst-text">坚持时间越长越好</text>
        </view>
      </view>

      <view class="parameters-info">
        <text class="param-title">游戏参数</text>
        <view class="param-item">
          <text class="param-label">准备时长：</text>
          <text class="param-value">5秒</text>
        </view>
        <view class="param-item">
          <text class="param-label">安全范围：</text>
          <text class="param-value">±5°</text>
        </view>
        <view class="param-item">
          <text class="param-label">失败阈值：</text>
          <text class="param-value">超过15°持续2秒</text>
        </view>
      </view>

      <view class="start-btn" @click="startGame">
        准备开始
      </view>

      <view class="best-record">
        <text class="record-label">个人最佳</text>
        <text class="record-value">{{ bestRecord }}</text>
      </view>
    </view>

    <!-- 准备阶段 -->
    <view v-else-if="gameState === 'prepare'" class="prepare-screen">
      <view class="prepare-icon">🎬</view>
      <view class="prepare-text">准备好姿势</view>
      <view class="prepare-countdown">{{ prepareCountdown }}</view>
      <view class="prepare-hint">{{ prepareHint }}</view>
    </view>

    <!-- 游戏进行中 -->
    <view v-else-if="gameState === 'playing'" class="game-screen">
      <!-- 背景（波纹效果） -->
      <view class="background-container" :class="{ unstable: !isBalanced }">
        <!-- 多层波纹 -->
        <view class="ripple" v-for="i in 3" :key="i" 
              :style="{ '--ripple-delay': `${i * 0.3}s`, '--ripple-scale': 1 + i * 0.3 }"
              :class="{ danger: !isBalanced }"></view>
      </view>

      <!-- 顶部信息 -->
      <view class="top-stats">
        <view class="stat-block">
          <text class="stat-label">⏱️ 坚持时长</text>
          <text class="stat-value">{{ formatTime(holdingTime) }}</text>
        </view>
        <view class="stat-block center">
          <text class="stat-label">🔥 核心稳定度</text>
          <text class="stat-value" :class="stabilityClass">{{ stability }}%</text>
        </view>
        <view class="stat-block">
          <text class="stat-label">⚡ 爆发力</text>
          <text class="stat-value">{{ explosivePower }}</text>
        </view>
      </view>

      <!-- 中央能量球和倾斜显示 -->
      <view class="center-display">
        <!-- 平衡指示器 -->
        <view class="balance-circles">
          <view class="circle circle-1"></view>
          <view class="circle circle-2"></view>
          <view class="circle circle-3"></view>
        </view>

        <!-- 能量球 -->
        <view class="energy-ball" 
              :style="{ 
                transform: `translate(${ballOffsetX}px, ${ballOffsetY}px) scale(${ballScale})`
              }"
              :class="{ unstable: !isBalanced }">
          <view class="ball-glow"></view>
          <view class="ball-inner"></view>
        </view>

        <!-- 倾斜角度显示 -->
        <view class="angle-display">
          <view class="angle-item">
            <text class="angle-label">Roll</text>
            <text class="angle-value">{{ rollAngleRounded }}°</text>
          </view>
          <view class="angle-item">
            <text class="angle-label">Pitch</text>
            <text class="angle-value">{{ pitchAngleRounded }}°</text>
          </view>
        </view>
      </view>

      <!-- 状态提示 -->
      <view class="status-zone">
        <view v-if="isBalanced" class="status-good">
          <text class="status-icon">✓</text>
          <text class="status-text">平衡中...</text>
        </view>
        <view v-else class="status-danger">
          <text class="status-icon">⚠️</text>
          <text class="status-text">失去平衡！</text>
        </view>
      </view>

      <!-- 结束按钮 -->
      <view class="bottom-actions">
        <view class="action-btn" @click="finishGame">放弃（结束）</view>
      </view>
    </view>

    <!-- 结果报告 -->
    <view v-else-if="gameState === 'finished'" class="result-screen">
      <view class="result-header">
        <text class="result-emoji">🏆</text>
        <text class="result-title">核心稳定度报告</text>
      </view>

      <view class="result-cards">
        <view class="result-card primary">
          <text class="card-label">坚持时长</text>
          <text class="card-value">{{ formatTime(holdingTime) }}</text>
          <text class="card-desc">秒</text>
        </view>

        <view class="result-card">
          <text class="card-label">平均稳定度</text>
          <text class="card-value">{{ avgStability }}%</text>
          <text class="card-desc">越高越好</text>
        </view>

        <view class="result-card">
          <text class="card-label">最大倾斜角</text>
          <text class="card-value">{{ maxTilt }}°</text>
          <text class="card-desc">超过15°失败</text>
        </view>

        <view class="result-card">
          <text class="card-label">消耗卡路里</text>
          <text class="card-value">{{ calories }}</text>
          <text class="card-desc">kcal</text>
        </view>
      </view>

      <!-- 等级评定 -->
      <view class="rating-box">
        <text class="rating-title">💪 体能评级</text>
        <view class="rating-display">
          <text class="rating-emoji">{{ ratingEmoji }}</text>
          <text class="rating-text">{{ ratingText }}</text>
        </view>
      </view>

      <!-- 排名 -->
      <view class="ranking-box">
        <text class="ranking-title">📊 排名信息</text>
        <text class="ranking-text">超越了 {{ percentile }}% 的用户</text>
      </view>

      <!-- 行动按钮 -->
      <view class="result-actions">
        <view class="action-btn secondary" @click="goBack">← 返回</view>
        <view class="action-btn primary" @click="startGame">再来一次</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// 游戏状态
const gameState = ref('welcome')
const prepareCountdown = ref(5)
const holdingTime = ref(0)
const bestRecord = ref(0)

// 陀螺仪数据
const rollAngle = ref(0)
const pitchAngle = ref(0)
const gyroHistory = ref([])
const maxTiltAngle = ref(0)

// 游戏逻辑
const isBalanced = ref(true)
let unbalancedStartTime = null
const UNBALANCE_THRESHOLD = 2000 // 2秒未平衡则失败
const TILT_LIMIT = 15 // 倾斜15度失败
const SAFE_ANGLE = 5 // 安全范围

let timerInterval = null
let gymPhaseActive = false

// 计算属性
const stability = computed(() => {
  if (gyroHistory.value.length === 0) return 100
  const avgAngle = gyroHistory.value.reduce((a, b) => a + b) / gyroHistory.value.length
  return Math.max(0, Math.round(100 - avgAngle * 5))
})

const stabilityClass = computed(() => {
  if (stability.value >= 80) return 'good'
  if (stability.value >= 50) return 'medium'
  return 'danger'
})

const explosivePower = computed(() => {
  if (gyroHistory.value.length < 2) return 'N/A'
  const diff = Math.max(...gyroHistory.value) - Math.min(...gyroHistory.value)
  if (diff > 20) return '🔥 强'
  if (diff > 10) return '⚡ 中'
  return '✓ 弱'
})

const ballOffsetX = computed(() => {
  return rollAngle.value * 3
})

const ballOffsetY = computed(() => {
  return pitchAngle.value * 3
})

const ballScale = computed(() => {
  if (isBalanced.value) return 1
  return 0.8
})

const avgStability = computed(() => stability.value)

const maxTilt = computed(() => Math.round(maxTiltAngle.value))

const calories = computed(() => Math.round(holdingTime.value * 0.15))

const percentile = computed(() => {
  return Math.min(Math.round((holdingTime.value / 120) * 100), 99)
})

const ratingEmoji = computed(() => {
  if (holdingTime.value >= 60) return '🏅'
  if (holdingTime.value >= 30) return '💪'
  if (holdingTime.value >= 15) return '🙂'
  return '👶'
})

const ratingText = computed(() => {
  if (holdingTime.value >= 60) return '专业运动员级'
  if (holdingTime.value >= 30) return '健身达人'
  if (holdingTime.value >= 15) return '初级锻炼者'
  return '新手入门'
})

const rollAngleRounded = computed(() => Math.round(rollAngle.value))

const pitchAngleRounded = computed(() => Math.round(pitchAngle.value))

const prepareHint = computed(() => {
  const hints = [
    '深呼吸，放松身体...',
    '摆好你的姿势...',
    '准备就绪...',
    '即将开始...',
    '3... 2... 1...'
  ]
  return hints[5 - prepareCountdown.value] || '准备好了'
})

// 初始化
onMounted(() => {
  try {
    const saved = uni.getStorageSync('balance_best_record')
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
  gameState.value = 'prepare'
  prepareCountdown.value = 5
  holdingTime.value = 0
  gyroHistory.value = []
  maxTiltAngle.value = 0
  isBalanced.value = true
  unbalancedStartTime = null

  const prepareTimer = setInterval(() => {
    prepareCountdown.value--
    if (prepareCountdown.value < 0) {
      clearInterval(prepareTimer)
      gameState.value = 'playing'
      startGyroSensor()
      startTimer()
    }
  }, 1000)
}

const startGyroSensor = () => {
  uni.onGyroscopeChange((res) => {
    if (gameState.value !== 'playing') return

    // 计算倾斜角度（这里简化处理，实际需要陀螺仪积分）
    rollAngle.value = (res?.x) || 0
    pitchAngle.value = (res?.y) || 0

    const tiltMagnitude = Math.sqrt(
      Math.pow(rollAngle.value, 2) + Math.pow(pitchAngle.value, 2)
    )

    gyroHistory.value.push(tiltMagnitude)
    if (gyroHistory.value.length > 20) {
      gyroHistory.value.shift()
    }

    // 更新最大倾斜
    maxTiltAngle.value = Math.max(maxTiltAngle.value, Math.abs(rollAngle.value), Math.abs(pitchAngle.value))

    // 判断平衡状态
    if (tiltMagnitude > TILT_LIMIT) {
      if (!unbalancedStartTime) {
        unbalancedStartTime = Date.now()
      }

      const timeSinceUnbalanced = Date.now() - unbalancedStartTime
      if (timeSinceUnbalanced > UNBALANCE_THRESHOLD) {
        finishGame()
        return
      }

      isBalanced.value = false
      try {
        uni.vibrateShort()
      } catch (e) {
        console.log('振动不支持或未授权')
      }
    } else {
      if (unbalancedStartTime) {
        unbalancedStartTime = null
      }
      isBalanced.value = true
    }
  }, { frequency: 'ui' })
}

const startTimer = () => {
  timerInterval = setInterval(() => {
    if (gameState.value === 'playing') {
      holdingTime.value++
    }
  }, 1000)
}

const finishGame = () => {
  gameState.value = 'finished'
  stopGame()

  if (holdingTime.value > bestRecord.value) {
    bestRecord.value = holdingTime.value
    try {
      uni.setStorageSync('balance_best_record', bestRecord.value)
    } catch (e) {
      console.error('保存最佳记录失败', e)
    }
  }
}

const stopGame = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  try {
    uni.offGyroscopeChange()
  } catch (e) {
    console.log('关闭陀螺仪异常')
  }
}

const formatTime = (seconds) => {
  return `${seconds}s`
}

onUnmounted(() => {
  stopGame()
})
</script>

<style lang="scss" scoped>
$dark-blue: #0F2027;
$ocean-blue: #203A43;
$cyan: #00D4FF;
$light-cyan: #1CB6D4;
$danger-red: #FF4444;
$text-light: #E0F7FF;

.container {
  background: radial-gradient(circle at center, #{$ocean-blue} 0%, #{$dark-blue} 100%);
  min-height: 100vh;
  color: $text-light;
  overflow: hidden;
}

/* ===== 欢迎画面 ===== */
.welcome-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40rpx 20rpx;

  .logo-section {
    text-align: center;
    margin-bottom: 50rpx;

    .game-icon {
      font-size: 100rpx;
      display: block;
      margin-bottom: 20rpx;
      animation: float 3s ease-in-out infinite;
    }

    .game-title {
      font-size: 44rpx;
      font-weight: 700;
      color: $cyan;
      text-shadow: 0 0 25rpx rgba(0, 212, 255, 0.5);
    }
  }

  .instruction-box {
    background: rgba(0, 212, 255, 0.08);
    border: 2rpx solid rgba(0, 212, 255, 0.3);
    border-radius: 20rpx;
    padding: 24rpx;
    margin-bottom: 30rpx;
    width: 100%;

    .instruction-item {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .inst-icon {
        font-size: 36rpx;
        margin-right: 16rpx;
        flex-shrink: 0;
      }

      .inst-text {
        font-size: 24rpx;
        color: $text-light;
      }
    }
  }

  .parameters-info {
    background: rgba(28, 182, 212, 0.1);
    border-radius: 16rpx;
    padding: 20rpx;
    margin-bottom: 40rpx;
    width: 100%;

    .param-title {
      font-size: 22rpx;
      font-weight: 600;
      color: $light-cyan;
      display: block;
      margin-bottom: 12rpx;
    }

    .param-item {
      display: flex;
      justify-content: space-between;
      font-size: 20rpx;
      margin-bottom: 8rpx;
      color: $text-light;

      .param-label {
        color: #999;
      }

      .param-value {
        color: $cyan;
        font-weight: 600;
      }
    }
  }

  .start-btn {
    background: linear-gradient(135deg, $cyan 0%, $light-cyan 100%);
    color: #000;
    padding: 18rpx 50rpx;
    border-radius: 28rpx;
    font-size: 32rpx;
    font-weight: 700;
    margin-bottom: 40rpx;
    box-shadow: 0 8rpx 25rpx rgba(0, 212, 255, 0.3);

    &:active {
      transform: scale(0.95);
    }
  }

  .best-record {
    text-align: center;

    .record-label {
      font-size: 18rpx;
      color: #888;
      display: block;
      margin-bottom: 8rpx;
    }

    .record-value {
      font-size: 48rpx;
      font-weight: 700;
      color: $light-cyan;
      text-shadow: 0 0 15rpx rgba(28, 182, 212, 0.4);
    }
  }
}

/* ===== 准备画面 ===== */
.prepare-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;

  .prepare-icon {
    font-size: 80rpx;
    margin-bottom: 30rpx;
    animation: pulse 1s ease-in-out infinite;
  }

  .prepare-text {
    font-size: 36rpx;
    color: $cyan;
    margin-bottom: 40rpx;
    text-shadow: 0 0 15rpx rgba(0, 212, 255, 0.3);
  }

  .prepare-countdown {
    font-size: 140rpx;
    font-weight: 700;
    color: $light-cyan;
    text-shadow: 0 0 30rpx rgba(28, 182, 212, 0.5);
    margin-bottom: 30rpx;
  }

  .prepare-hint {
    font-size: 24rpx;
    color: #999;
  }
}

/* ===== 游戏进行中 ===== */
.game-screen {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.background-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, #{$ocean-blue} 0%, #{$dark-blue} 100%);
  transition: filter 0.3s ease;

  &.unstable {
    filter: hue-rotate(10deg) saturate(1.5);
    background: radial-gradient(circle at center, #3A2A2E 0%, #2A1A1E 100%);
  }
}

.ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100rpx;
  height: 100rpx;
  border: 2rpx solid $cyan;
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(var(--ripple-scale, 1));
  opacity: 0;
  animation: ripple-animation 2s ease-out infinite;
  animation-delay: var(--ripple-delay, 0s);

  &.danger {
    border-color: $danger-red;
  }
}

@keyframes ripple-animation {
  0% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(var(--ripple-scale, 1));
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(calc(var(--ripple-scale, 1) * 1.5));
  }
}

.top-stats {
  display: flex;
  justify-content: space-around;
  padding: 24rpx 16rpx;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 2;

  .stat-block {
    text-align: center;
    flex: 1;

    &.center {
      transform: scale(1.1);
    }

    .stat-label {
      font-size: 16rpx;
      color: #888;
      display: block;
      margin-bottom: 6rpx;
    }

    .stat-value {
      font-size: 32rpx;
      font-weight: 700;
      color: $cyan;
      text-shadow: 0 0 10rpx rgba(0, 212, 255, 0.4);

      &.good {
        color: #00FF00;
      }

      &.medium {
        color: $light-cyan;
      }

      &.danger {
        color: $danger-red;
      }
    }
  }
}

.center-display {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;

  .balance-circles {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .circle {
      position: absolute;
      border-radius: 50%;
      border: 2rpx solid $cyan;
      opacity: 0.25;

      &.circle-1 {
        width: 200rpx;
        height: 200rpx;
        animation: scale-pulse 2s ease-in-out infinite;
      }

      &.circle-2 {
        width: 300rpx;
        height: 300rpx;
        animation: scale-pulse 2s ease-in-out infinite 0.4s;
      }

      &.circle-3 {
        width: 400rpx;
        height: 400rpx;
        animation: scale-pulse 2s ease-in-out infinite 0.8s;
      }
    }
  }

  .energy-ball {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    position: relative;
    z-index: 3;
    transition: transform 0.1s ease-out;

    &.unstable {
      animation: shake 0.2s ease-out;
    }

    .ball-glow {
      position: absolute;
      top: -20rpx;
      left: -20rpx;
      width: 160rpx;
      height: 160rpx;
      background: radial-gradient(circle, rgba(0, 212, 255, 0.3), transparent);
      border-radius: 50%;
      animation: pulse-glow 1.5s ease-in-out infinite;
    }

    .ball-inner {
      position: absolute;
      top: 15rpx;
      left: 15rpx;
      width: 90rpx;
      height: 90rpx;
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.8), rgba(28, 182, 212, 0.6));
      border-radius: 50%;
      box-shadow: inset -10rpx -10rpx 30rpx rgba(0, 0, 0, 0.4),
                  inset 10rpx 10rpx 20rpx rgba(255, 255, 255, 0.2),
                  0 0 30rpx rgba(0, 212, 255, 0.6);
    }
  }

  .angle-display {
    position: absolute;
    bottom: 60rpx;
    display: flex;
    gap: 40rpx;
    z-index: 3;

    .angle-item {
      text-align: center;

      .angle-label {
        font-size: 18rpx;
        color: #888;
        display: block;
      }

      .angle-value {
        font-size: 40rpx;
        font-weight: 700;
        color: $light-cyan;
      }
    }
  }
}

@keyframes shake {
  0%, 100% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(-10rpx, 10rpx);
  }
  75% {
    transform: translate(10rpx, -10rpx);
  }
}

@keyframes scale-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

.status-zone {
  position: relative;
  z-index: 2;
  padding: 20rpx;
  text-align: center;

  .status-good,
  .status-danger {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;
    padding: 16rpx 30rpx;
    border-radius: 16rpx;
    backdrop-filter: blur(10px);
  }

  .status-good {
    background: rgba(0, 255, 0, 0.1);
    border: 2rpx solid rgba(0, 255, 0, 0.3);

    .status-icon {
      font-size: 36rpx;
    }

    .status-text {
      font-size: 24rpx;
      color: #00FF00;
      font-weight: 600;
    }
  }

  .status-danger {
    background: rgba(255, 68, 68, 0.1);
    border: 2rpx solid rgba(255, 68, 68, 0.3);
    animation: blink 0.5s ease-in-out infinite;

    .status-icon {
      font-size: 36rpx;
    }

    .status-text {
      font-size: 24rpx;
      color: $danger-red;
      font-weight: 600;
    }
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.bottom-actions {
  position: relative;
  z-index: 2;
  padding: 20rpx;
  background: linear-gradient(to top, rgba(15, 32, 39, 0.8), transparent);

  .action-btn {
    background: rgba(255, 68, 68, 0.9);
    color: white;
    padding: 16rpx 40rpx;
    border-radius: 24rpx;
    font-size: 28rpx;
    font-weight: 600;
    text-align: center;

    &:active {
      transform: scale(0.95);
    }
  }
}

/* ===== 结果报告 ===== */
.result-screen {
  display: flex;
  flex-direction: column;
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
      color: $cyan;
      text-shadow: 0 0 20rpx rgba(0, 212, 255, 0.4);
    }
  }

  .result-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12rpx;
    margin-bottom: 30rpx;

    .result-card {
      background: rgba(0, 212, 255, 0.1);
      border: 2rpx solid rgba(0, 212, 255, 0.2);
      border-radius: 16rpx;
      padding: 20rpx;
      text-align: center;

      &.primary {
        grid-column: 1 / -1;
        background: rgba(0, 212, 255, 0.15);
        border-color: $cyan;
      }

      .card-label {
        font-size: 16rpx;
        color: #888;
        display: block;
        margin-bottom: 8rpx;
      }

      .card-value {
        font-size: 40rpx;
        font-weight: 700;
        color: $cyan;
        text-shadow: 0 0 10rpx rgba(0, 212, 255, 0.3);
        display: block;
      }

      .card-desc {
        font-size: 14rpx;
        color: $light-cyan;
        margin-top: 4rpx;
      }
    }
  }

  .rating-box {
    background: rgba(0, 212, 255, 0.1);
    border: 2rpx solid rgba(0, 212, 255, 0.2);
    border-radius: 16rpx;
    padding: 24rpx;
    text-align: center;
    margin-bottom: 20rpx;

    .rating-title {
      font-size: 24rpx;
      font-weight: 700;
      color: $cyan;
      margin-bottom: 16rpx;
      display: block;
    }

    .rating-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12rpx;

      .rating-emoji {
        font-size: 60rpx;
      }

      .rating-text {
        font-size: 24rpx;
        color: $light-cyan;
        font-weight: 600;
      }
    }
  }

  .ranking-box {
    background: rgba(28, 182, 212, 0.1);
    border: 2rpx solid rgba(28, 182, 212, 0.2);
    border-radius: 16rpx;
    padding: 20rpx;
    text-align: center;
    margin-bottom: 30rpx;

    .ranking-title {
      font-size: 22rpx;
      font-weight: 700;
      color: $light-cyan;
      display: block;
      margin-bottom: 12rpx;
    }

    .ranking-text {
      font-size: 28rpx;
      color: $cyan;
      font-weight: 600;
      text-shadow: 0 0 10rpx rgba(0, 212, 255, 0.2);
    }
  }

  .result-actions {
    display: flex;
    gap: 12rpx;
    margin-bottom: 20rpx;

    .action-btn {
      flex: 1;
      padding: 16rpx 24rpx;
      border-radius: 24rpx;
      font-size: 26rpx;
      font-weight: 700;
      text-align: center;

      &.primary {
        background: linear-gradient(135deg, $cyan 0%, $light-cyan 100%);
        color: #000;
        box-shadow: 0 8rpx 20rpx rgba(0, 212, 255, 0.3);
      }

      &.secondary {
        background: rgba(0, 212, 255, 0.1);
        color: $cyan;
        border: 2rpx solid $cyan;
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20rpx);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes bounce {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
</style>
