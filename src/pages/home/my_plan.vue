<template>
  <view class="my-plan-container">
    <view class="plan-card">
      <view class="card-header" @click="toggleExpand('diet')">
        <view class="card-title">饮食方案</view>
        <view class="expand-icon" :class="{ expanded: expandedDiet }">›</view>
      </view>
      <view v-if="expandedDiet" class="card-content">
        <text v-if="planData && planData.diet">{{ planData.diet }}</text>
        <text v-else class="placeholder">请先在AI页面生成饮食方案</text>
      </view>
      <view v-else class="card-preview">
        <text v-if="planData && planData.diet">{{ getPreview(planData.diet) }}</text>
        <text v-else class="placeholder">请先在AI页面生成饮食方案</text>
      </view>
    </view>

    <view class="plan-card">
      <view class="card-header" @click="toggleExpand('exercise')">
        <view class="card-title">运动计划</view>
        <view class="expand-icon" :class="{ expanded: expandedExercise }">›</view>
      </view>
      <view v-if="expandedExercise" class="card-content">
        <text v-if="planData && planData.exercise">{{ planData.exercise }}</text>
        <text v-else class="placeholder">请先在AI页面生成运动计划</text>
      </view>
      <view v-else class="card-preview">
        <text v-if="planData && planData.exercise">{{ getPreview(planData.exercise) }}</text>
        <text v-else class="placeholder">请先在AI页面生成运动计划</text>
      </view>
    </view>

    <view class="plan-section-title">历史方案</view>
    <view class="history-placeholder">暂无历史方案</view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const planData = ref(null)
const expandedDiet = ref(false)
const expandedExercise = ref(false)

onMounted(() => {
  // 读取AI生成的方案
  const savedPlan = uni.getStorageSync('myPlan')
  if (savedPlan && (savedPlan.diet || savedPlan.exercise)) {
    planData.value = savedPlan
  }
})

function toggleExpand(type) {
  if (type === 'diet') {
    expandedDiet.value = !expandedDiet.value
  } else if (type === 'exercise') {
    expandedExercise.value = !expandedExercise.value
  }
}

function getPreview(text) {
  if (!text) return ''
  // 显示前100个字符加省略号
  return text.length > 100 ? text.substring(0, 100) + '...' : text
}
</script>

<style scoped>
.my-plan-container {
  min-height: 100vh;
  background: #f5f6fa;
  padding: 24px 16px;
}

.plan-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
  padding: 0;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.card-header:active {
  background-color: #f5f6fa;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #4e9afe;
}

.expand-icon {
  font-size: 24px;
  color: #999;
  transition: transform 0.3s;
  transform: rotate(0deg);
}

.expand-icon.expanded {
  transform: rotate(90deg);
  color: #4e9afe;
}

.card-content {
  padding: 16px;
  font-size: 14px;
  color: #333;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

.card-preview {
  padding: 16px;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.placeholder {
  color: #999;
  font-size: 14px;
}

.plan-section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-top: 24px;
  margin-bottom: 12px;
  padding: 0 4px;
}

.history-placeholder {
  background: #fff;
  border-radius: 12px;
  padding: 32px 16px;
  text-align: center;
  color: #999;
  font-size: 14px;
}
</style>