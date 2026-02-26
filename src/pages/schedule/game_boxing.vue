<template>
  <view class="container">
    <!-- 欢迎画面 -->
    <view v-if="gameState === 'welcome'" class="welcome-screen">
      <view class="logo-section">
        <text class="game-icon">🥊</text>
        <text class="game-title">爆发力拳击训练</text>
      </view>
      
      <view class="info-box">
        <view class="info-item">
          <text class="info-icon">📱</text>
          <text class="info-text">手持手机进行挥拳</text>
        </view>
        <view class="info-item">
          <text class="info-icon">💥</text>
          <text class="info-text">直拳、勾拳随意发挥</text>
        </view>
        <view class="info-item">
          <text class="info-icon">⚡</text>
          <text class="info-text">越快越有力越好</text>
        </view>
        <view class="info-item">
          <text class="info-icon">⏱️</text>
          <text class="info-text">60秒内炸裂吧</text>
        </view>
      </view>

      <view class="game-modes">
        <text class="modes-title">游戏信息</text>
        <view class="mode-item">
          <text class="mode-label">时长：</text>
          <text class="mode-value">60秒</text>
        </view>
        <view class="mode-item">
          <text class="mode-label">激活阈值：</text>
          <text class="mode-value">1.5g加速度</text>
        </view>
        <view class="mode-item">
          <text class="mode-label">连击倍增：</text>
          <text class="mode-value">是（分数翻倍）</text>
        </view>
      </view>

      <view class="start-btn" @click="startGame">
        准备对轰
      </view>

      <view class="best-record">
        <text class="record-label">个人最高出拳数</text>
        <text class="record-value">{{ bestRecord }}</text>
      </view>
    </view>

    <!-- 准备阶段 -->
    <view v-else-if="gameState === 'prepare'" class="prepare-screen">
      <view class="prepare-emoji">💪</view>
      <text class="prepare-text">准备好了吗</text>
      <view class="prepare-countdown">{{ prepareCountdown }}</view>
    </view>

    <!-- 游戏进行中 -->
    <view v-else-if="gameState === 'playing'" class="game-screen">
      <!-- 背景屏幕（击中时闪白） -->
      <view class="game-background" :class="{ hit: justHit }"></view>

      <!-- 顶部面板 -->
      <view class="top-panel">
        <view class="timer-section">
          <text class="timer-value">{{ gameTime }}</text>
          <text class="timer-label">秒</text>
        </view>

        <view class="score-section">
          <text class="score-value">{{ totalScore }}</text>
          <text class="score-label">分数</text>
        </view>

        <view class="combo-section" v-if="comboCount > 1">
          <text class="combo-text">{{ comboCount }}连击！</text>
        </view>
      </view>

      <!-- 靶心 -->
      <view class="target-container">
        <view class="target-outer" :class="{ hit: justHit }"></view>
        <view class="target-middle"></view>
        <view class="target-inner" :class="{ hit: justHit }"></view>
        <view class="target-center"></view>
      </view>

      <!-- 实时反馈 -->
      <view class="feedback-zone">
        <!-- 打击效果 -->
        <view v-for="effect in hitEffects" :key="effect.id" 
              class="hit-effect"
              :style="{ '--x': effect.x + 'px', '--y': effect.y + 'px' }"
              :class="effect.type">
          {{ effect.text }}
        </view>

        <!-- 加速度显示 -->
        <view class="accel-display">
          <text class="accel-label">加速度：</text>
          <text class="accel-value">{{ currentAccel.toFixed(2) }}g</text>
        </view>
      </view>

      <!-- 出拳数统计 -->
      <view class="punch-stats">
        <view class="stat-block">
          <text class="stat-number">{{ punchCount }}</text>
          <text class="stat-label">出拳数</text>
        </view>
        <view class="stat-block">
          <text class="stat-number">{{ avgPower }}</text>
          <text class="stat-label">平均力度</text>
        </view>
        <view class="stat-block">
          <text class="stat-number">{{ punchRate }}</text>
          <text class="stat-label">出拳/秒</text>
        </view>
      </view>

      <!-- 结束按钮 -->
      <view class="game-footer">
        <view class="finish-btn" @click="finishGame">投降</view>
      </view>
    </view>

    <!-- 结果报告 -->
    <view v-else-if="gameState === 'finished'" class="result-screen">
      <view class="result-header">
        <text class="result-emoji">🏆</text>
        <text class="result-title">爆发力训练报告</text>
      </view>

      <view class="result-main">
        <view class="main-card">
          <text class="main-label">总出拳数</text>
          <text class="main-value">{{ punchCount }}</text>
          <text class="main-unit">次</text>
        </view>
      </view>

      <view class="result-stats">
        <view class="result-card">
          <text class="card-label">最高爆发力</text>
          <text class="card-value">{{ maxAccel.toFixed(2) }}</text>
          <text class="card-unit">g</text>
        </view>

        <view class="result-card">
          <text class="card-label">平均力度</text>
          <text class="card-value">{{ avgPower }}</text>
          <text class="card-unit">级</text>
        </view>

        <view class="result-card">
          <text class="card-label">最高连击</text>
          <text class="card-value">{{ maxCombo }}</text>
          <text class="card-unit">连</text>
        </view>

        <view class="result-card">
          <text class="card-label">消耗卡路里</text>
          <text class="card-value">{{ burntCalories }}</text>
          <text class="card-unit">kcal</text>
        </view>
      </view>

      <!-- 评级 -->
      <view class="rating-zone">
        <text class="rating-emoji">{{ ratingEmoji }}</text>
        <text class="rating-level">{{ ratingLevel }}</text>
        <text class="rating-desc">{{ ratingDesc }}</text>
      </view>

      <!-- 排名 -->
      <view class="ranking-info">
        <text class="ranking-icon">📊</text>
        <text class="ranking-text">超越了 <text class="ranking-value">{{ percentile }}%</text> 的用户</text>
      </view>

      <!-- 新纪录 -->
      <view v-if="isNewRecord" class="new-record">
        <text class="new-record-icon">✨</text>
        <text class="new-record-text">新纪录！</text>
      </view>

      <!-- 按钮 -->
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
const prepareCountdown = ref(3)
const gameTime = ref(60)
const bestRecord = ref(0)

