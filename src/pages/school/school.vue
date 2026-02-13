<template>
  <view class="page">
    <image class="bg" src="/static/首页人物图.png" mode="aspectFill" />

    <view class="container">
      <view class="search">
        <input class="search-input" placeholder="搜索" />
        <image class="search-icon" src="/static/logo.png" mode="aspectFit" />
      </view>

      <view class="grid">
        <view class="grid-item" v-for="item in items" :key="item.name">
          <view class="icon-wrap">
            <image :src="item.img" class="icon" mode="aspectFit" />
          </view>
          <text class="label">{{ item.label }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue'

const items = reactive([
  { name: 'map', label: '地图', img: '/static/首页功能图标/首页AI对话模块主图.png' },
  { name: 'timetable', label: '课表与食堂', img: '/static/首页功能图标/首页AI对话模块主图.png' },
  { name: 'fitness', label: '体测', img: '/static/首页功能图标/运动图.png' },
  { name: 'service', label: '服务', img: '/static/首页功能图标/首页人物图.png' },
  { name: 'water', label: '饮水机记录', img: '/static/首页功能图标/喝水图标.png' },
  { name: 'school', label: '学校', img: '/static/school_logo.png' }
])
</script>

<style lang="scss" scoped>
.page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: #fff;
  overflow: hidden;
}

.bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0.95;
}

.container {
  position: relative;
  z-index: 2;
  padding: 40rpx 30rpx 100rpx;
  box-sizing: border-box;
}

.search {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: rgba(255,255,255,0.9);
  border-radius: 60rpx;
  padding: 20rpx 24rpx;
  margin: 24rpx 0 40rpx 0;
  box-shadow: 0 6rpx 18rpx rgba(0,0,0,0.08);
}

.search-input {
  flex: 1;
  height: 56rpx;
  font-size: 28rpx;
  border: none;
  background: transparent;
  outline: none;
}

.search-icon {
  width: 48rpx;
  height: 48rpx;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 36rpx 34rpx;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.icon-wrap {
  width: 320rpx;
  height: 320rpx;
  border-radius: 48rpx;
  background: rgba(255,255,255,0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.12);
  border: 1rpx solid rgba(0,0,0,0.05);
  overflow: hidden;
}

.icon {
  width: 70%;
  height: 70%;
  object-fit: contain;
}

.label {
  margin-top: 18rpx;
  font-size: 28rpx;
  color: #ffffff;
  text-shadow: 0 2rpx 6rpx rgba(0,0,0,0.45);
  font-weight: 600;
}

/* Responsive adjustments for smaller screens */
@media (max-width: 360px) {
  .icon-wrap { width: 300rpx; height: 300rpx; }
}
</style>