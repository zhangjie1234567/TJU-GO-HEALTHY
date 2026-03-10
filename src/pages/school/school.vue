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
import { reactive, ref } from 'vue'

// 保持搜索框不变；项目内已有图标请根据实际素材替换路径
const items = reactive([
  { name: 'map', label: '地图', img: '/static/school/main/map.png', wordImg: '/static/school/main/map_word.png' },
  { name: 'timetable', label: '课表', img: '/static/school/main/timetable.png', wordImg: '/static/school/main/timetable_word.png' },
  { name: 'fitness', label: '体测', img: '/static/school/main/fitness.png', wordImg: '/static/school/main/fitness_word.png' },
  { name: 'facilities', label: '校内设施', img: '/static/school/main/facilities.png', wordImg: '/static/school/main/facilities_word.png' },
  { name: 'canteen', label: '食堂', img: '/static/school/main/canteen.png', wordImg: '/static/school/main/canteen_word.png' },
  { name: 'others', label: '其他服务', img: '/static/school/main/others.png', wordImg: '/static/school/main/others_word.png' }
])

const navigating = ref(false)

// Helper: perform navigation in uni runtime or fallback to H5 hash
const doNavigate = (url) => {
  return new Promise((resolve) => {
    try {
      if (typeof uni !== 'undefined' && uni.navigateTo) {
        try {
          uni.navigateTo({
            url,
            success: (res) => resolve({ ok: true, res }),
            fail: (err) => resolve({ ok: false, err }),
            complete: () => {}
          })
          return
        } catch (e) {
          resolve({ ok: false, err: e })
          return
        }
      }
    } catch (e) {
      // ignore
    }

    // browser fallback
    try {
      const href = '/#' + url.replace('/pages', '/pages')
      window.location.href = href
      setTimeout(() => resolve({ ok: true }), 600)
    } catch (e) {
      resolve({ ok: false, err: e })
    }
  })
}

const navigateToSafe = async (url) => {
  try {
    const result = await doNavigate(url)
    // ignore known navigation-cancelled errors
    if (result && result.err && result.err.errMsg && typeof result.err.errMsg === 'string' && result.err.errMsg.includes('Navigation cancelled')) {
      // ignore
    }
  } catch (e) {
    // ignore
  } finally {
    navigating.value = false
  }
}

const onItemClick = async (item) => {
  if (navigating.value) return
  navigating.value = true

  if (item.name === 'map') { await navigateToSafe('/pages/school/map/map'); return }
  if (item.name === 'timetable') { await navigateToSafe('/pages/school/schedule/schedule'); return }
  if (item.name === 'fitness') { await navigateToSafe('/pages/school/fitness/fitness'); return }
  if (item.name === 'facilities') { await navigateToSafe('/pages/school/facilities/facilities'); return }
  if (item.name === 'canteen') { await navigateToSafe('/pages/school/canteen/canteen'); return }
  if (item.name === 'others') { await navigateToSafe('/pages/school/others/others'); return }
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