// 游戏数据
const punchCount = ref(0)
const totalScore = ref(0)
const comboCount = ref(0)
const maxCombo = ref(0)
const hitEffects = ref([])
const currentAccel = ref(0)
let effectId = 0

// 加速度数据
const accelHistory = ref([])
let maxAccelValue = 0
let lastPunchTime = 0
const PUNCH_THRESHOLD = 1.5 // g
const DEBOUNCE_TIME = 200 // ms

let timerInterval = null
let comboTimer = null
let justHit = ref(false)

// 计算属性
const avgPower = computed(() => {
  if (accelHistory.value.length === 0) return '弱'
  const avg = accelHistory.value.reduce((a, b) => a + b) / accelHistory.value.length
  if (avg > 2) return '强'
  if (avg > 1.5) return '中'
  return '弱'
})

const maxAccel = computed(() => maxAccelValue)

const punchRate = computed(() => {
  if (gameTime.value >= 60) return '0.0'
  const elapsed = 60 - gameTime.value
  if (elapsed === 0) return '0.0'
  return (punchCount.value / elapsed).toFixed(1)
})

const burntCalories = computed(() => {
  return Math.round(punchCount.value * 0.5)
})

const percentile = computed(() => {
  return Math.min(Math.round((punchCount.value / 200) * 100), 99)
})

const ratingEmoji = computed(() => {
  if (punchCount.value >= 120) return '🔥'
  if (punchCount.value >= 80) return '💪'
  if (punchCount.value >= 40) return '👊'
  return '👶'
})

const ratingLevel = computed(() => {
  if (punchCount.value >= 120) return '格斗大师'
  if (punchCount.value >= 80) return '拳击手'
  if (punchCount.value >= 40) return '初级格斗者'
  return '新手'
})

const ratingDesc = computed(() => {
  if (punchCount.value >= 120) return '你的爆发力已经超群！'
  if (punchCount.value >= 80) return '出色的力量与耐力！'
  if (punchCount.value >= 40) return '向快速拳击手迈进'
  return '加油，继续训练'
})

