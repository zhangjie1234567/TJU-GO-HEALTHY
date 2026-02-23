<template>
  <view class="content">
    <image class="logo" src="/static/logo.png" mode="aspectFit" />
  </view>
</template>

<script setup>
</script>

<style lang="scss" scoped>
.content {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx;
  background: #f8f8f8;
}

/* 移除所有无用样式 */
.logo,.text-area, .title, .slogan, .login-btn, .login-btn-hover {
  display: none;
}
</style>
