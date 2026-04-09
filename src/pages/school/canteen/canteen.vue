<template>
  <view class="page">
    <view class="content">
      <view class="hero-card" @click="goToChoice">
        <text class="hero-emoji">🍽️</text>
        <view class="hero-text-wrap">
          <text class="hero-title">今天吃什么</text>
          <text class="hero-subtitle">随机推荐，快速决定午晚餐</text>
        </view>
        <text class="hero-arrow">→</text>
      </view>

      <view class="section-card">
        <text class="section">食堂实时人流</text>
        <view class="report-form">
          <picker mode="selector" :range="canteenNames" :value="reportForm.canteenIndex" @change="onCanteenChange">
            <view class="form-picker">我在：{{ canteenNames[reportForm.canteenIndex] }}</view>
          </picker>
          <picker mode="selector" :range="densityLabels" :value="reportForm.densityIndex" @change="onDensityChange">
            <view class="form-picker">当前人流：{{ densityLabels[reportForm.densityIndex] }}</view>
          </picker>
          <button class="report-btn" @click="submitFlowReport">提交人流上报</button>
        </view>

        <view class="flow-list" v-if="flowStats.length > 0">
          <view class="row" v-for="(c, i) in flowStats" :key="i">
            <text class="cname">{{ c.name }}</text>
            <view class="bar-track">
              <view class="bar" :style="{ width: c.width }" />
            </view>
            <text class="flow-text">{{ c.label }}</text>
          </view>
        </view>
        <text v-else class="note">暂无上报数据，快来提交你所在食堂的人流情况。</text>
      </view>

      <view class="section-card">
        <text class="section">今日菜单</text>
        <view class="menu-card canteen-list">
          <view class="canteen-item" v-for="(c, idx) in canteens" :key="idx" @click="goToMenu(c.name)">
            {{ c.name }}
          </view>
        </view>
      </view>

      <view style="height: 120rpx;"></view>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

const canteens = reactive([
  { name: '留园' },
  { name: '梅园' },
  { name: '竹园' },
  { name: '兰园' },
  { name: '菊园' },
  { name: '桃园' },
  { name: '棠园' }
])

const FLOW_REPORT_KEY = 'canteen_flow_reports_v1'
const densityLabels = ['很空', '适中', '拥挤', '爆满']
const densityValues = [25, 50, 75, 95]
const canteenNames = canteens.map(c => c.name)
const reportForm = reactive({
  canteenIndex: 0,
  densityIndex: 1
})
const flowReports = ref([])

const apiUrl = ref('http://localhost:8080')

const loadFlowReports = () => {
  try {
    const raw = uni.getStorageSync(FLOW_REPORT_KEY)
    const parsed = typeof raw === 'string' ? JSON.parse(raw || '[]') : raw
    flowReports.value = Array.isArray(parsed) ? parsed : []
  } catch (e) {
    flowReports.value = []
  }
}

const saveFlowReports = () => {
  uni.setStorageSync(FLOW_REPORT_KEY, JSON.stringify(flowReports.value))
}

const flowStats = computed(() => {
  const now = Date.now()
  const validWindow = 1000 * 60 * 60 * 6

  return canteenNames.map((name) => {
    const list = flowReports.value.filter(item => item.canteenName === name && now - Number(item.timestamp || 0) <= validWindow)
    if (!list.length) {
      return {
        name,
        width: '0%',
        label: '暂无上报'
      }
    }

    const avg = Math.round(list.reduce((sum, item) => sum + Number(item.densityValue || 0), 0) / list.length)
    const nearestIndex = densityValues.reduce((best, val, idx) => {
      return Math.abs(val - avg) < Math.abs(densityValues[best] - avg) ? idx : best
    }, 0)

    return {
      name,
      width: `${Math.max(8, avg)}%`,
      label: `${densityLabels[nearestIndex]} · ${list.length}人上报`
    }
  })
})

const onCanteenChange = (e) => {
  reportForm.canteenIndex = Number(e?.detail?.value || 0)
}

const onDensityChange = (e) => {
  reportForm.densityIndex = Number(e?.detail?.value || 0)
}

const submitFlowReport = () => {
  const canteenName = canteenNames[reportForm.canteenIndex]
  const densityLabel = densityLabels[reportForm.densityIndex]
  const densityValue = densityValues[reportForm.densityIndex]

  if (!canteenName) {
    uni.showToast({ title: '请选择食堂', icon: 'none' })
    return
  }

  flowReports.value.unshift({
    canteenName,
    densityLabel,
    densityValue,
    timestamp: Date.now()
  })

  flowReports.value = flowReports.value.slice(0, 200)
  saveFlowReports()
  uni.showToast({ title: '已提交人流上报', icon: 'none' })
}