const isNewRecord = ref(false)

// 初始化
onMounted(() => {
  try {
    const saved = uni.getStorageSync('boxing_best_record')
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
  prepareCountdown.value = 3
  gameTime.value = 60
  punchCount.value = 0
  totalScore.value = 0
  comboCount.value = 0
  maxCombo.value = 0
  maxAccelValue = 0
  accelHistory.value = []
  lastPunchTime = 0
  hitEffects.value = []
  isNewRecord.value = false

  const prepareTimer = setInterval(() => {
    prepareCountdown.value--
    if (prepareCountdown.value < 0) {
      clearInterval(prepareTimer)
      gameState.value = 'playing'
      startAccelerometerSensor()
      startGameTimer()
    }
  }, 1000)
}

const startAccelerometerSensor = () => {
  uni.onAccelerometerChange((res) => {
    if (gameState.value !== 'playing') return

    // 计算加速度矢量
    const accel = Math.sqrt(
      Math.pow(res.x || 0, 2) + 
      Math.pow(res.y || 0, 2) + 
      Math.pow(res.z || 0, 2)
    )

    currentAccel.value = accel
    accelHistory.value.push(accel)
    if (accelHistory.value.length > 60) {
      accelHistory.value.shift()
    }

    maxAccelValue = Math.max(maxAccelValue, accel)

    // 检测出拳（高加速度触发）
    if (accel > PUNCH_THRESHOLD) {
      const now = Date.now()
      if (now - lastPunchTime > DEBOUNCE_TIME) {
        triggerPunch(accel)
        lastPunchTime = now
      }
    }
  })
}

const triggerPunch = (accelValue) => {
  punchCount.value++
  
  // 计算分数（加速度越高分数越高，加连击倍增）
  const baseScore = Math.round(accelValue * 30)
  const multiplier = Math.min(comboCount.value + 1, 5)
  const score = baseScore * multiplier

  totalScore.value += score

  // 连击逻辑
  comboCount.value++
  if (comboCount.value > maxCombo.value) {
    maxCombo.value = comboCount.value
  }

  // 重置连击计时器
  if (comboTimer) {
    clearTimeout(comboTimer)
  }
  comboTimer = setTimeout(() => {
    comboCount.value = 0
  }, 2000)

  // 视觉反馈
  triggerVisualEffect(accelValue)

  // 震动反馈
  uni.vibrateShort()
}

const triggerVisualEffect = (accelValue) => {
  // 屏幕闪白
  justHit.value = true
  setTimeout(() => {
    justHit.value = false
  }, 150)

  // 创建打击文字效果
  let effectText = 'HIT!'
  let effectType = 'normal'

  if (accelValue > 2.5) {
    effectText = 'PERFECT!'
    effectType = 'perfect'
  } else if (accelValue > 2.0) {
    effectText = 'GREAT!'
    effectType = 'great'
  }

  if (comboCount.value > 1) {
    effectText += ` ×${comboCount.value}`
  }

  const effect = {
    id: effectId++,
    text: effectText,
    type: effectType,
    x: Math.random() * 100 - 50,
    y: Math.random() * 100 - 50
  }

  hitEffects.value.push(effect)
  setTimeout(() => {
    hitEffects.value = hitEffects.value.filter(e => e.id !== effect.id)
  }, 800)
}

const startGameTimer = () => {
  timerInterval = setInterval(() => {
    gameTime.value--
    if (gameTime.value <= 0) {
      finishGame()
    }
  }, 1000)
}

const finishGame = () => {
  gameState.value = 'finished'
  stopGame()

  if (punchCount.value > bestRecord.value) {
    bestRecord.value = punchCount.value
    isNewRecord.value = true
    try {
      uni.setStorageSync('boxing_best_record', bestRecord.value)
    } catch (e) {
      console.error('保存最佳记录失败', e)
    }
  }
}

const stopGame = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  if (comboTimer) {
    clearTimeout(comboTimer)
    comboTimer = null
  }
  uni.offAccelerometerChange()
}

onUnmounted(() => {
  stopGame()
})
</script>

<style lang="scss" scoped>
$bg-black: #000000;
$neon-purple: #BC13FE;
$electric-green: #00FF9D;
$text-light: #E0E0E0;

.container {
  background: $bg-black;
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
      animation: punch-bounce 0.6s ease-in-out infinite;
    }

    .game-title {
      font-size: 44rpx;
      font-weight: 700;
      background: linear-gradient(90deg, $neon-purple, $electric-green);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 30rpx rgba(188, 19, 254, 0.6);
    }
  }

  .info-box {
    background: rgba(188, 19, 254, 0.1);
    border: 2rpx solid rgba(188, 19, 254, 0.3);
    border-radius: 20rpx;
    padding: 24rpx;
    margin-bottom: 30rpx;
    width: 100%;

    .info-item {
      display: flex;
      align-items: center;
      margin-bottom: 16rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .info-icon {
        font-size: 36rpx;
        margin-right: 16rpx;
        flex-shrink: 0;
      }

      .info-text {
        font-size: 24rpx;
        color: $text-light;
      }
    }
  }

  .game-modes {
    background: rgba(0, 255, 157, 0.1);
    border: 2rpx solid rgba(0, 255, 157, 0.3);
    border-radius: 16rpx;
    padding: 20rpx;
    margin-bottom: 40rpx;
    width: 100%;

    .modes-title {
      font-size: 22rpx;
      font-weight: 600;
      color: $electric-green;
      display: block;
      margin-bottom: 12rpx;
    }

    .mode-item {
      display: flex;
      justify-content: space-between;
      font-size: 20rpx;
      margin-bottom: 8rpx;
      color: $text-light;

      .mode-label {
        color: #888;
      }

      .mode-value {
        color: $neon-purple;
        font-weight: 600;
      }
    }
  }

  .start-btn {
    background: linear-gradient(135deg, $neon-purple 0%, $electric-green 100%);
    color: #000;
    padding: 18rpx 50rpx;
    border-radius: 28rpx;
    font-size: 32rpx;
    font-weight: 700;
    margin-bottom: 40rpx;
    box-shadow: 0 0 30rpx rgba(188, 19, 254, 0.4), 0 0 20rpx rgba(0, 255, 157, 0.2);

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
      color: $electric-green;
      text-shadow: 0 0 15rpx rgba(0, 255, 157, 0.4);
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

  .prepare-emoji {
    font-size: 80rpx;
    margin-bottom: 30rpx;
    animation: pump 0.5s ease-in-out infinite;
  }

  .prepare-text {
    font-size: 36rpx;
    color: $neon-purple;
    margin-bottom: 40rpx;
    text-shadow: 0 0 15rpx rgba(188, 19, 254, 0.4);
  }

  .prepare-countdown {
    font-size: 140rpx;
    font-weight: 700;
    background: linear-gradient(90deg, $neon-purple, $electric-green);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 30rpx rgba(188, 19, 254, 0.5);
    margin-bottom: 30rpx;
  }
}

