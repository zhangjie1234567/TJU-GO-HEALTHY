<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack">‹</view>
      <text class="title">体测数据</text>
    </view>

    <view class="content">
      <view class="stat-card">
        <view class="stat-row" v-for="(s, i) in stats" :key="i">
          <text class="stat-name">{{ s.itemName }}</text>
          <text class="stat-value">{{ s.value }}</text>
        </view>
      </view>

      <text class="section-title">锻炼方案</text>
      <view class="plan-card" @click="openExerciseDetail" role="button" tabindex="0">
        <text class="plan-text">{{ planText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const apiUrl = ref('http://localhost:8080')
const stats = ref([])
const planText = ref('先 5 分钟热身（含原地高抬腿、弓步压腿等），再 15 分钟核心训练，最后拉伸放松。')

const apiGet = async (path) => {
  const url = `${apiUrl.value}${path}`
  try {
    if (typeof uni !== 'undefined' && uni.request) {
      return new Promise((resolve, reject) => {
        // @ts-ignore
        uni.request({ url, method: 'GET', success: (res) => resolve(res.data), fail: reject })
      })
    }
    const res = await fetch(url)
    return await res.json()
  } catch (e) { console.warn(e); return null }
}

onMounted(async () => {
  const res = await apiGet('/fitness')
  if (res && res.data) {
    stats.value = res.data.map(item => ({ itemName: item.itemName || item.name || '项目', value: item.value || item.score || '-' }))
  } else {
    stats.value = [ { itemName: '1000m', value: '3m56s' }, { itemName: '引体向上', value: '10个' }, { itemName: '跳远', value: '2.56 m' } ]
  }
})

const goBack = () => { try{ if (typeof uni !== 'undefined' && uni.navigateBack) { uni.navigateBack({ delta: 1 }); return } } catch(e){} if (window && window.history) window.history.back() }

const openExerciseDetail = () => {
  try {
    if (typeof uni !== 'undefined' && uni.navigateTo) {
      // @ts-ignore
      uni.navigateTo({ url: '/pages/school/fitness/exercise_detail' })
      return
    }
  } catch (e) {}
  // H5 fallback
  try { window.location.href = '/#/pages/school/fitness/exercise_detail' } catch (e) {}
}
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#fff; padding-top:24rpx; font-family: "PingFang SC", "Helvetica Neue", "Microsoft Yahei", Arial, sans-serif }
.header { display:flex; align-items:center; height:88rpx; padding:0 24rpx }
.back { font-size:48rpx; line-height:88rpx; width:88rpx; color:#111 }
.title { font-size:36rpx; font-weight:700; margin-left:8rpx }
.content { padding:24rpx }
.stat-card { background:#BEEAFB; border-radius:30rpx; padding:24rpx; margin-bottom:28rpx }
.stat-row { display:flex; justify-content:space-between; margin-bottom:12rpx }
.stat-name { font-weight:800; font-size:28rpx }
.stat-value { font-weight:800; font-size:28rpx }
.section-title { font-size:34rpx; font-weight:700; margin:12rpx 0 }
.plan-card { background:#BEEAFB; border-radius:30rpx; padding:20rpx; cursor: pointer }
.plan-text { font-size:24rpx; line-height:1.6 }
</style>
