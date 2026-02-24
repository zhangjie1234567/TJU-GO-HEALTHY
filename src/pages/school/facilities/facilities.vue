<template>
  <view class="page">
    <view class="content">
      <view class="card water-card">
        <text class="card-title">我的水卡</text>
        <view class="water-row">
          <text>我的余额</text>
          <text>56 元</text>
        </view>
      </view>
      
      <view class="card record-card" @click="goToRecords">
        <text class="card-title">消费记录</text>
        <text class="record-desc">查看详细消费和充值记录</text>
      </view>

      <text class="section-title">位置</text>

      <view class="location-card" v-for="(loc, idx) in locations" :key="idx" @click="goToDetail(loc.title)">
        <image class="loc-thumb" src="/static/school/main/facilities.png" mode="aspectFill" />
        <view class="loc-info">
          <text class="loc-name">{{ loc.title }}</text>
        </view>
      </view>

    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue'

const locations = reactive([
  { title: '校内饮水机' },
  { title: '校内打印机' },
  { title: '校内打印店' },
  { title: '校内超市' }
])

const goToDetail = (title) => {
  try {
    // @ts-ignore
    if (typeof uni !== 'undefined' && uni.navigateTo) {
      let url = ''
      switch (title) {
        case '校内饮水机':
          url = '/pages/school/facilities/water'
          break
        case '校内打印机':
          url = '/pages/school/facilities/printer'
          break
        case '校内打印店':
          url = '/pages/school/facilities/print_shop'
          break
        case '校内超市':
          url = '/pages/school/facilities/shop'
          break
      }
      if (url) {
        uni.navigateTo({ url })
      }
      return
    }
  } catch (e) {}
  // 浏览器环境 fallback
  let href = ''
  switch (title) {
    case '校内饮水机':
      href = '/#/pages/school/facilities/water'
      break
    case '校内打印机':
      href = '/#/pages/school/facilities/printer'
      break
    case '校内打印店':
      href = '/#/pages/school/facilities/print_shop'
      break
    case '校内超市':
      href = '/#/pages/school/facilities/shop'
      break
  }
  if (href) {
    window.location.href = href
  }
}

const goToRecords = () => {
  try {
    // @ts-ignore
    if (typeof uni !== 'undefined' && uni.navigateTo) {
      uni.navigateTo({ url: '/pages/school/facilities/records' })
      return
    }
  } catch (e) {}
  // 浏览器环境 fallback
  const href = '/#/pages/school/facilities/records'
  window.location.href = href
}
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #fff; padding-top: 24rpx; font-family: "PingFang SC", "Microsoft Yahei", Arial, sans-serif }

.content { padding:24rpx }
.card-title { display: block; font-size:34rpx; font-weight:700; margin-bottom: 20rpx; text-align: center; }
.card { background:#BEEAFB; border-radius:30rpx; padding:20rpx; margin-bottom:20rpx }
.record-card { background:#DFF4FF; border-radius:30rpx; padding:20rpx; margin-bottom:20rpx; cursor: pointer }
.record-desc { font-size:24rpx; color:#666; margin-top:8rpx; text-align: center }
.water-row { display:flex; justify-content:space-between; margin-top:12rpx; font-weight:700 }
.section-title { display: block; font-size:34rpx; font-weight:700; margin-bottom: 20rpx; margin-left: 10rpx; }
.location-card { display:flex; align-items:center; justify-content: space-between; background:#fff; border-radius:18rpx; padding:12rpx; box-shadow:0 8rpx 20rpx rgba(0,0,0,0.08); margin-bottom:16rpx }
.loc-thumb { width:180rpx; height:120rpx; border-radius:12rpx; margin-right:18rpx }
.loc-info { flex: 1; }
.loc-name { font-size:28rpx; font-weight:700 }
</style>
