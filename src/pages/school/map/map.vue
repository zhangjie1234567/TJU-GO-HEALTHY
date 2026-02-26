<template>
  <view class="page">
    <view class="content">
      <view class="hero card">
        <text class="title">校园地图</text>
        <text class="subtitle">天津大学卫津路校区</text>
        <text class="address">天津市南开区卫津路92号</text>
        <view class="actions">
          <button class="btn primary" @click="openCampusLocation">打开校区定位</button>
          <button class="btn" @click="openWebMap">网页地图</button>
        </view>
      </view>

      <view class="card section">
        <text class="section-title">常用地点</text>
        <view class="place" v-for="place in places" :key="place.name" @click="openPlace(place)">
          <view class="place-main">
            <text class="place-name">{{ place.name }}</text>
            <text class="place-desc">{{ place.desc }}</text>
          </view>
          <text class="go">查看 ></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
const campus = {
  name: '天津大学卫津路校区',
  address: '天津市南开区卫津路92号',
  latitude: 39.10611,
  longitude: 117.17388
}

const places = [
  { name: '图书馆', desc: '学习与自习', keyword: '天津大学卫津路校区 图书馆' },
  { name: '体育馆', desc: '运动场馆', keyword: '天津大学卫津路校区 体育馆' },
  { name: '食堂', desc: '就餐服务', keyword: '天津大学卫津路校区 食堂' },
  { name: '校医院', desc: '医疗服务', keyword: '天津大学卫津路校区 校医院' }
]

const openInBrowser = (url) => {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank')
  }
}

const openCampusLocation = () => {
  try {
    if (typeof uni !== 'undefined' && typeof uni.openLocation === 'function') {
      uni.openLocation({
        latitude: campus.latitude,
        longitude: campus.longitude,
        name: campus.name,
        address: campus.address,
        scale: 16,
        fail: () => openWebMap()
      })
      return
    }
  } catch (e) {
    openWebMap()
  }
  openWebMap()
}

const openWebMap = () => {
  const url = `https://uri.amap.com/search?keyword=${encodeURIComponent(campus.name)}&city=天津`
  openInBrowser(url)
}

const openPlace = (place) => {
  const url = `https://uri.amap.com/search?keyword=${encodeURIComponent(place.keyword)}&city=天津`
  openInBrowser(url)
}
</script>

<style lang="scss" scoped>
.page {
  width: 100%;
  min-height: 100vh;
  background: #f7f8fa;
  box-sizing: border-box;
  padding: 24rpx;
  font-family: "PingFang SC", "Helvetica Neue", "Microsoft Yahei", Arial, sans-serif;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  box-sizing: border-box;
}

.hero {
  padding-top: 32rpx;
  padding-bottom: 32rpx;
}

.title {
  display: block;
  color: #1f2937;
  font-size: 38rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
}

.subtitle {
  display: block;
  color: #374151;
  font-size: 30rpx;
  margin-bottom: 8rpx;
}

.address {
  display: block;
  color: #6b7280;
  font-size: 26rpx;
  margin-bottom: 24rpx;
}

.actions {
  display: flex;
  gap: 16rpx;
}

.btn {
  flex: 1;
  height: 76rpx;
  line-height: 76rpx;
  border-radius: 12rpx;
  background: #eef2f7;
  color: #1f2937;
  font-size: 28rpx;
  border: none;
}

.btn.primary {
  background: #53b1ef;
  color: #fff;
}

.section-title {
  display: block;
  color: #111827;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.place {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #eceff3;
}

.place:last-child {
  border-bottom: none;
}

.place-name {
  display: block;
  color: #111827;
  font-size: 30rpx;
  margin-bottom: 4rpx;
}

.place-desc {
  display: block;
  color: #6b7280;
  font-size: 24rpx;
}

.go {
  color: #53b1ef;
  font-size: 26rpx;
}
</style>
