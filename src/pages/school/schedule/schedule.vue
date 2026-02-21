<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack">‹</view>
      <text class="title">课表</text>
    </view>

    <view class="content">
      <view class="week-card" v-for="day in week" :key="day.title">
        <text class="day-title">{{ day.title }}</text>
        <view class="lessons">
          <view class="lesson" v-for="(l, idx) in day.lessons" :key="idx">
            <text class="lesson-name">{{ l.name }}</text>
            <text class="lesson-time">{{ l.time }}</text>
            <text class="lesson-room">{{ l.room }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue'

const week = reactive([
  { title: '星期一', lessons: [
    { name: '高数', time: '8:00-10:05', room: '45教A101' },
    { name: '英语', time: '10:20-12:00', room: '45教B203' }
  ]},
  { title: '星期二', lessons: [
    { name: '线性代数', time: '8:00-10:05', room: '45教A102' },
    { name: '体育', time: '10:20-12:00', room: '操场' }
  ]},
  { title: '星期三', lessons: [
    { name: '计算机导论', time: '8:00-10:05', room: '45教C301' }
  ]},
  { title: '星期四', lessons: [
    { name: '概率论', time: '8:00-10:05', room: '45教A101' }
  ]},
  { title: '星期五', lessons: [
    { name: '物理', time: '8:00-10:05', room: '45教D101' }
  ]},
  { title: '星期六', lessons: [
    { name: '自习', time: '9:00-11:00', room: '图书馆' }
  ]},
  { title: '星期日', lessons: [
    { name: '无', time: '-', room: '-' }
  ]}
])

const goBack = () => {
  try {
    // @ts-ignore
    if (typeof uni !== 'undefined' && uni.navigateBack) {
      // @ts-ignore
      uni.navigateBack({ delta: 1 })
      setTimeout(() => {
        // @ts-ignore
        if (typeof uni !== 'undefined' && uni.switchTab) {
          uni.switchTab({ url: '/pages/school/school' })
        }
      }, 300)
      return
    }
  } catch (e) {}
  if (window && window.history) window.history.back()
}
</script>

<style lang="scss" scoped>
.page { padding-bottom: 100rpx; background: #fff; min-height: 100vh; }
.header { display:flex; align-items:center; height:88rpx; padding:0 24rpx; }
.back { font-size:48rpx; line-height:88rpx; width:88rpx; color:#111 }
.title { font-size:36rpx; font-weight:700; margin-left:8rpx }
.content { padding: 24rpx }
.week-card { background:#BEEAFB; border-radius:30rpx; padding: 24rpx; margin-bottom: 28rpx }
.day-title { font-weight:800; font-size:30rpx; margin-bottom: 12rpx }
.lessons { }
.lesson { display:flex; justify-content:space-between; margin-bottom:10rpx }
.lesson-name { font-size:26rpx; font-weight:700 }
.lesson-time { font-size:24rpx; color:#222 }
.lesson-room { font-size:24rpx; color:#222 }
</style>
