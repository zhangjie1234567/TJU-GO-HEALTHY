<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack">‹</view>
      <text class="title">地图</text>
    </view>

    <view class="content">
      <text class="placeholder">地图内容（待实现）</text>
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
  } catch (e) {
    // ignore
  }
  if (window && window.history) window.history.back()
}

onMounted(() => {})
</script>

<style lang="scss" scoped>
.page {
  width: 100%;
  min-height: 100vh;
  background: #fff;
  box-sizing: border-box;
  padding-top: 24rpx;
  font-family: "PingFang SC", "Helvetica Neue", "Microsoft Yahei", Arial, sans-serif;
}

.header {
  display: flex;
  align-items: center;
  height: 88rpx;
  padding: 0 24rpx;
}

.back {
  font-size: 48rpx;
  line-height: 88rpx;
  width: 88rpx;
  text-align: left;
  color: #111;
}

.title {
  flex: 1;
  text-align: left;
  font-size: 36rpx;
  font-weight: 700;
  margin-left: 8rpx;
}

.content {
  padding: 30rpx;
}

.placeholder {
  display: block;
  color: #666;
  font-size: 28rpx;
}
</style>
