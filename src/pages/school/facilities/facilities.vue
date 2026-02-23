<template>
  <view class="page">
    <view class="content">
      <view class="card water-card">
        <text class="card-title">我的水卡</text>
        <view class="water-row">
          <text>消费记录</text>
          <text>5600 ml</text>
        </view>
        <view class="water-row">
          <text>我的余额</text>
          <text>56 元</text>
        </view>
      </view>

      <text class="section-title">位置</text>

      <view class="location-card" v-for="(loc, idx) in locations" :key="idx">
        <image class="loc-thumb" src="/static/school/main/facilities.png" mode="aspectFill" />
        <view class="loc-info">
          <text class="loc-name">{{ loc.title }}</text>
          <text class="loc-pos">xxx位置</text>
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


</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #fff; padding-top: 24rpx; font-family: "PingFang SC", "Microsoft Yahei", Arial, sans-serif }

.content { padding:24rpx }
.card { background:#BEEAFB; border-radius:30rpx; padding:20rpx; margin-bottom:20rpx }
.water-row { display:flex; justify-content:space-between; margin-top:12rpx; font-weight:700 }
.section-title { font-size:30rpx; font-weight:700; margin:12rpx 0 }
.location-card { display:flex; align-items:center; background:#fff; border-radius:18rpx; padding:12rpx; box-shadow:0 8rpx 20rpx rgba(0,0,0,0.08); margin-bottom:16rpx }
.loc-thumb { width:180rpx; height:120rpx; border-radius:12rpx; margin-right:18rpx }
.loc-name { font-size:28rpx; font-weight:700 }
.loc-pos { color:#666; margin-top:6rpx }
</style>
