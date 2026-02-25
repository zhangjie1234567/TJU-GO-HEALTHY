<template>
  <view class="page">
    <!-- 背景装饰 -->
    <view class="background-decor">
      <view class="floating-circle circle-1"></view>
      <view class="floating-circle circle-2"></view>
      <view class="floating-circle circle-3"></view>
      <view class="floating-circle circle-4"></view>
    </view>
    
    <view class="container">
      <text class="title">今天吃什么？</text>
      
      <!-- 食堂选择转盘 -->
      <view class="section">
        <text class="section-title">选择食堂</text>
        <view class="turntable-wrapper">
          <view class="turntable-container">
            <view class="turntable" :style="{ transform: `rotate(${canteenRotate}deg)` }">
              <view class="turntable-sector" v-for="(canteen, index) in canteens" :key="index" :style="{ transform: `rotate(${360 / canteens.length * index}deg)` }"></view>
              <view class="turntable-texts">
                <text class="turntable-text" v-for="(canteen, index) in canteens" :key="index" :style="{ transform: `rotate(${360 / canteens.length * index}deg) translate(0, -120rpx) rotate(-${360 / canteens.length * index}deg)` }">{{ canteen }}</text>
              </view>
              <view class="turntable-center">
                <view class="center-dot"></view>
              </view>
            </view>
            <view class="pointer"></view>
          </view>
          <button class="spin-btn" @click="spinCanteen" :disabled="isSpinning">
            {{ isSpinning ? '转盘ing...' : '开始转盘' }}
          </button>
        </view>
        <view class="result" v-if="selectedCanteen">
          <text class="result-text">选中：{{ selectedCanteen }}</text>
        </view>
      </view>
      
      <!-- 菜品选择转盘 -->
      <view class="section" v-if="selectedCanteen">
        <text class="section-title">{{ selectedCanteen }}菜品</text>
        <view class="turntable-wrapper">
          <view class="turntable-container">
            <view class="turntable" :style="{ transform: `rotate(${foodRotate}deg)` }">
              <view class="turntable-sector" v-for="(food, index) in foods" :key="index" :style="{ transform: `rotate(${360 / foods.length * index}deg)` }"></view>
              <view class="turntable-texts">
                <text class="turntable-text" v-for="(food, index) in foods" :key="index" :style="{ transform: `rotate(${360 / foods.length * index}deg) translate(0, -120rpx) rotate(-${360 / foods.length * index}deg)` }">{{ food }}</text>
              </view>
              <view class="turntable-center">
                <view class="center-dot"></view>
              </view>
            </view>
            <view class="pointer"></view>
          </view>
          <button class="spin-btn" @click="spinFood" :disabled="isSpinning">
            {{ isSpinning ? '转盘ing...' : '开始转盘' }}
          </button>
        </view>
        <view class="result" v-if="selectedFood">
          <text class="result-text">选中：{{ selectedFood }}</text>
        </view>
      </view>
      
      <!-- 最终结果 -->
      <view class="final-result" v-if="selectedCanteen && selectedFood">
        <text class="final-title">今日推荐</text>
        <text class="final-content">{{ selectedCanteen }} - {{ selectedFood }}</text>
        <button class="reset-btn" @click="reset">重新选择</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

const canteens = ['留园', '梅园', '竹园', '兰园', '菊园', '桃园']
const canteenFoods = {
  '留园': ['留园菜品1', '留园菜品2', '留园菜品3', '留园菜品4', '留园菜品5', '留园菜品6'],
  '梅园': ['梅园菜品1', '梅园菜品2', '梅园菜品3', '梅园菜品4', '梅园菜品5', '梅园菜品6'],
  '竹园': ['竹园菜品1', '竹园菜品2', '竹园菜品3', '竹园菜品4', '竹园菜品5', '竹园菜品6'],
  '兰园': ['兰园菜品1', '兰园菜品2', '兰园菜品3', '兰园菜品4', '兰园菜品5', '兰园菜品6'],
  '菊园': ['菊园菜品1', '菊园菜品2', '菊园菜品3', '菊园菜品4', '菊园菜品5', '菊园菜品6'],
  '桃园': ['桃园菜品1', '桃园菜品2', '桃园菜品3', '桃园菜品4', '桃园菜品5', '桃园菜品6']
}

const canteenRotate = ref(0)
const foodRotate = ref(0)
const selectedCanteen = ref('')
const selectedFood = ref('')
const isSpinning = ref(false)

const foods = computed(() => {
  return selectedCanteen.value ? canteenFoods[selectedCanteen.value] : []
})

const spinCanteen = () => {
  if (isSpinning.value) return
  
  isSpinning.value = true
  const randomDeg = 360 * 5 + Math.floor(Math.random() * 360)
  canteenRotate.value = randomDeg
  
  setTimeout(() => {
    const index = Math.floor((360 - (randomDeg % 360)) / (360 / canteens.length)) % canteens.length
    selectedCanteen.value = canteens[index]
    selectedFood.value = ''
    foodRotate.value = 0
    isSpinning.value = false
  }, 2000)
}