/* ===== 游戏进行中 ===== */
.game-screen {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
  position: relative;
}

.game-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $bg-black;
  transition: background 0.1s ease;

  &.hit {
    background: rgba(255, 255, 255, 0.3);
    animation: flash 0.15s ease-out;
  }
}

@keyframes flash {
  0% {
    background: rgba(255, 255, 255, 0.6);
  }
  100% {
    background: rgba(255, 255, 255, 0);
  }
}

.top-panel {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 24rpx 16rpx;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border-bottom: 2rpx solid $neon-purple;
  position: relative;
  z-index: 2;

  .timer-section,
  .score-section {
    text-align: center;
  }

  .timer-value,
  .score-value {
    font-size: 40rpx;
    font-weight: 700;
    color: $neon-purple;
    text-shadow: 0 0 15rpx rgba(188, 19, 254, 0.4);
    display: block;
  }

  .timer-label,
  .score-label {
    font-size: 16rpx;
    color: #888;
  }

  .combo-section {
    padding: 12rpx 20rpx;
    background: rgba(0, 255, 157, 0.2);
    border: 2rpx solid $electric-green;
    border-radius: 12rpx;

    .combo-text {
      font-size: 24rpx;
      color: $electric-green;
      font-weight: 700;
      text-shadow: 0 0 10rpx rgba(0, 255, 157, 0.4);
    }
  }
}

