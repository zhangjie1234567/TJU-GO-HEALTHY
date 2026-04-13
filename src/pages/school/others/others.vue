<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack">‹</view>
      <text class="title">其他服务</text>
    </view>

    <view class="content">
      <text class="placeholder">开发中，敬请期待</text>
      <text class="status">后端: {{ status }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getApiBaseUrl } from '@/config.js'

const apiUrl = ref(getApiBaseUrl())
const status = ref('未连接')

const check = async () => {
  try {
    const res = await fetch(apiUrl.value + '/maps')
    if (res.ok) status.value = '在线'
  } catch (e) { status.value = '离线' }
}

onMounted(() => { check() })

const goBack = () => { try{ if (typeof uni !== 'undefined' && uni.navigateBack) { uni.navigateBack({ delta: 1 }); return } } catch(e){} if (window && window.history) window.history.back() }
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#fff; padding-top:24rpx }
.header { display:flex; align-items:center; height:88rpx; padding:0 24rpx }
.back { font-size:48rpx; line-height:88rpx; width:88rpx }
.title { font-size:36rpx; font-weight:700; margin-left:8rpx }
.content { padding:24rpx }
.placeholder { color:#666; font-size:28rpx }
.status { margin-top:12rpx; color:#666 }
</style>
