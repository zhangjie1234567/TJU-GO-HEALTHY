<template>
  <view class="container">
    <view class="card">
      <text class="title">使用小结</text>

      <view class="section">
        <text class="section-title">📈 计划进度模块</text>
        <view class="row"><text>使用天数</text><text>{{ progress.useDays }} 天</text></view>
        <view class="row"><text>记录天数</text><text>{{ progress.recordDays }} 天</text></view>
        <view class="row"><text>坚持方案</text><text>{{ progress.planDays }} 天</text></view>
        <view class="row"><text>剩余天数</text><text>{{ progress.remainingDays }} 天</text></view>
        <view class="row"><text>BMI</text><text>{{ progress.bmi || '--' }}</text></view>
        <view class="row"><text>状态</text><text>{{ progress.avatarEmoji }} {{ progress.avatarDesc }}</text></view>
      </view>

      <view class="section">
        <text class="section-title">⚖️ 体重模块</text>
        <view class="row"><text>当前体重</text><text>{{ weight.current }} kg</text></view>
        <view class="row"><text>目标体重</text><text>{{ weight.target }} kg</text></view>
        <view class="row"><text>历史记录</text><text>{{ weight.count }} 条</text></view>
      </view>

      <view class="section">
        <text class="section-title">💧 喝水模块</text>
        <view class="row"><text>今日已喝</text><text>{{ drink.today }} ml</text></view>
        <view class="row"><text>喝水目标</text><text>{{ drink.goal }} ml</text></view>
      </view>

      <view class="section">
        <text class="section-title">🏃 运动模块</text>
        <view class="row"><text>今日已消耗</text><text>{{ exercise.todayCalorie }} 大卡</text></view>
        <view class="row"><text>运动目标</text><text>{{ exercise.goal }} 大卡</text></view>
        <view class="row"><text>今日总时长</text><text>{{ exercise.totalMinutes }} 分钟</text></view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { BASE_URL } from '@/config.js'
import { getUserProgressData, calculateBMI, getBMIStatus, getAvatarEmoji, getAvatarDescription } from '../home/userProgressService'

const progress = ref({ useDays: 0, recordDays: 0, planDays: 0, remainingDays: 0, bmi: '--', avatarEmoji: '📈', avatarDesc: '继续加油' })
const weight = ref({ current: '--', target: '--', count: 0 })
const drink = ref({ today: 0, goal: 1500 })
const exercise = ref({ todayCalorie: 0, goal: 500, totalMinutes: 0 })

function getToken() {
  return uni.getStorageSync('token') || ''
}

function getTodayKeyISO() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function getTodayKeyLocale() {
  return new Date().toLocaleDateString()
}

function calcRemainingDaysByWeight(weightList, targetWeight) {
  const currentWeight = weightList.length > 0 ? Number(weightList[0].weight) : 0
  if (!currentWeight || !targetWeight) return 30
  const diffToTarget = currentWeight - targetWeight
  const gap = Math.abs(diffToTarget)
  if (gap <= 0.1) return 0

  const isWeightLossGoal = diffToTarget > 0
  let avgDailyTowardTarget = 0.1
  if (weightList.length >= 2) {
    const newest = weightList[0]
    const oldest = weightList[weightList.length - 1]
    const start = new Date(oldest.date)
    const end = new Date(newest.date)
    const daysDiff = Math.max(1, Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)))
    if (daysDiff > 0) {
      const trend = isWeightLossGoal
        ? (Number(oldest.weight) - Number(newest.weight)) / daysDiff
        : (Number(newest.weight) - Number(oldest.weight)) / daysDiff
      if (trend > 0) avgDailyTowardTarget = trend
    }
  }
  if (avgDailyTowardTarget <= 0) avgDailyTowardTarget = 0.1
  return Math.ceil(gap / avgDailyTowardTarget)
}

function applyBackendWeightData(baseData, backendData) {
  const records = Array.isArray(backendData?.records) ? backendData.records : []
  if (records.length === 0) return baseData

  const weightList = records
    .map(item => ({ date: String(item.date || ''), weight: Number(item.weight) }))
    .filter(item => item.date && !Number.isNaN(item.weight))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))

  if (weightList.length === 0) return baseData

  const uniqueWeightDays = new Set(weightList.map(item => item.date)).size
  const finalRecordDays = Math.max(uniqueWeightDays, Number(baseData.recordDays || 0))
  const currentWeight = Number(weightList[0].weight)
  const targetWeight = Number(backendData.targetWeight || baseData.targetWeight || 0)
  const remainingDays = calcRemainingDaysByWeight(weightList, targetWeight)

  const height = Number(baseData.height || 0)
  let bmi = Number(baseData.bmi || 0)
  let bmiStatus = baseData.bmiStatus || 'normal'
  let avatarEmoji = baseData.avatarEmoji || '📈'
  let avatarDesc = baseData.avatarDesc || '继续加油'

  if (height > 0 && currentWeight > 0) {
    bmi = Number(calculateBMI(currentWeight, height).toFixed(1))
    bmiStatus = getBMIStatus(bmi)
    avatarEmoji = getAvatarEmoji(bmiStatus)
    avatarDesc = getAvatarDescription(bmiStatus)
  }

  return {
    ...baseData,
    weightList,
    currentWeight,
    targetWeight,
    recordDays: finalRecordDays,
    useDays: Math.max(Number(baseData.useDays || 0), finalRecordDays),
    planDays: Math.max(Number(baseData.planDays || 0), finalRecordDays),
    remainingDays,
    bmi: bmi.toFixed(1),
    bmiStatus,
    avatarEmoji,
    avatarDesc
  }
}