.target-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.target-outer,
.target-middle,
.target-inner,
.target-center {
  position: absolute;
  border-radius: 50%;
}

.target-outer {
  width: 320rpx;
  height: 320rpx;
  border: 3rpx solid rgba($neon-purple, 0.6);
  animation: pulse-ring 2s ease-in-out infinite;

  &.hit {
    animation: target-hit 0.4s ease-out;
  }
}

.target-middle {
  width: 220rpx;
  height: 220rpx;
  border: 2rpx solid rgba($electric-green, 0.4);
  animation: pulse-ring 2s ease-in-out infinite 0.3s;
}

.target-inner {
  width: 120rpx;
  height: 120rpx;
  border: 2rpx solid $neon-purple;
  animation: pulse-ring 2s ease-in-out infinite 0.6s;

  &.hit {
    background: rgba($neon-purple, 0.3);
  }
}

.target-center {
  width: 40rpx;
  height: 40rpx;
  background: $electric-green;
  box-shadow: 0 0 20rpx $electric-green, inset 0 0 10rpx rgba(0, 0, 0, 0.5);
  animation: glow-pulse 1s ease-in-out infinite;
}

@keyframes pulse-ring {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 20rpx $electric-green, inset 0 0 10rpx rgba(0, 0, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 40rpx $electric-green, inset 0 0 15rpx rgba(0, 0, 0, 0.3);
  }
}

@keyframes target-hit {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.feedback-zone {
  position: relative;
  z-index: 3;
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  .hit-effect {
    position: absolute;
    font-weight: 700;
    font-size: 36rpx;
    pointer-events: none;
    left: calc(50% + var(--x));
    top: calc(50% + var(--y));
    transform: translate(-50%, -50%);
    animation: effect-float 0.8s ease-out forwards;

    &.normal {
      color: $neon-purple;
      text-shadow: 0 0 15rpx $neon-purple;
    }

    &.great {
      color: $electric-green;
      font-size: 44rpx;
      text-shadow: 0 0 20rpx $electric-green;
    }

    &.perfect {
      color: #FFD700;
      font-size: 52rpx;
      text-shadow: 0 0 25rpx #FFD700;
    }
  }

  .accel-display {
    position: absolute;
    bottom: 20rpx;
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 10rpx 20rpx;
    background: rgba(188, 19, 254, 0.2);
    border: 1rpx solid rgba(188, 19, 254, 0.4);
    border-radius: 12rpx;

    .accel-label {
      font-size: 18rpx;
      color: #888;
    }

    .accel-value {
      font-size: 22rpx;
      font-weight: 700;
      color: $electric-green;
    }
  }
}

@keyframes effect-float {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -150%) scale(1.5);
  }
}

.punch-stats {
  display: flex;
  justify-content: space-around;
  padding: 16rpx;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1rpx solid rgba(188, 19, 254, 0.2);
  position: relative;
  z-index: 2;

  .stat-block {
    text-align: center;
    flex: 1;

    .stat-number {
      font-size: 36rpx;
      font-weight: 700;
      color: $electric-green;
      text-shadow: 0 0 10rpx rgba(0, 255, 157, 0.4);
      display: block;
    }

    .stat-label {
      font-size: 14rpx;
      color: #888;
      display: block;
      margin-top: 4rpx;
    }
  }
}