const formatDate = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const apiGet = async (path) => {
  const url = `${apiUrl.value}${path}`
  try {
    if (typeof uni !== 'undefined' && uni.request) {
      return new Promise((resolve, reject) => {
        uni.request({ url, method: 'GET', success: (res) => resolve(res.data), fail: reject })
      })
    }
    const res = await fetch(url)
    return await res.json()
  } catch (e) {
    console.warn('apiGet failed', e)
    return null
  }
}

const goToChoice = () => {
  try {
    if (typeof uni !== 'undefined' && uni.navigateTo) {
      uni.navigateTo({ url: '/pages/school/canteen/choice' })
      return
    }
  } catch (e) {}
  window.location.href = '/#/pages/school/canteen/choice'
}

const goToMenu = async (canteenName) => {
  const today = formatDate(new Date())
  try {
    await apiGet(`/canteens/menus?canteenName=${encodeURIComponent(canteenName)}&date=${today}`)
  } catch (e) {}

  const map = { '留园': 'liu', '梅园': 'mei', '竹园': 'zhu', '兰园': 'lan', '菊园': 'ju', '桃园': 'tao', '棠园': 'tang' }
  const code = map[canteenName] || ''
  try {
    if (typeof uni !== 'undefined' && uni.navigateTo) {
      const url = code
        ? `/pages/school/canteen/menu/${code}?canteenName=${encodeURIComponent(canteenName)}&date=${today}`
        : `/pages/school/canteen/menu/liu?canteenName=${encodeURIComponent(canteenName)}&date=${today}`
      uni.navigateTo({ url })
      return
    }
  } catch (e) {}

  window.location.href = code
    ? `/#/pages/school/canteen/menu/${code}?canteenName=${encodeURIComponent(canteenName)}&date=${today}`
    : `/#/pages/school/canteen/menu/liu?canteenName=${encodeURIComponent(canteenName)}&date=${today}`
}

loadFlowReports()
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(135deg, #E3F2FD 0%, #F0F9FF 100%);
  font-family: "PingFang SC", "Microsoft Yahei", Arial, sans-serif;
}

.content {
  padding: 24rpx;
}

.hero-card,
.section-card {
  background: #ffffff;
  border-radius: 24rpx;
  box-shadow: 0 6rpx 18rpx rgba(79, 161, 242, 0.12);
  margin-bottom: 20rpx;
}

.hero-card {
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.hero-emoji {
  font-size: 46rpx;
  line-height: 1;
}

.hero-text-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.hero-title {
  display: block;
  color: #2a4b6b;
  font-size: 32rpx;
  font-weight: 700;
}

.hero-subtitle {
  display: block;
  color: #7f9cb7;
  font-size: 24rpx;
}

.hero-arrow {
  color: #4FA1F2;
  font-size: 32rpx;
  font-weight: 700;
}

.section-card {
  padding: 20rpx;
}

.report-form {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.form-picker {
  min-height: 72rpx;
  border-radius: 12rpx;
  background: #f5f9ff;
  border: 1rpx solid #dcecff;
  color: #2a4b6b;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  padding: 0 18rpx;
}

.report-btn {
  height: 70rpx;
  border-radius: 14rpx;
  background: linear-gradient(120deg, #4FA1F2, #80D0FF);
  color: #fff;
  border: none;
  font-size: 24rpx;
  font-weight: 600;
}

.flow-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.section {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: #2a4b6b;
  margin: 6rpx 0 14rpx;
}

.row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 8rpx;
}

.row:last-child {
  margin-bottom: 0;
}

.cname {
  width: 80rpx;
  font-weight: 700;
  font-size: 26rpx;
  color: #35536f;
}

.bar-track {
  flex: 1;
  height: 12rpx;
  background: #e8f1ff;
  margin-left: 20rpx;
  border-radius: 999rpx;
  overflow: hidden;
}

.flow-text {
  margin-left: 12rpx;
  font-size: 22rpx;
  color: #6c8399;
  min-width: 140rpx;
  text-align: right;
}

.bar {
  height: 100%;
  background: linear-gradient(120deg, #4FA1F2, #80D0FF);
  border-radius: 999rpx;
}

.menu-card {
  border-radius: 18rpx;
  padding: 2rpx 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.canteen-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.canteen-item {
  background: #f5f9ff;
  color: #2a4b6b;
  border: 1rpx solid #dcecff;
  padding: 14rpx 18rpx;
  border-radius: 18rpx;
  cursor: pointer;
  min-width: 120rpx;
  text-align: center;
  font-weight: 700;
}

.canteen-item:active {
  transform: scale(0.98);
}

.note {
  margin-top: 14rpx;
  color: #7f9cb7;
  font-size: 22rpx;
  text-align: center;
}

@media (max-width: 360px) {
  .hero-title {
    font-size: 30rpx;
  }

  .hero-subtitle {
    font-size: 22rpx;
  }

  .canteen-item {
    min-width: 108rpx;
  }
}
</style>
