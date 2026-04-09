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
        <view class="turntable-wrapper" v-if="canteens.length > 0">
          <view class="turntable-container">
            <view class="turntable" :style="{ transform: `rotate(${canteenRotate}deg)` }">
              <view class="turntable-sector" v-for="(canteen, index) in canteens" :key="index" :style="{ transform: `rotate(${360 / canteens.length * index}deg)` }"></view>
              <view class="turntable-texts">
                <!-- 核心修改：在文字旋转中减去整体旋转角度 canteenRotate -->
                <text class="turntable-text" 
                  v-for="(canteen, index) in canteens" 
                  :key="index" 
                  :style="{ transform: `rotate(${360 / canteens.length * index}deg) translate(0, -120rpx) rotate(${- (360 / canteens.length * index + canteenRotate)}deg)` }"
                >
                  {{ canteen }}
                </text>
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
        <view class="result" v-else>
          <text class="result-text">暂无可用食堂数据</text>
        </view>
        <view class="result" v-if="selectedCanteen">
          <text class="result-text">选中：{{ selectedCanteen }}</text>
        </view>
      </view>
      
      <!-- 菜品选择转盘 -->
      <view class="section" v-if="selectedCanteen">
        <text class="section-title">{{ selectedCanteen }}菜品</text>
        <view class="flavor-row">
          <text class="flavor-label">口味偏好</text>
          <picker mode="selector" :range="flavorOptions" :value="flavorOptions.indexOf(selectedFlavor)" @change="onFlavorChange">
            <view class="flavor-picker">{{ selectedFlavor }}</view>
          </picker>
        </view>
        <view class="turntable-wrapper" v-if="foods.length > 0">
          <view class="turntable-container">
            <view class="turntable" :style="{ transform: `rotate(${foodRotate}deg)` }">
              <view class="turntable-sector" v-for="(food, index) in foods" :key="index" :style="{ transform: `rotate(${360 / foods.length * index}deg)` }"></view>
              <view class="turntable-texts">
                <!-- 核心修改：在文字旋转中减去整体旋转角度 foodRotate -->
                <text class="turntable-text" 
                  v-for="(food, index) in foods" 
                  :key="index" 
                  :style="{ transform: `rotate(${360 / foods.length * index}deg) translate(0, -120rpx) rotate(${- (360 / foods.length * index + foodRotate)}deg)` }"
                >
                  {{ food }}
                </text>
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
        <view class="result" v-else>
          <text class="result-text">该食堂暂无符合口味的菜品</text>
        </view>
        <view class="result" v-if="selectedFoods.length > 0">
          <text class="result-text">推荐：{{ selectedFoods.join('、') }}</text>
        </view>
      </view>
      
      <!-- 最终结果 -->
      <view class="final-result" v-if="selectedCanteen && selectedFoods.length > 0">
        <text class="final-title">今日推荐</text>
        <text class="final-content">{{ selectedCanteen }}</text>
        <view class="final-food-list">
          <text class="final-food" v-for="(food, idx) in selectedFoods" :key="idx">{{ idx + 1 }}. {{ food }}</text>
        </view>
        <button class="reset-btn" @click="reset">重新选择</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const apiUrl = 'http://localhost:8080'
const baseCanteens = ['留园', '梅园', '竹园', '兰园', '菊园', '桃园', '棠园']
const canteens = ref([])
const canteenFoods = ref({})
const canteenMenuItems = ref({})
const selectedFlavor = ref('不限')
const selectedFoods = ref([])
const wheelFoods = ref([])

const canteenRotate = ref(0)
const foodRotate = ref(0)
const selectedCanteen = ref('')
const isSpinning = ref(false)

const allFoods = computed(() => {
  return selectedCanteen.value ? (canteenFoods.value[selectedCanteen.value] || []) : []
})

const flavorOptions = computed(() => {
  if (!selectedCanteen.value) return ['不限']
  const list = canteenMenuItems.value[selectedCanteen.value] || []
  const set = new Set(['不限'])
  list.forEach((item) => {
    const flavor = String(item?.flavor || '').trim()
    if (flavor) set.add(flavor)
  })
  return [...set].slice(0, 10)
})

const filteredFoods = computed(() => {
  if (!selectedCanteen.value) return []
  const all = allFoods.value
  if (!all.length) return []
  if (selectedFlavor.value === '不限') return all

  const list = canteenMenuItems.value[selectedCanteen.value] || []
  const matchedNames = new Set(
    list
      .filter(item => String(item?.flavor || '').trim() === selectedFlavor.value)
      .map(item => String(item?.dishName || '').trim())
      .filter(Boolean)
  )

  const matched = all.filter(name => matchedNames.has(name))
  return matched.length ? matched : all
})

