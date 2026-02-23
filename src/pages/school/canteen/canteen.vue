<template>
  <view class="page">
    <view class="content">
      <view class="btn-primary">今天吃什么?</view>

      <text class="section">食堂实时人流</text>
      <view class="info-card">
        <view class="row" v-for="(c, i) in canteens" :key="i">
          <text class="cname">{{ c.name }}</text>
          <view class="bar" />
        </view>
      </view>

      <text class="section">干饭日记</text>
      <view class="card">干饭日记</view>

      <text class="section">今日菜单</text>
      <view class="menu-card">
        <view class="menu-item" v-for="(m,idx) in menu" :key="idx">{{ m }}</view>
      </view>

    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue'

const canteens = reactive([
  { name: '留园' },
  { name: '梅园' },
  { name: '竹园' },
  { name: '兰园' },
  { name: '菊园' },
  { name: '荣园' }
])

const menu = reactive(['留园菜品', '梅园菜品', '竹园菜品', '兰园菜品', '菊园菜品', '荣园菜品'])


</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#fff; padding-top:24rpx; font-family: "PingFang SC", "Microsoft Yahei", Arial, sans-serif }

.content { padding:24rpx }
.btn-primary { display:block; background:#DFF4FF; text-align:center; padding:18rpx 0; border-radius:36rpx; font-size:28rpx; margin-bottom:18rpx }
.section { font-size:28rpx; font-weight:700; margin:12rpx 0 }
.info-card { background:#BEEAFB; border-radius:30rpx; padding:18rpx; margin-bottom:18rpx }
.row { display:flex; align-items:center; justify-content:space-between; margin-bottom:10rpx }
.cname { font-weight:700 }
.bar { flex:1; height:12rpx; background:rgba(0,0,0,0.12); margin-left:16rpx; border-radius:8rpx }
.card { background:#DFF4FF; border-radius:30rpx; padding:20rpx; text-align:center; margin-bottom:18rpx }
.menu-card { background:#BEEAFB; border-radius:18rpx; padding:16rpx; display:flex; flex-wrap:wrap; gap:12rpx }
.menu-item { background:#E8FFF9; padding:12rpx 18rpx; border-radius:20rpx }
</style>