const spinFood = () => {
  if (isSpinning.value || !selectedCanteen.value) return
  
  isSpinning.value = true
  const randomDeg = 360 * 5 + Math.floor(Math.random() * 360)
  foodRotate.value = randomDeg
  
  setTimeout(() => {
    const index = Math.floor((360 - (randomDeg % 360)) / (360 / foods.value.length)) % foods.value.length
    selectedFood.value = foods.value[index]
    isSpinning.value = false
  }, 2000)
}

const reset = () => {
  selectedCanteen.value = ''
  selectedFood.value = ''
  canteenRotate.value = 0
  foodRotate.value = 0
}
</script>

<style lang="scss" scoped>
.page { 
  min-height: 100vh; 
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); 
  padding-top: 24rpx; 
  font-family: "PingFang SC", "Microsoft Yahei", Arial, sans-serif; 
  position: relative;
  overflow: hidden;
}

/* 背景装饰 */
.background-decor {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.floating-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(78, 205, 196, 0.1);
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 200rpx;
  height: 200rpx;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.circle-2 {
  width: 150rpx;
  height: 150rpx;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.circle-3 {
  width: 100rpx;
  height: 100rpx;
  top: 30%;
  right: 20%;
  animation-delay: 1s;
}

.circle-4 {
  width: 120rpx;
  height: 120rpx;
  bottom: 20%;
  left: 15%;
  animation-delay: 3s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20rpx) scale(1.1);
  }
}

.container { 
  padding: 24rpx;
  position: relative;
  z-index: 1;
}

.title { 
  display: block; 
  font-size: 42rpx; 
  font-weight: 700; 
  text-align: center; 
  margin-bottom: 40rpx; 
  color: #333;
  text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
}

.section { 
  margin-bottom: 50rpx;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-title { 
  display: block; 
  font-size: 32rpx; 
  font-weight: 600; 
  margin-bottom: 25rpx; 
  text-align: center;
  color: #555;
}

.turntable-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25rpx;
}

.turntable-container { 
  position: relative; 
  width: 320rpx; 
  height: 320rpx; 
  margin: 0 auto;
}

.turntable { 
  position: relative; 
  width: 100%; 
  height: 100%; 
  border-radius: 50%; 
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 50%, #fad0c4 50%, #a8edea 100%); 
  overflow: hidden; 
  transition: transform 2s cubic-bezier(0.25, 0.1, 0.25, 1);
  box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.15);
}

.turntable-sector {
  position: absolute;
  top: 0;
  left: 50%;
  width: 1px;
  height: 100%;
  transform-origin: bottom center;
  background: rgba(255, 255, 255, 0.3);
}

.turntable-texts {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.turntable-text { 
  font-size: 24rpx; 
  font-weight: 600; 
  color: #333; 
  transform-origin: center;
  position: absolute;
  text-align: center;
  width: 80rpx;
  left: 50%;
  top: 50%;
}

.turntable-center { 
  position: absolute; 
  top: 50%; 
  left: 50%; 
  transform: translate(-50%, -50%); 
  width: 80rpx; 
  height: 80rpx; 
  border-radius: 50%; 
  background: #fff; 
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.center-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: #4ecdc4;
}

.pointer { 
  position: absolute; 
  top: -20rpx; 
  left: 50%; 
  transform: translateX(-50%); 
  width: 0; 
  height: 0; 
  border-left: 25rpx solid transparent; 
  border-right: 25rpx solid transparent; 
  border-bottom: 40rpx solid #ff6b6b; 
  z-index: 10;
  filter: drop-shadow(0 2rpx 4rpx rgba(0,0,0,0.2));
}

.spin-btn { 
  width: 220rpx; 
  height: 70rpx; 
  background: linear-gradient(135deg, #4ecdc4 0%, #45b7aa 100%); 
  color: #fff; 
  border: none; 
  border-radius: 35rpx; 
  font-size: 26rpx; 
  font-weight: 600;
  box-shadow: 0 4rpx 12rpx rgba(78, 205, 196, 0.4);
  transition: all 0.3s ease;
}

.spin-btn:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 16rpx rgba(78, 205, 196, 0.6);
}

.spin-btn:disabled {
  background: #ccc;
  box-shadow: none;
  transform: none;
}

.result { 
  text-align: center; 
  margin-top: 15rpx;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.result-text { 
  font-size: 26rpx; 
  color: #333;
  font-weight: 500;
}

.final-result { 
  margin-top: 50rpx; 
  padding: 35rpx; 
  background: rgba(255, 255, 255, 0.9); 
  border-radius: 25rpx; 
  text-align: center;
  box-shadow: 0 8rpx 25rpx rgba(0,0,0,0.1);
  animation: popIn 0.5s ease-out;
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.final-title { 
  display: block; 
  font-size: 32rpx; 
  font-weight: 700; 
  margin-bottom: 15rpx;
  color: #333;
}

.final-content { 
  display: block; 
  font-size: 36rpx; 
  font-weight: 600; 
  color: #4ecdc4; 
  margin-bottom: 25rpx;
}

.reset-btn { 
  width: 220rpx; 
  height: 70rpx; 
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); 
  color: #fff; 
  border: none; 
  border-radius: 35rpx; 
  font-size: 26rpx; 
  font-weight: 600;
  box-shadow: 0 4rpx 12rpx rgba(255, 107, 107, 0.4);
  transition: all 0.3s ease;
}

.reset-btn:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 16rpx rgba(255, 107, 107, 0.6);
}
</style>