const foods = computed(() => {
  return wheelFoods.value
})

const sampleList = (list, size) => {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, Math.max(0, size))
}

const refreshWheelFoods = () => {
  const source = filteredFoods.value
  wheelFoods.value = source.length <= 6 ? [...source] : sampleList(source, 6)
}

const formatDate = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const requestMenus = () => {
  const today = formatDate(new Date())
  const url = `${apiUrl}/canteens/menus?date=${today}`

  return new Promise((resolve) => {
    try {
      if (typeof uni !== 'undefined' && uni.request) {
        uni.request({
          url,
          method: 'GET',
          success: (res) => resolve(res?.data?.data || []),
          fail: () => resolve([])
        })
        return
      }
    } catch (e) {}

    fetch(url)
      .then(res => res.json())
      .then(data => resolve(data?.data || []))
      .catch(() => resolve([]))
  })
}

const loadMenuData = async () => {
  const list = await requestMenus()
  const grouped = {}
  const groupedMenuItems = {}
  for (const item of list) {
    const canteenName = String(item?.canteenName || '').trim()
    const dishName = String(item?.dishName || '').trim()
    if (!canteenName || !dishName) continue
    if (!grouped[canteenName]) {
      grouped[canteenName] = []
    }
    if (!groupedMenuItems[canteenName]) {
      groupedMenuItems[canteenName] = []
    }
    if (!grouped[canteenName].includes(dishName)) {
      grouped[canteenName].push(dishName)
    }
    groupedMenuItems[canteenName].push({
      dishName,
      flavor: String(item?.flavor || '').trim()
    })
  }

  canteenFoods.value = grouped
  canteenMenuItems.value = groupedMenuItems
  const extraCanteens = Object.keys(grouped).filter(name => !baseCanteens.includes(name))
  canteens.value = [...baseCanteens, ...extraCanteens]

  if (selectedCanteen.value && !grouped[selectedCanteen.value]) {
    selectedCanteen.value = ''
    selectedFoods.value = []
    selectedFlavor.value = '不限'
    foodRotate.value = 0
    wheelFoods.value = []
  } else {
    refreshWheelFoods()
  }
}

const spinCanteen = () => {
  if (isSpinning.value || canteens.value.length === 0) return
  isSpinning.value = true
  const currentBase = Math.ceil(canteenRotate.value / 360) * 360
  const randomDeg = currentBase + 360 * 5 + Math.floor(Math.random() * 360)
  canteenRotate.value = randomDeg
  
  setTimeout(() => {
    const index = Math.floor((360 - (randomDeg % 360)) / (360 / canteens.value.length)) % canteens.value.length
    selectedCanteen.value = canteens.value[index]
    selectedFoods.value = []
    selectedFlavor.value = '不限'
    foodRotate.value = 0
    refreshWheelFoods()
    isSpinning.value = false
  }, 2000)
}

const spinFood = () => {
  if (isSpinning.value || !selectedCanteen.value || filteredFoods.value.length === 0) return
  isSpinning.value = true
  const currentBase = Math.ceil(foodRotate.value / 360) * 360
  const randomDeg = currentBase + 360 * 5 + Math.floor(Math.random() * 360)
  foodRotate.value = randomDeg
  
  setTimeout(() => {
    const source = filteredFoods.value
    const picked = sampleList(source, Math.min(3, source.length))
    selectedFoods.value = picked
    refreshWheelFoods()
    isSpinning.value = false
  }, 2000)
}

const onFlavorChange = (e) => {
  selectedFlavor.value = flavorOptions.value[Number(e?.detail?.value || 0)] || '不限'
  selectedFoods.value = []
  foodRotate.value = 0
  refreshWheelFoods()
}

const reset = () => {
  selectedCanteen.value = ''
  selectedFoods.value = []
  selectedFlavor.value = '不限'
  canteenRotate.value = 0
  foodRotate.value = 0
  wheelFoods.value = []
}

onMounted(loadMenuData)
</script>

<style lang="scss" scoped>
/* 样式保持不变，文字渲染逻辑主要在 template 中通过 transform 处理 */
.page { 
  min-height: 100vh; 
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); 
  padding-top: 24rpx; 
  font-family: "PingFang SC", "Microsoft Yahei", Arial, sans-serif; 
  position: relative;
  overflow: hidden;
}

.background-decor {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 0;
}

