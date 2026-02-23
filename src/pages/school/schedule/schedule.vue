<template>
  <view class="page">
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
    { name: '英语', time: '10:20-12:00', room: '45教B203' },
    { name: '线性代数', time: '13:30-15:10', room: '45教A102' },
    { name: '体育', time: '15:30-17:00', room: '操场' },
    { name: '计算机导论', time: '19:00-20:30', room: '45教C301' }
  ]},
  { title: '星期二', lessons: [
    { name: '线性代数', time: '8:00-10:05', room: '45教A102' },
    { name: '体育', time: '10:20-12:00', room: '操场' },
    { name: '计算机导论', time: '13:30-15:10', room: '45教C301' }
  ]},
  { title: '星期三', lessons: [
    { name: '计算机导论', time: '8:00-10:05', room: '45教C301' },
    { name: '线性代数', time: '13:30-15:10', room: '45教A102' },
    { name: '体育', time: '15:30-17:00', room: '操场' }
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


</script>

<style lang="scss" scoped>
.page { padding-bottom: 100rpx; background: #fff; min-height: 100vh; }

.content { padding: 24rpx; }

/* 确保没有额外的间距或内容 */
.week-card { background:#BEEAFB; border-radius:30rpx; padding: 24rpx; margin-bottom: 28rpx }
.day-title { 
  display: block;        /* 关键点1：改为块级元素，使 margin 生效 */
  font-weight: 800; 
  font-size: 32rpx; 
  margin-bottom: 20rpx;  /* 关键点2：统一间距 */
  color: #000;
}
.lessons { }
.lesson { display: grid; grid-template-columns: 1fr auto 1fr; gap: 20rpx; margin-bottom: 16rpx; align-items: center }
.lesson-name { font-size:26rpx; font-weight:700; text-align: left }
.lesson-time { font-size:24rpx; color:#222; text-align: center }
.lesson-room { font-size:24rpx; color:#222; text-align: right }
</style>
