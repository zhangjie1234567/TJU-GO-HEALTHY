<template>
  <view class="page">
    <view class="content">
      <text class="page-title">今日菜单 - 梅园</text>
      
      <view class="category-section">
        <text class="category-title">自选菜</text>
        <view class="food-list">
          <view class="food-item" v-for="(food, index) in foods" :key="index">
            <text class="food-name">{{ food.name }}</text>
            <text class="food-price">{{ food.price }}元</text>
            <text class="food-score">{{ food.score }}分</text>
          </view>
        </view>
      </view>
      
      <view class="category-section">
        <text class="category-title">特色菜</text>
        <view class="food-list">
          <view class="food-item" v-for="(food, index) in specialFoods" :key="index">
            <text class="food-name">{{ food.name }}</text>
            <text class="food-price">{{ food.price }}元</text>
            <text class="food-score">{{ food.score }}分</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue'

const foods = reactive([
  { name: '梅园菜品1', price: 3, score: 7.5 },
  { name: '梅园菜品2', price: 6, score: 8.5 },
  { name: '梅园菜品3', price: 5, score: 8.0 },
  { name: '梅园菜品4', price: 4, score: 7.8 },
  { name: '梅园菜品5', price: 7, score: 8.2 }
])

const specialFoods = reactive([
  { name: '梅园特色菜1', price: 12, score: 9.0 },
  { name: '梅园特色菜2', price: 14, score: 8.8 },
  { name: '梅园特色菜3', price: 10, score: 8.5 }
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
  font-size: 36rpx;
  font-weight: 800;
  margin-bottom: 32rpx;
  text-align: center;
}

.category-section {
  margin-bottom: 40rpx;
}

.category-title {
  font-size: 30rpx;
  font-weight: 700;
  margin-bottom: 16rpx;
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
  margin: 0 20rpx;
}

.food-score {
  font-size: 24rpx;
  color: #FF9800;
  font-weight: 700;
}
</style>