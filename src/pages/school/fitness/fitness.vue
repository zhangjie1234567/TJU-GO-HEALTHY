<template>
  <view class="page">
    <view class="content">
      <text class="section-title">体测数据</text>
      <view class="stat-card">
        <view class="stat-row">
          <text class="stat-name">1000m</text>
          <text class="stat-value">3m56s</text>
        </view>
        <view class="stat-row">
          <text class="stat-name">引体向上</text>
          <text class="stat-value">10个</text>
        </view>
        <view class="stat-row">
          <text class="stat-name">跳远</text>
          <text class="stat-value">2.56 m</text>
        </view>
        <view class="stat-row">
          <text class="stat-name">肺活量</text>
          <text class="stat-value">5400</text>
        </view>
        <view class="stat-row">
          <text class="stat-name">50m</text>
          <text class="stat-value">6.3 s</text>
        </view>
        <view class="btn-container">
          <view class="btn-detail" @click="goToFitnessDetail">详细信息</view>
        </view>
      </view>

      <text class="section-title">锻炼方案</text>
      <view class="plan-card">
        <text class="plan-text">先 5 分钟热身（含原地高抬腿、弓步压腿等），再 15 分钟核心训练（平板支撑、仰卧卷腹等），最后 10 分钟拉伸放松；适合新手，建议每周 3-5 次，可根据自身情况调整。</text>
        <view class="btn-container">
          <view class="btn-detail" @click="goToExerciseDetail">详细信息</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onMounted } from 'vue'

const goToFitnessDetail = () => {
  try {
    // @ts-ignore
    if (typeof uni !== 'undefined' && uni.navigateTo) {
      uni.navigateTo({ url: '/pages/school/fitness/fitness_detail' })
      return
    }
  } catch (e) {}
  // 浏览器环境 fallback
  const href = '/#/pages/school/fitness/fitness_detail'
  window.location.href = href
}

const goToExerciseDetail = () => {
  try {
    // @ts-ignore
    if (typeof uni !== 'undefined' && uni.navigateTo) {
      uni.navigateTo({ url: '/pages/school/fitness/exercise_detail' })
      return
    }
  } catch (e) {}
  // 浏览器环境 fallback
  const href = '/#/pages/school/fitness/exercise_detail'
  window.location.href = href
}

onMounted(() => {})
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#fff; padding-top:24rpx; font-family: "PingFang SC", "Helvetica Neue", "Microsoft Yahei", Arial, sans-serif }

.content { padding:24rpx }
.stat-card { background:#BEEAFB; border-radius:30rpx; padding:24rpx; margin-bottom:28rpx }
.stat-row { display:flex; justify-content:space-between; margin-bottom:12rpx }
.stat-name { font-weight:800; font-size:28rpx }
.stat-value { font-weight:800; font-size:28rpx }
.section-title { display: block; font-size:34rpx; font-weight:700; margin-bottom: 20rpx; margin-left: 10rpx; }
.plan-card { background:#BEEAFB; border-radius:30rpx; padding:20rpx }
.plan-text { font-size:24rpx; line-height:1.6 }

.btn-container {
  display: flex;
  justify-content: center;
  margin-top: 20rpx;
}

.btn-detail {
  background: #fff;
  color: #333;
  padding: 12rpx 32rpx;
  border-radius: 24rpx;
  font-size: 24rpx;
  font-weight: 700;
  text-align: center;
}
</style>
