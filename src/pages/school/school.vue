<template>
  <view class="container">
    <view class="hero-card">
      <text class="hero-title">校园服务</text>
      <text class="hero-subtitle">课表、体测、食堂一站直达</text>
    </view>

    <view class="module-list">
      <view class="module-card" v-for="item in items" :key="item.name" @click="onItemClick(item)">
        <view class="module-left">
          <text class="module-emoji">{{ item.emoji }}</text>
          <view class="module-meta">
            <text class="module-title">{{ item.label }}</text>
            <text class="module-desc">{{ item.desc }}</text>
          </view>
        </view>
        <text class="module-arrow">→</text>
      </view>
    </view>

    <view style="height: 120rpx;"></view>
  </view>
</template>

<script setup>
import { reactive } from 'vue'

const items = reactive([
  { name: 'canteen', label: '食堂', emoji: '🍱', desc: '浏览校内食堂菜单' },
  { name: 'timetable', label: '课表', emoji: '📚', desc: '快速查看课程安排' },
  { name: 'fitness', label: '体测', emoji: '🏃', desc: '跟踪体测项目与成绩' },
])

const routeMap = {
  timetable: '/pages/school/schedule/schedule',
  fitness: '/pages/school/fitness/fitness',
  canteen: '/pages/school/canteen/canteen'
}

const onItemClick = (item) => {
  const url = routeMap[item.name]
  if (!url) return
  uni.navigateTo({ url })
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #E3F2FD 0%, #F0F9FF 100%);
  padding: 28rpx;
  box-sizing: border-box;
}

.hero-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 30rpx;
  box-shadow: 0 8rpx 24rpx rgba(79, 161, 242, 0.12);
  margin-bottom: 22rpx;
}

.hero-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #2a4b6b;
  margin-bottom: 10rpx;
}

.hero-subtitle {
  display: block;
  font-size: 26rpx;
  color: #6d8eae;
}

.module-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.module-card {
  background: #ffffff;
  border-radius: 22rpx;
  padding: 26rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 6rpx 20rpx rgba(79, 161, 242, 0.1);
}

.module-left {
  display: flex;
  align-items: center;
  gap: 18rpx;
}

.module-emoji {
  display: block;
  font-size: 54rpx;
  line-height: 1;
}

.module-meta {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.module-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #2a4b6b;
}

.module-desc {
  display: block;
  font-size: 24rpx;
  color: #7f9cb7;
}

.module-arrow {
  font-size: 34rpx;
  color: #4FA1F2;
  font-weight: 600;
}
</style>