<template>
  <view class="page">
    <view class="container">
      <text class="title">干饭日记</text>
      
      <!-- 今日记录 -->
      <view class="section">
        <text class="section-title">今日记录</text>
        
        <!-- 早饭 -->
        <view class="meal-card">
          <view class="meal-header">
            <text class="meal-name">早饭</text>
            <button class="add-btn" @click="addMeal('breakfast')">+</button>
          </view>
          <view class="meal-content">
            <view class="food-item" v-for="(food, index) in todayMeals.breakfast" :key="index">
              <text class="food-name">{{ food }}</text>
              <button class="delete-btn" @click="deleteMeal('breakfast', index)">-</button>
            </view>
            <text class="empty-text" v-if="todayMeals.breakfast.length === 0">还没有记录</text>
          </view>
        </view>
        
        <!-- 午饭 -->
        <view class="meal-card">
          <view class="meal-header">
            <text class="meal-name">午饭</text>
            <button class="add-btn" @click="addMeal('lunch')">+</button>
          </view>
          <view class="meal-content">
            <view class="food-item" v-for="(food, index) in todayMeals.lunch" :key="index">
              <text class="food-name">{{ food }}</text>
              <button class="delete-btn" @click="deleteMeal('lunch', index)">-</button>
            </view>
            <text class="empty-text" v-if="todayMeals.lunch.length === 0">还没有记录</text>
          </view>
        </view>
        
        <!-- 晚饭 -->
        <view class="meal-card">
          <view class="meal-header">
            <text class="meal-name">晚饭</text>
            <button class="add-btn" @click="addMeal('dinner')">+</button>
          </view>
          <view class="meal-content">
            <view class="food-item" v-for="(food, index) in todayMeals.dinner" :key="index">
              <text class="food-name">{{ food }}</text>
              <button class="delete-btn" @click="deleteMeal('dinner', index)">-</button>
            </view>
            <text class="empty-text" v-if="todayMeals.dinner.length === 0">还没有记录</text>
          </view>
        </view>
      </view>
      
      <!-- 历史记录 -->
      <view class="section">
        <view class="history-header">
          <text class="section-title">历史记录</text>
          <button class="history-btn" @click="toggleHistory">{{ showHistory ? '隐藏' : '查看' }}</button>
        </view>
        
        <view class="history-content" v-if="showHistory">
          <view class="history-card" v-for="(record, date) in historyRecords" :key="date">
            <text class="history-date">{{ date }}</text>
            
            <view class="history-meal" v-if="record.breakfast && record.breakfast.length > 0">
              <text class="history-meal-name">早饭：</text>
              <text class="history-food">{{ record.breakfast.join('、') }}</text>
            </view>
            
            <view class="history-meal" v-if="record.lunch && record.lunch.length > 0">
              <text class="history-meal-name">午饭：</text>
              <text class="history-food">{{ record.lunch.join('、') }}</text>
            </view>
            
            <view class="history-meal" v-if="record.dinner && record.dinner.length > 0">
              <text class="history-meal-name">晚饭：</text>
              <text class="history-food">{{ record.dinner.join('、') }}</text>
            </view>
          </view>
          
          <text class="empty-history" v-if="Object.keys(historyRecords).length === 0">还没有历史记录</text>
        </view>
      </view>
      
      <!-- 添加食物弹窗 -->
      <view class="modal" v-if="showAddModal">
        <view class="modal-content">
          <text class="modal-title">添加食物</text>
          <input type="text" v-model="newFood" placeholder="请输入食物名称" class="modal-input" />
          <view class="modal-buttons">
            <button class="modal-btn cancel" @click="cancelAdd">取消</button>
            <button class="modal-btn confirm" @click="confirmAdd">确定</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const today = new Date().toLocaleDateString('zh-CN')

const todayMeals = reactive({
  breakfast: [],
  lunch: [],
  dinner: []
})

const historyRecords = reactive({})
const showHistory = ref(false)
const showAddModal = ref(false)
const newFood = ref('')
const currentMealType = ref('')

