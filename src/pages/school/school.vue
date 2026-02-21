<template>
  <view class="page">
    <image class="bg" src="/static/首页人物图.png" mode="aspectFill" />
    <!-- http://localhost:5173/#/pages/school/school -->
    <view class="container">
      <view class="search">
        <input class="search-input" placeholder="搜索" />
        <image class="search-icon" src="/static/logo.png" mode="aspectFit" />
      </view>

      <view class="grid">
        <view class="grid-item" v-for="item in items" :key="item.name" @click="onItemClick(item)">
          <view class="icon-wrap" @click.stop="onItemClick(item)" @tap.stop="onItemClick(item)">
            <image :src="item.img" class="icon" mode="aspectFit" @click.stop="onItemClick(item)" @tap.stop="onItemClick(item)"></image>
          </view>
          <text class="label" @click.stop="onItemClick(item)" @tap.stop="onItemClick(item)">{{ item.label }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue'

// 保持搜索框不变；项目内已有图标请根据实际素材替换路径
const items = reactive([
  { name: 'map', label: '地图', img: '/static/school/main/map.png' },
  { name: 'timetable', label: '课表', img: '/static/school/main/timetable.png' },
  { name: 'fitness', label: '体测', img: '/static/school/main/fitness.png' },
  { name: 'facilities', label: '校内设施', img: '/static/school/main/facilities.png' },
  { name: 'canteen', label: '食堂', img: '/static/school/main/canteen.png' },
  { name: 'others', label: '其他服务', img: '/static/school/main/others.png' }
])

const onItemClick = (item) => {
  if (item.name === 'map') {
    try {
      // @ts-ignore
      if (typeof uni !== 'undefined' && uni.navigateTo) {
        // 使用 uni.navigateTo 跳转到 map 页面（school/map）
        // @ts-ignore
        uni.navigateTo({ url: '/pages/school/map/map' })
        return
      }
    } catch (e) {
      // ignore
    }
    // 浏览器环境 fallback
    const href = '/#/pages/school/map/map'
    window.location.href = href
  }
}
</script>

<style lang="scss" scoped>
.page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: #fff;
  overflow: hidden;
  font-family: "PingFang SC", "Helvetica Neue", "Microsoft Yahei", Arial, sans-serif;
}

.bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0.92;
  transform: scale(1.03);
}

.container {
  position: relative;
  z-index: 2;
  padding: 40rpx 30rpx 120rpx;
  box-sizing: border-box;
}

.search {
  display: flex;
  align-items: center;
  gap: 20rpx;
  background: rgba(255,255,255,0.95);
  border-radius: 60rpx;
  padding: 18rpx 22rpx;
  margin: 20rpx 0 36rpx 0;
  box-shadow: 0 6rpx 18rpx rgba(0,0,0,0.08);
}

.search-input {
  flex: 1;
  height: 56rpx;
  font-size: 28rpx;
  border: none;
  background: transparent;
  outline: none;
  color: #333;
}

.search-icon {
  width: 48rpx;
  height: 48rpx;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 34rpx 34rpx;
  justify-items: center;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
}

.icon-wrap {
  width: 300rpx;
  height: 300rpx;
  border-radius: 36rpx;
  background: rgba(255,255,255,0.98);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12rpx 30rpx rgba(0,0,0,0.12);
  border: 1rpx solid rgba(0,0,0,0.04);
  overflow: hidden;
}

.icon {
  width: 68%;
  height: 68%;
  object-fit: contain;
}

.label {
  margin-top: 16rpx;
  font-size: 30rpx;
  color: #111;
  font-weight: 700;
  letter-spacing: 1rpx;
}

/* Smaller screens adjustments */
@media (max-width: 360px) {
  .icon-wrap { width: 260rpx; height: 260rpx; }
  .label { font-size: 28rpx; }
  .container { padding-bottom: 80rpx; }
}

/* If you prefer white labels over dark ones (like mock), uncomment below */
/* .label { color: #fff; text-shadow: 0 2rpx 6rpx rgba(0,0,0,0.45); } */
</style>