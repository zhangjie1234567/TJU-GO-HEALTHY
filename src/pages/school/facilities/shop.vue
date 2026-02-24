<template>
  <view class="page">
    <view class="content">
      <text class="page-title">校内超市</text>
      
      <view class="info-card">
        <text class="info-label">具体位置</text>
        <text class="info-value">45教D区1楼</text>
      </view>
      
      <view class="info-card">
        <text class="info-label">开放时间</text>
        <text class="info-value">8:00-22:30</text>
      </view>
      
      <view class="info-card">
        <text class="info-label">经营范围</text>
        <text class="info-desc">生活用品、零食饮料、学习用品等</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #fff;
  padding-top: 24rpx;
  font-family: "PingFang SC", "Helvetica Neue", "Microsoft Yahei", Arial, sans-serif;
}

.content {
  padding: 24rpx;
}

.page-title {
  display: block; 
  font-size:34rpx; 
  font-weight:700; 
  margin-bottom: 20rpx; 
  margin-left: 10rpx;
}

.info-card {
  background: #BEEAFB;
  border-radius: 30rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.info-label {
  font-size: 28rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
  display: block;
}

.info-value {
  font-size: 26rpx;
  color: #333;
}

.info-desc {
  font-size: 24rpx;
  color: #333;
  line-height: 1.6;
}
</style>