// 模拟历史数据
const mockHistory = {
  '2024-12-10': {
    breakfast: ['包子', '豆浆'],
    lunch: ['米饭', '红烧肉', '青菜'],
    dinner: ['面条', '鸡蛋']
  },
  '2024-12-09': {
    breakfast: ['油条', '粥'],
    lunch: ['汉堡', '薯条'],
    dinner: ['米饭', '鱼香肉丝']
  }
}

onMounted(() => {
  // 加载历史数据
  Object.assign(historyRecords, mockHistory)
})

const addMeal = (mealType) => {
  currentMealType.value = mealType
  newFood.value = ''
  showAddModal.value = true
}

const confirmAdd = () => {
  if (newFood.value.trim()) {
    todayMeals[currentMealType.value].push(newFood.value.trim())
    showAddModal.value = false
  }
}

const cancelAdd = () => {
  showAddModal.value = false
}

const deleteMeal = (mealType, index) => {
  todayMeals[mealType].splice(index, 1)
}

const toggleHistory = () => {
  showHistory.value = !showHistory.value
}
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#fff; padding-top:24rpx; font-family: "PingFang SC", "Microsoft Yahei", Arial, sans-serif }

.container { padding:24rpx }

.title { display: block; font-size:36rpx; font-weight:700; text-align:center; margin-bottom:30rpx }

.section { margin-bottom:40rpx }

.section-title { display: block; font-size:28rpx; font-weight:600; margin-bottom:20rpx }

.history-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20rpx }

.history-btn { width:100rpx; height:40rpx; background:#4ecdc4; color:#fff; border:none; border-radius:20rpx; font-size:20rpx }

.meal-card { background:#f8f9fa; border-radius:20rpx; padding:20rpx; margin-bottom:20rpx }

.meal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:15rpx }

.meal-name { font-size:24rpx; font-weight:600 }

.add-btn { width:40rpx; height:40rpx; background:#4ecdc4; color:#fff; border:none; border-radius:50%; font-size:28rpx; line-height:40rpx }

.meal-content { min-height:60rpx }

.food-item { display:flex; justify-content:space-between; align-items:center; margin-bottom:10rpx; padding:10rpx; background:#fff; border-radius:10rpx }

.food-name { flex:1; font-size:22rpx }

.delete-btn { width:30rpx; height:30rpx; background:#ff6b6b; color:#fff; border:none; border-radius:50%; font-size:20rpx; line-height:30rpx }

.empty-text { font-size:20rpx; color:#999; text-align:center; padding:20rpx 0 }

.history-content { margin-top:10rpx }

.history-card { background:#f8f9fa; border-radius:15rpx; padding:15rpx; margin-bottom:15rpx }

.history-date { display:block; font-size:22rpx; font-weight:600; margin-bottom:10rpx }

.history-meal { display:flex; margin-bottom:8rpx }

.history-meal-name { font-size:20rpx; font-weight:500; margin-right:10rpx }

.history-food { font-size:20rpx; color:#333 }

.empty-history { font-size:20rpx; color:#999; text-align:center; padding:30rpx 0; background:#f8f9fa; border-radius:15rpx }

/* 弹窗样式 */
.modal { position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:1000 }

.modal-content { width:80%; background:#fff; border-radius:20rpx; padding:30rpx }

.modal-title { display:block; font-size:28rpx; font-weight:600; text-align:center; margin-bottom:20rpx }

.modal-input { width:100%; height:60rpx; border:1rpx solid #ddd; border-radius:10rpx; padding:0 20rpx; font-size:24rpx; margin-bottom:30rpx }

.modal-buttons { display:flex; justify-content:space-between }

.modal-btn { width:150rpx; height:50rpx; border:none; border-radius:25rpx; font-size:22rpx }

.modal-btn.cancel { background:#ccc; color:#333 }

.modal-btn.confirm { background:#4ecdc4; color:#fff }
</style>