<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack">‹</view>
      <text class="title">体测数据</text>
    </view>

    <view class="content">
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
      </view>

      <text class="section-title">锻炼方案</text>
      <view class="plan-card">
        <text class="plan-text">先 5 分钟热身（含原地高抬腿、弓步压腿等），再 15 分钟核心训练（平板支撑、仰卧卷腹等），最后 10 分钟拉伸放松；适合新手，建议每周 3-5 次，可根据自身情况调整。</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onMounted } from 'vue'

const goBack = () => {
  try {
    // @ts-ignore
    if (typeof uni !== 'undefined' && uni.navigateBack) {
      uni.navigateBack({ delta: 1 })
      setTimeout(() => {
        // @ts-ignore
        if (typeof uni !== 'undefined' && uni.switchTab) {
          uni.switchTab({ url: '/pages/school/school' })
        }
      }, 300)
      return
    }
  } catch (e) {}
  if (window && window.history) window.history.back()
}

onMounted(() => {})
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
.plan-card { background:#BEEAFB; border-radius:30rpx; padding:20rpx }
.plan-text { font-size:24rpx; line-height:1.6 }
</style>
