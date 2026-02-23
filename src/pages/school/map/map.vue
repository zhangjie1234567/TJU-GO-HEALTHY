<template>
  <view class="page">
    <view class="content">
      <text class="placeholder">地图内容（待实现）</text>
    </view>
  </view>
</template>

<script setup>
import { onMounted } from 'vue'

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



.content {
  padding: 30rpx;
}

.placeholder {
  display: block;
  color: #666;
  font-size: 28rpx;
}
</style>
