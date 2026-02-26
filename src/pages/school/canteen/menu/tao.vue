<template>
  <view class="page">
    <view class="content">
      <text class="page-title">今日菜单 - 桃园</text>
      
      <view class="category-section">
        <text class="category-title">自选菜</text>
        <view class="food-list">
          <view class="food-item" v-for="(food, index) in foods" :key="index">
            <text class="food-name">{{ food.name }}</text>
            <text class="food-price">{{ food.price }}元</text>
          </view>
        </view>
      </view>
      
      <view class="category-section">
        <text class="category-title">特色菜</text>
        <view class="food-list">
          <view class="food-item" v-for="(food, index) in specialFoods" :key="index">
            <text class="food-name">{{ food.name }}</text>
            <text class="food-price">{{ food.price }}元</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue'

const foods = reactive([
  { name: '桃园菜品1', price: 12, score: 4.5 },
  { name: '桃园菜品2', price: 15, score: 4.2 },
  { name: '桃园菜品3', price: 10, score: 4.0 },
  { name: '桃园菜品4', price: 13, score: 4.3 },
  { name: '桃园菜品5', price: 11, score: 4.1 }
])

const specialFoods = reactive([
  { name: '桃园特色菜1', price: 20, score: 4.8 },
  { name: '桃园特色菜2', price: 25, score: 4.7 },
  { name: '桃园特色菜3', price: 18, score: 4.6 }
])
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #fff;
  padding-top: 24rpx;
  font-family: "PingFang SC", "Helvetica Neue", "Microsoft Yahei", Arial, sans-serif;
}

.content {
  padding: 24rpx;
}

.page-title {
  display: block; 
  font-size:36rpx; 
  font-weight:700; 
  margin-bottom: 20rpx; 
  margin-left: 10rpx;
}

.category-section {
  margin-bottom: 40rpx;
}

.category-title {
  display: block; 
  font-size:30rpx; 
  font-weight:700; 
  margin-bottom: 20rpx; 
  margin-left: 10rpx;
}

.food-list {
  background: #BEEAFB;
  border-radius: 24rpx;
  padding: 20rpx;
}

.food-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid rgba(255,255,255,0.6);
  &:last-child {
    border-bottom: none;
  }
}

.food-name {
  font-size: 26rpx;
  font-weight: 700;
  flex: 1;
}

.food-price {
  font-size: 24rpx;
  color: #333;
  font-weight: 600;
}


</style>