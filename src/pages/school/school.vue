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
          <view class="icon-wrap" @click.stop="onItemClick(item)" @tap.stop="onItemClick(item)">
            <image :src="item.img" class="icon" mode="aspectFit" @click.stop="onItemClick(item)" @tap.stop="onItemClick(item)" />
          </view>
          <image :src="item.wordImg" class="label-img" mode="aspectFit" @click.stop="onItemClick(item)" @tap.stop="onItemClick(item)" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue'

// 保持搜索框不变；项目内已有图标请根据实际素材替换路径
const items = reactive([
  { name: 'map', label: '地图', img: '/static/school/main/map.png', wordImg: '/static/school/main/map_word.png' },
  { name: 'timetable', label: '课表', img: '/static/school/main/timetable.png', wordImg: '/static/school/main/timetable_word.png' },
  { name: 'fitness', label: '体测', img: '/static/school/main/fitness.png', wordImg: '/static/school/main/fitness_word.png' },
  { name: 'facilities', label: '校内设施', img: '/static/school/main/facilities.png', wordImg: '/static/school/main/facilities_word.png' },
  { name: 'canteen', label: '食堂', img: '/static/school/main/canteen.png', wordImg: '/static/school/main/canteen_word.png' },
  { name: 'others', label: '其他服务', img: '/static/school/main/others.png', wordImg: '/static/school/main/others_word.png' }
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
    return
  }

  if (item.name === 'timetable') {
    try {
      // @ts-ignore
      if (typeof uni !== 'undefined' && uni.navigateTo) {
        // 跳转到 school 下的 schedule 页面
        // @ts-ignore
        uni.navigateTo({ url: '/pages/school/schedule/schedule' })
        return
      }
    } catch (e) {}
    const href = '/#/pages/school/schedule/schedule'
    window.location.href = href
    return
  }

  if (item.name === 'fitness') {
    try {
      // @ts-ignore
      if (typeof uni !== 'undefined' && uni.navigateTo) {
        // 跳转到 school 下的 fitness 页面
        // @ts-ignore
        uni.navigateTo({ url: '/pages/school/fitness/fitness' })
        return
      }
    } catch (e) {}
    const href = '/#/pages/school/fitness/fitness'
    window.location.href = href
    return
  }

  if (item.name === 'facilities') {
    try {
      // @ts-ignore
      if (typeof uni !== 'undefined' && uni.navigateTo) {
        // 跳转到 school 下的 facilities 页面
        // @ts-ignore
        uni.navigateTo({ url: '/pages/school/facilities/facilities' })
        return
      }
    } catch (e) {}
    const href = '/#/pages/school/facilities/facilities'
    window.location.href = href
    return
  }

  if (item.name === 'canteen') {
    try {
      // @ts-ignore
      if (typeof uni !== 'undefined' && uni.navigateTo) {
        // 跳转到 school 下的 canteen 页面
        // @ts-ignore
        uni.navigateTo({ url: '/pages/school/canteen/canteen' })
        return
      }
    } catch (e) {}
    const href = '/#/pages/school/canteen/canteen'
    window.location.href = href
    return
  }

  if (item.name === 'others') {
    try {
      // @ts-ignore
      if (typeof uni !== 'undefined' && uni.navigateTo) {
        // 跳转到 school 下的 others 页面
        // @ts-ignore
        uni.navigateTo({ url: '/pages/school/others/others' })
        return
      }
    } catch (e) {}
    const href = '/#/pages/school/others/others'
    window.location.href = href
    return
  }
}
</script>

<style lang="scss" scoped>
.page {
  position: relative;
  width: 100%;
  height: 100vh; /* 固定窗口高度，禁止页面高度随内容增长 */
  background: #fff;
  overflow: hidden; /* 禁止滚动 */
  font-family: "PingFang SC", "Helvetica Neue", "Microsoft Yahei", Arial, sans-serif;
}

.bg {
  position: absolute;
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
  height: 100vh; /* 与页面同高，内容超出将被裁切 */
  padding: 40rpx 30rpx 120rpx;
  box-sizing: border-box;
  overflow: hidden; /* 防止容器内部产生滚动 */
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
  .container { padding-bottom: 80rpx; }
}
</style>