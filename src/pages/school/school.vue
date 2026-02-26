<template>
  <view class="page">
    <image class="bg" src="/static/school/main/background.png" mode="aspectFill" />
    <!-- http://localhost:5173/#/pages/school/school -->
    <!-- display: block; font-size:34rpx; font-weight:700; margin-bottom: 20rpx; margin-left: 10rpx; -->
    <view class="container">
      <view class="search">
        <view class="search-box">
          <input class="search-input" placeholder="搜索" placeholder-style="color: #999" />
          <image class="search-icon" src="/static/school/main/search_icon.png" mode="aspectFit" />
        </view>
      </view>

      <view class="grid">
        <view class="grid-item" v-for="item in items" :key="item.name" @click="onItemClick(item)">
          <view class="icon-wrap">
            <image :src="item.img" class="icon" mode="aspectFit" />
          </view>
          <image :src="item.wordImg" class="label-img" mode="aspectFit" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
const items = [
  { name: 'map', label: '地图', img: '/static/school/main/map.png', wordImg: '/static/school/main/map_word.png' },
  { name: 'timetable', label: '课表', img: '/static/school/main/timetable.png', wordImg: '/static/school/main/timetable_word.png' },
  { name: 'fitness', label: '体测', img: '/static/school/main/fitness.png', wordImg: '/static/school/main/fitness_word.png' },
  { name: 'facilities', label: '校内设施', img: '/static/school/main/facilities.png', wordImg: '/static/school/main/facilities_word.png' },
  { name: 'canteen', label: '食堂', img: '/static/school/main/canteen.png', wordImg: '/static/school/main/canteen_word.png' },
  { name: 'others', label: '其他服务', img: '/static/school/main/others.png', wordImg: '/static/school/main/others_word.png' }
]

const routeMap = {
  map: '/pages/school/map/map',
  timetable: '/pages/school/schedule/schedule',
  fitness: '/pages/school/fitness/fitness',
  facilities: '/pages/school/facilities/facilities',
  canteen: '/pages/school/canteen/canteen',
  others: '/pages/school/others/others'
}

const fallbackToHashRoute = (url) => {
  if (typeof window === 'undefined') {
    return
  }
  window.location.hash = `#${url}`
}

const onItemClick = (item) => {
  const url = routeMap[item.name]
  if (!url) {
    return
  }

  try {
    // @ts-ignore
    if (typeof uni !== 'undefined' && typeof uni.navigateTo === 'function') {
      // @ts-ignore
      uni.navigateTo({
        url,
        fail: () => fallbackToHashRoute(url)
      })
      return
    }
  } catch (e) {
    fallbackToHashRoute(url)
  }

  fallbackToHashRoute(url)
}
</script>

<style lang="scss" scoped>
.page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: #fff;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: "PingFang SC", "Helvetica Neue", "Microsoft Yahei", Arial, sans-serif;
}

.bg {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw; /* 使背景占满视口宽度 */
  height: 100vh; /* 使背景占满视口高度 */
  z-index: 1;
  opacity: 0.95;
  object-fit: cover; /* 保持覆盖且居中裁切 */
  transform: none; /* 取消缩放避免超出 */
}

.container {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  padding: 40rpx 30rpx calc(180rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.search {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10rpx 0 28rpx 0;
}

.search-box {
  display: flex;
  align-items: center;
  width: 92%;
  height: 88rpx;
  background: rgba(255,255,255,0.98);
  border-radius: 60rpx;
  padding: 0 30rpx;
  box-sizing: border-box;
}

.search-input {
  flex: 1;
  height: 100%;
  font-size: 32rpx;
  color: #333;
  background: transparent;
  border: none;
  outline: none;
}

.search-icon {
  width: 40rpx;
  height: 40rpx;
  margin-left: 20rpx;
  object-fit: contain;
  display: block;
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
  justify-content: center;
}

.icon-wrap {
  width: 300rpx;
  height: 300rpx;
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.label-img {
  width: 160rpx;
  height: 48rpx;
  margin-top: 14rpx;
  object-fit: contain;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

/* Smaller screens adjustments */
@media (max-width: 360px) {
  .icon-wrap { width: 260rpx; height: 260rpx; }
  .label-img { width: 140rpx; height: 44rpx }
  .container { padding-bottom: calc(140rpx + env(safe-area-inset-bottom)); }
}
</style>