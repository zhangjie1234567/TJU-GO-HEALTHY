<template>
  <view class="page">
    <view class="content">
      <text class="placeholder">开发中，敬请期待</text>
    </view>
  </view>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {})
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#fff; padding-top:24rpx; font-family: "PingFang SC", "Microsoft Yahei", Arial, sans-serif }

.content { padding:24rpx }
.placeholder { color:#666; font-size:28rpx }
</style>
