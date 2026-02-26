<template>
  <view class="my-plan-container">
    <view class="plan-title">我的健康方案</view>
    <view class="plan-card">
      <view class="card-title">饮食方案</view>
      <view class="card-content">
        <text v-if="planData && planData.diet">{{ planData.diet }}</text>
        <text v-else>请先在AI页面生成饮食方案</text>
      </view>
    </view>
    <view class="plan-card">
      <view class="card-title">运动计划</view>
      <view class="card-content">
        <text v-if="planData && planData.exercise">{{ planData.exercise }}</text>
        <text v-else>请先在AI页面生成运动计划</text>
      </view>
    </view>
    <view class="plan-title">历史方案</view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const planData = ref(null)

onMounted(() => {
  // 读取AI生成的方案
  planData.value = uni.getStorageSync('myPlan') || null
})
</script>

<style scoped>
.my-plan-container {
  min-height: 100vh;
  background: #f5f6fa;
  padding: 24px;
}
.plan-title {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  margin-bottom: 24px;
  text-align: center;
}
.plan-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px #e6e6e6;
  margin-bottom: 20px;
  padding: 20px 16px;
}
.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #4e9afe;
  margin-bottom: 12px;
}
.card-content {
  font-size: 15px;
  color: #333;
  line-height: 1.7;
  white-space: pre-wrap;
}
</style>