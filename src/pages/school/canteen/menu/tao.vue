<template>
  <view class="page">
    <view class="content">
      <text class="page-title">今日菜单 - 桃园</text>
      
      <view class="category-section">
        <text class="category-title">自选菜</text>
        <view class="food-list">
          <view class="food-item" v-for="(food, index) in foods" :key="index">
            <text class="food-name">{{ food.dishName }}</text> 
            <text class="food-price">{{ food.price }}元</text>
          </view>
        </view>
      </view>
      
        <view class="category-section">
    <text class="category-title">特色菜</text>
    <view class="food-list">
      <!-- 这里循环的是 specialFoods -->
      <view class="food-item" v-for="(food, index) in specialFoods" :key="index">
        <text class="food-name">{{ food.dishName }}</text> 
        <text class="food-price">{{ food.price }}元</text>
      </view>
    </view>
</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const foods = ref([])
const specialFoods = ref([])
const apiUrl = 'http://localhost:8080'
const fetchRealData = async () => {
  const today = new Date().toISOString().slice(0, 10)
  const url = `${apiUrl}/canteens/menus?canteenName=${encodeURIComponent('桃园')}&date=${today}`
  try {
    uni.request({ url, method: 'GET', success: (res) => {
      if (res.data && res.data.code === 1) {
        const allData = res.data.data
        foods.value = allData.filter(item => item.price <= 8)
        specialFoods.value = allData.filter(item => item.price > 8)
      }
    }, fail: (err) => { console.error('请求失败', err) }})
  } catch (e) { console.error('出错了', e) }
}
onMounted(() => { fetchRealData() })
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