async function loadProgressAligned() {
  const base = getUserProgressData()
  const token = getToken()
  if (!token) {
    progress.value = base
    return
  }

  await new Promise((resolve) => {
    uni.request({
      url: `${BASE_URL}/api/weight/list`,
      method: 'GET',
      header: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      success(res) {
        if (res.statusCode === 200 && res.data?.code === 200) {
          progress.value = applyBackendWeightData(base, res.data?.data || {})
        } else {
          progress.value = base
        }
        resolve()
      },
      fail() {
        progress.value = base
        resolve()
      }
    })
  })
}

async function loadWeight() {
  const token = getToken()
  if (!token) {
    const list = JSON.parse(uni.getStorageSync('weightList') || '[]')
    const target = uni.getStorageSync('targetWeight') || ''
    weight.value = {
      current: list.length ? Number(list[0].weight).toFixed(2) : '--',
      target: target && !Number.isNaN(Number(target)) ? Number(target).toFixed(2) : '--',
      count: list.length
    }
    return
  }
  await new Promise((resolve) => {
    uni.request({
      url: `${BASE_URL}/api/weight/list`,
      method: 'GET',
      header: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      success(res) {
        if (res.statusCode === 200 && res.data?.code === 200 && res.data?.data) {
          const records = Array.isArray(res.data.data.records) ? res.data.data.records : []
          const target = Number(res.data.data.targetWeight)
          weight.value = {
            current: records.length ? Number(records[0].weight).toFixed(2) : '--',
            target: Number.isFinite(target) ? target.toFixed(2) : '--',
            count: records.length
          }
        }
        resolve()
      },
      fail() { resolve() }
    })
  })
}

async function loadDrink() {
  const token = getToken()
  if (!token) {
    const d = JSON.parse(uni.getStorageSync('drinkWater') || '{}')
    const today = getTodayKeyISO()
    drink.value = { today: Number(d[today]) || 0, goal: Number(d.goal) || 1500 }
    return
  }
  await new Promise((resolve) => {
    uni.request({
      url: `${BASE_URL}/api/drink/today`,
      method: 'GET',
      header: { Authorization: `Bearer ${token}` },
      success(res) {
        if (res.data?.code === 200 && res.data?.data) {
          drink.value = {
            today: Number(res.data.data.todayDrank) || 0,
            goal: Number(res.data.data.drinkGoal) || 1500
          }
        }
        resolve()
      },
      fail() { resolve() }
    })
  })
}

async function loadExercise() {
  const token = getToken()
  if (!token) {
    const d = JSON.parse(uni.getStorageSync('exerciseRecords') || '{}')
    const today = getTodayKeyLocale()
    const list = Array.isArray(d[today]) ? d[today] : []
    exercise.value = {
      todayCalorie: list.reduce((s, x) => s + (Number(x.calorie) || 0), 0),
      goal: Number(d.goal) || 500,
      totalMinutes: list.reduce((s, x) => s + (Number(x.duration) || 0), 0)
    }
    return
  }
  await new Promise((resolve) => {
    uni.request({
      url: `${BASE_URL}/api/exercise/today`,
      method: 'GET',
      header: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      success(res) {
        if (res.statusCode === 200 && res.data?.code === 200 && res.data?.data) {
          const list = Array.isArray(res.data.data.records) ? res.data.data.records : []
          exercise.value = {
            todayCalorie: Number(res.data.data.todayCalorie) || 0,
            goal: Number(res.data.data.exerciseGoal) || 500,
            totalMinutes: list.reduce((s, x) => s + (Number(x.duration) || 0), 0)
          }
        }
        resolve()
      },
      fail() { resolve() }
    })
  })
}

async function loadData() {
  await loadProgressAligned()
  await Promise.all([loadWeight(), loadDrink(), loadExercise()])
}

onShow(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.container { min-height: 100vh; background: linear-gradient(135deg, #E3F2FD 0%, #F0F9FF 100%); padding: 20rpx; }
.card { background: #fff; border-radius: 16rpx; padding: 20rpx; box-shadow: 0 4rpx 12rpx rgba(79,161,242,.08); }
.title { display:block; font-size: 38rpx; font-weight:700; color:#4FA1F2; }
.sub { display:block; margin-bottom: 14rpx; color:#888; font-size: 22rpx; }
.section { margin-bottom: 14rpx; border: 1rpx solid #eef4fb; border-radius: 12rpx; padding: 12rpx; }
.section-title { display:block; font-size: 28rpx; font-weight:600; color:#333; margin-bottom: 8rpx; }
.row { display:flex; justify-content:space-between; font-size: 25rpx; color:#333; padding: 8rpx 0; border-bottom: 1rpx dashed #edf2f8; }
.row:last-child { border-bottom:none; }
</style>