.floating-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(78, 205, 196, 0.1);
  animation: float 6s ease-in-out infinite;
}

.circle-1 { width: 200rpx; height: 200rpx; top: 10%; left: 10%; }
.circle-2 { width: 150rpx; height: 150rpx; top: 60%; right: 15%; animation-delay: 2s; }
.circle-3 { width: 100rpx; height: 100rpx; top: 30%; right: 20%; animation-delay: 1s; }
.circle-4 { width: 120rpx; height: 120rpx; bottom: 20%; left: 15%; animation-delay: 3s; }

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20rpx) scale(1.1); }
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
}

.section { margin-bottom: 50rpx; }

.section-title { 
  display: block; 
  font-size: 32rpx; 
  font-weight: 600; 
  margin-bottom: 25rpx; 
  text-align: center;
  color: #555;
}

.flavor-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  margin-bottom: 16rpx;
}

.flavor-label {
  font-size: 24rpx;
  color: #637d92;
}

.flavor-picker {
  min-width: 180rpx;
  text-align: center;
  font-size: 24rpx;
  color: #2a4b6b;
  background: #fff;
  border: 1rpx solid rgba(79, 161, 242, 0.35);
  border-radius: 999rpx;
  padding: 8rpx 18rpx;
}

.turntable-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25rpx;
}

.turntable-container { 
  position: relative; 
  width: 400rpx; 
  height: 400rpx; 
}

.turntable { 
  position: relative; 
  width: 100%; 
  height: 100%; 
  border-radius: 50%; 
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 50%, #fad0c4 50%, #a8edea 100%); 
  overflow: hidden; 
  transition: transform 2s cubic-bezier(0.2, 0, 0.2, 1);
  box-shadow: 0 8rpx 20rpx rgba(0,0,0,0.15);
}

.turntable-sector {
  position: absolute;
  top: 0; left: 50%;
  width: 1px; height: 100%;
  transform-origin: bottom center;
  background: rgba(255, 255, 255, 0.3);
}

.turntable-texts {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
}

.turntable-text { 
  font-size: 21rpx; 
  font-weight: 600; 
  color: #333; 
  position: absolute;
  text-align: center;
  width: 108rpx;
  left: calc(50% - 54rpx);
  top: 50%;
  /* 为了抵消转盘整体的旋转，文字的 transform 必须实时跟随 template 里的计算 */
}

.turntable-center { 
  position: absolute; 
  top: 50%; left: 50%; 
  transform: translate(-50%, -50%); 
  width: 80rpx; height: 80rpx; 
  border-radius: 50%; background: #fff; 
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.2);
  display: flex; align-items: center; justify-content: center;
  z-index: 1;
}

.center-dot { width: 20rpx; height: 20rpx; border-radius: 50%; background: #4ecdc4; }

.pointer { 
  position: absolute; top: -20rpx; left: 50%; 
  transform: translateX(-50%); 
  width: 0; height: 0; 
  border-left: 25rpx solid transparent; 
  border-right: 25rpx solid transparent; 
  border-bottom: 40rpx solid #ff6b6b; 
  z-index: 10;
}

.spin-btn { 
  width: 220rpx; height: 70rpx; 
  background: linear-gradient(135deg, #4ecdc4 0%, #45b7aa 100%); 
  color: #fff; border: none; border-radius: 35rpx; 
  font-size: 26rpx; font-weight: 600;
  box-shadow: 0 4rpx 12rpx rgba(78, 205, 196, 0.4);
}

.spin-btn:disabled { background: #ccc; box-shadow: none; }

.result { text-align: center; margin-top: 15rpx; }
.result-text { font-size: 26rpx; color: #333; font-weight: 500; }

.final-result { 
  margin-top: 50rpx; padding: 35rpx; 
  background: rgba(255, 255, 255, 0.9); border-radius: 25rpx; 
  text-align: center; box-shadow: 0 8rpx 25rpx rgba(0,0,0,0.1);
}

.final-title { display: block; font-size: 32rpx; font-weight: 700; margin-bottom: 15rpx; }
.final-content { display: block; font-size: 34rpx; font-weight: 600; color: #4ecdc4; margin-bottom: 18rpx; }

.final-food-list {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 24rpx;
}

.final-food {
  font-size: 26rpx;
  color: #2f3f4a;
  font-weight: 600;
}

.reset-btn { 
  width: 220rpx; height: 70rpx; 
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); 
  color: #fff; border: none; border-radius: 35rpx; 
  font-size: 26rpx; font-weight: 600;
}
</style>