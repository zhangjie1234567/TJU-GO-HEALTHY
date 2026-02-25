<template>
  <view class="page">
    <view class="container">
      <text class="title">桃园菜单</text>
      
      <!-- 自选菜 -->
      <view class="section">
        <text class="section-title">自选菜</text>
        <view class="food-list">
          <view class="food-item" v-for="(food, index) in selfService" :key="index">
            <text class="food-name">{{ food.name }}</text>
            <view class="food-info">
              <text class="food-price">{{ food.price }}</text>
              <text class="food-score">{{ food.score }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 特色菜 -->
      <view class="section">
        <text class="section-title">特色菜</text>
        <view class="food-list">
          <view class="food-item" v-for="(food, index) in specialties" :key="index">
            <text class="food-name">{{ food.name }}</text>
            <view class="food-info">
              <text class="food-price">{{ food.price }}</text>
              <text class="food-score">{{ food.score }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'

const selfService = reactive([
  { name: '桃园菜品1', price: '12元', score: '4.5' },
  { name: '桃园菜品2', price: '15元', score: '4.2' },
  { name: '桃园菜品3', price: '10元', score: '4.0' },
  { name: '桃园菜品4', price: '13元', score: '4.3' },
  { name: '桃园菜品5', price: '11元', score: '4.1' },
  { name: '桃园菜品6', price: '14元', score: '4.4' }
])

const specialties = reactive([
  { name: '桃园特色菜1', price: '20元', score: '4.8' },
  { name: '桃园特色菜2', price: '25元', score: '4.7' },
  { name: '桃园特色菜3', price: '18元', score: '4.6' }
])
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#fff; padding-top:24rpx; font-family: "PingFang SC", "Microsoft Yahei", Arial, sans-serif }

.container { padding:24rpx }

.title { display: block; font-size:36rpx; font-weight:700; text-align:center; margin-bottom:30rpx }

.section { margin-bottom:40rpx }

.section-title { display: block; font-size:28rpx; font-weight:600; margin-bottom:20rpx; padding-left:10rpx; border-left:6rpx solid #4ecdc4 }

.food-list { background:#f8f9fa; border-radius:20rpx; padding:20rpx }

.food-item { display:flex; justify-content:space-between; align-items:center; padding:15rpx; background:#fff; border-radius:15rpx; margin-bottom:15rpx }

.food-name { font-size:24rpx; font-weight:500 }

.food-info { display:flex; align-items:center; gap:20rpx }

.food-price { font-size:22rpx; color:#ff6b6b; font-weight:600 }

.food-score { font-size:22rpx; color:#4ecdc4; font-weight:600 }
</style>