.game-footer {
  padding: 16rpx;
  background: rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 2;

  .finish-btn {
    background: rgba(255, 68, 68, 0.9);
    color: white;
    padding: 14rpx 40rpx;
    border-radius: 20rpx;
    font-size: 26rpx;
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
      background: linear-gradient(90deg, $neon-purple, $electric-green);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 0 20rpx rgba(188, 19, 254, 0.3);
    }
  }

  .result-main {
    display: flex;
    justify-content: center;
    margin-bottom: 30rpx;

    .main-card {
      background: rgba(188, 19, 254, 0.15);
      border: 2rpx solid $neon-purple;
      border-radius: 20rpx;
      padding: 30rpx;
      text-align: center;
      width: 100%;

      .main-label {
        font-size: 20rpx;
        color: #888;
        display: block;
        margin-bottom: 12rpx;
      }

      .main-value {
        font-size: 56rpx;
        font-weight: 700;
        color: $electric-green;
        text-shadow: 0 0 15rpx rgba(0, 255, 157, 0.4);
        display: block;
      }

      .main-unit {
        font-size: 18rpx;
        color: $neon-purple;
        margin-top: 8rpx;
      }
    }
  }

  .result-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12rpx;
    margin-bottom: 30rpx;

    .result-card {
      background: rgba(0, 255, 157, 0.08);
      border: 1rpx solid rgba(0, 255, 157, 0.2);
      border-radius: 16rpx;
      padding: 18rpx;
      text-align: center;

      .card-label {
        font-size: 16rpx;
        color: #888;
        display: block;
        margin-bottom: 8rpx;
      }

      .card-value {
        font-size: 36rpx;
        font-weight: 700;
        color: $neon-purple;
        display: block;
      }

      .card-unit {
        font-size: 14rpx;
        color: #666;
        margin-top: 4rpx;
      }
    }
  }

  .rating-zone {
    background: rgba(0, 255, 157, 0.12);
    border: 2rpx solid rgba(0, 255, 157, 0.3);
    border-radius: 20rpx;
    padding: 30rpx 20rpx;
    text-align: center;
    margin-bottom: 20rpx;

    .rating-emoji {
      font-size: 60rpx;
      display: block;
      margin-bottom: 12rpx;
    }

    .rating-level {
      font-size: 32rpx;
      font-weight: 700;
      color: $electric-green;
      display: block;
      text-shadow: 0 0 10rpx rgba(0, 255, 157, 0.3);
      margin-bottom: 8rpx;
    }

    .rating-desc {
      font-size: 20rpx;
      color: #999;
    }
  }

  .ranking-info {
    background: rgba(188, 19, 254, 0.1);
    border: 1rpx solid rgba(188, 19, 254, 0.2);
    border-radius: 16rpx;
    padding: 20rpx;
    text-align: center;
    margin-bottom: 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;

    .ranking-icon {
      font-size: 40rpx;
    }

    .ranking-text {
      font-size: 20rpx;
      color: $text-light;

      .ranking-value {
        color: $neon-purple;
        font-weight: 700;
        text-shadow: 0 0 8rpx rgba(188, 19, 254, 0.3);
      }
    }
  }

  .new-record {
    background: linear-gradient(90deg, rgba(255, 215, 0, 0.2), rgba(0, 255, 157, 0.2));
    border: 2rpx solid rgba(255, 215, 0, 0.4);
    border-radius: 16rpx;
    padding: 16rpx;
    text-align: center;
    margin-bottom: 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8rpx;

    .new-record-icon {
      font-size: 40rpx;
      animation: spin 1s linear infinite;
    }

    .new-record-text {
      font-size: 24rpx;
      font-weight: 700;
      color: #FFD700;
      text-shadow: 0 0 10rpx rgba(255, 215, 0, 0.4);
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .result-actions {
    display: flex;
    gap: 12rpx;
    margin-bottom: 20rpx;

    .action-btn {
      flex: 1;
      padding: 16rpx 24rpx;
      border-radius: 20rpx;
      font-size: 26rpx;
      font-weight: 700;
      text-align: center;

      &.primary {
        background: linear-gradient(135deg, $neon-purple 0%, $electric-green 100%);
        color: #000;
        box-shadow: 0 8rpx 20rpx rgba(188, 19, 254, 0.3);
      }

      &.secondary {
        background: transparent;
        color: $neon-purple;
        border: 2rpx solid $neon-purple;
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }
}

/* ===== 全局动画 ===== */
@keyframes punch-bounce {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  25% {
    transform: translateY(-20rpx) rotate(-5deg);
  }
  50% {
    transform: translateY(0) rotate(0deg);
  }
  75% {
    transform: translateY(-20rpx) rotate(5deg);
  }
}

@keyframes pump {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
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
