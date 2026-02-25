<template>
<view class="page">

    <view class="content">
    <!-- 今日消费统计 -->
    <view class="total-card">
        今日已花：<text class="total-price">{{ totalCost }}</text> 元
    </view>

    <!-- 使用循环渲染三大餐，修复冗余并扩大点击区域 -->
    <view class="meal-section" v-for="(label, type) in mealMap" :key="type">
        <view class="meal-header">
            <text class="meal-title">{{ label }}</text>
            <text class="count-tag">{{ todayMeals[type].length }} 项</text>
        </view>
        
        <!-- 整个蓝色区域都可点击添加 -->
        <view class="add-bar" @click="openAddModal(type)">
            <text class="plus-icon">+</text>
            <text class="add-hint">添加食物记录</text>
        </view>
        
        <text class="empty-text" v-if="todayMeals[type].length === 0">还没有记录，快去干饭吧~</text>
        
        <view class="food-list" v-else>
            <view class="food-item" v-for="(item, index) in todayMeals[type]" :key="index">
            <view class="food-info">
                <text class="food-name">{{ item.name }}</text>
                <text class="food-price">￥{{ item.price }}</text>
            </view>
            <view class="delete-btn" @click.stop="deleteMeal(type, index)">×</view>
            </view>
        </view>
        </view>
        
        <!-- 历史记录区域 -->
        <view class="history-section">
        <button class="toggle-history-btn" @click="showHistory = !showHistory">
            {{ showHistory ? '收起历史记录' : '查看历史记录' }}
        </button>
        
        <view class="history-list" v-if="showHistory">
            <view class="history-card" v-for="(record, date) in mockHistory" :key="date">
            <text class="history-date">{{ date }}</text>
            <view class="history-row" v-for="(label, type) in mealMap" :key="type">
                <block v-if="record[type] && record[type].length > 0">
                <text class="row-label">{{ label }}：</text>
                <text class="row-content">
                    {{ record[type].map(f => `${f.name}(${f.price}元)`).join('、') }}
                </text>
                </block>
            </view>
            </view>
        </view>
        </view>
    </view>
    
    <!-- 添加食物弹窗 -->
    <view class="modal-mask" v-if="showAddModal" @click="showAddModal = false">
        <view class="modal-body" @click.stop>
        <text class="modal-header">添加{{ mealMap[currentMealType] }}内容</text>
        <input type="text" v-model="newFood.name" placeholder="请输入食物名称" class="input-box" />
        <input type="digit" v-model="newFood.price" placeholder="请输入价格 (元)" class="input-box" />
        <view class="modal-footer">
            <button class="btn btn-cancel" @click="showAddModal = false">取消</button>
            <button class="btn btn-confirm" @click="confirmAdd">确定</button>
        </view>
        </view>
    </view>
    </view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'

// 基础配置
const mealMap = { breakfast: '早饭', lunch: '午饭', dinner: '晚饭' }

// 响应式数据
const todayMeals = reactive({
    breakfast: [],
    lunch: [],
    dinner: []
})

const showHistory = ref(false)
const showAddModal = ref(false)
const currentMealType = ref('')
const newFood = reactive({ name: '', price: '' })

// 模拟的历史数据
const mockHistory = {
    '2024-12-10': {
    breakfast: [{ name: '小笼包', price: 8 }, { name: '豆浆', price: 2 }],
    lunch: [{ name: '一荤一素套餐', price: 15 }],
    dinner: [{ name: '皮蛋瘦肉粥', price: 12 }]
    }
}

// 计算属性：今日总开销
const totalCost = computed(() => {
    let sum = 0
    Object.values(todayMeals).forEach(list => {
    list.forEach(item => {
        sum += Number(item.price) || 0
    })
    })
    return sum.toFixed(1)
})

// 方法
const openAddModal = (type) => {
    currentMealType.value = type
    newFood.name = ''
    newFood.price = ''
    showAddModal.value = true
}

const confirmAdd = () => {
  // 修复 bug：确保 name 是字符串且 price 是有效数字，避免 trim() 在非字符串上报错
    const nameStr = String(newFood.name || '').trim()
    const priceVal = parseFloat(newFood.price)

    if (!nameStr) {
    uni.showToast({ title: '请输入名称', icon: 'none' })
    return
    }
    if (isNaN(priceVal) || priceVal < 0) {
    uni.showToast({ title: '请输入价格', icon: 'none' })
    return
    }

    todayMeals[currentMealType.value].push({
    name: nameStr,
    price: priceVal
    })
    showAddModal.value = false
}

const deleteMeal = (type, index) => {
    todayMeals[type].splice(index, 1)
}

const goBack = () => {
    uni.navigateBack({
    fail: () => { window.history.back() }
    })
}
</script>

<style lang="scss" scoped>
.page {
    min-height: 100vh;
    background: #f7f9fc;
    font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;
    box-sizing: border-box;
}

/* 头部样式 */
.header {
    display: flex;
    align-items: center;
    padding: 60rpx 30rpx 20rpx;
    background: #fff;
    border-bottom: 1px solid #eee;
    position: sticky;
    top: 0;
    z-index: 10;
}

.back-btn {
    font-size: 40rpx;
    padding-right: 20rpx;
    color: #333;
}

.header-title {
    font-size: 34rpx;
    font-weight: bold;
}

.content {
    padding: 30rpx;
}

/* 统计卡片 */
.total-card {
    background: #fff;
    padding: 30rpx;
    border-radius: 20rpx;
    margin-bottom: 30rpx;
    font-size: 28rpx;
    color: #666;
    box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.02);
    
    .total-price {
    color: #4ecdc4;
    font-size: 40rpx;
    font-weight: bold;
    margin: 0 10rpx;
    }
}

/* 餐饮区块 */
.meal-section {
    background: #fff;
    border-radius: 24rpx;
    padding: 24rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
}

.meal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .meal-title {
    font-size: 30rpx;
    font-weight: bold;
    color: #333;
    border-left: 8rpx solid #4ecdc4;
    padding-left: 16rpx;
    }

    .count-tag {
    font-size: 22rpx;
    color: #999;
    background: #f0f0f0;
    padding: 2rpx 12rpx;
    border-radius: 20rpx;
    }
}

.add-bar {
    background: #E8F4FF;
    border: 2rpx dashed #A5C7E9;
    height: 80rpx;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4A90E2;
    
    .plus-icon {
    font-size: 40rpx;
    margin-right: 10rpx;
    }

    .add-hint {
    font-size: 26rpx;
    }
}

.empty-text {
    display: block;
    text-align: center;
    font-size: 24rpx;
    color: #ccc;
    padding: 30rpx 0;
}

.food-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f5f5f5;
    
    &:last-child {
    border-bottom: none;
    }
}

.food-info {
    flex: 1;
    display: flex;
    justify-content: space-between;
    padding-right: 20rpx;
    
    .food-name {
    font-size: 28rpx;
    color: #333;
    }

    .food-price {
    font-size: 28rpx;
    color: #ff6b6b;
    font-weight: 500;
    }
}

.delete-btn {
    width: 44rpx;
    height: 44rpx;
    background: #f0f0f0;
    color: #999;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
}

/* 历史记录样式 */
.history-section {
    margin-top: 40rpx;
}

.toggle-history-btn {
    background: #eef2f8;
    color: #666;
    font-size: 26rpx;
    border-radius: 40rpx;
    margin-bottom: 20rpx;
}

.history-card {
    background: #fff;
    padding: 24rpx;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    border: 1px solid #eee;
}

.history-date {
    font-size: 26rpx;
    font-weight: bold;
    color: #4ecdc4;
    margin-bottom: 15rpx;
    display: block;
}

.history-row {
    font-size: 24rpx;
    margin-bottom: 10rpx;
    line-height: 1.4;
    display: flex;
}

.row-label {
    color: #888;
    flex-shrink: 0;
}

.row-content {
    color: #444;
}

/* 弹窗系统 */
.modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
}

.modal-body {
    width: 80%;
    background: #fff;
    border-radius: 30rpx;
    padding: 40rpx;
  box-sizing: border-box; /* 核心：防止 padding 撑开宽度 */
}

.modal-header {
    font-size: 32rpx;
    font-weight: bold;
    text-align: center;
    margin-bottom: 30rpx;
    display: block;
}

.input-box {
    width: 100%;
    height: 80rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
  box-sizing: border-box; /* 核心：防止输入框超出边界 */
}

.modal-footer {
    display: flex;
    gap: 20rpx;
    margin-top: 20rpx;
}

.btn {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    font-size: 28rpx;
    border-radius: 40rpx;
}

.btn-cancel {
    background: #eee;
    color: #666;
}

.btn-confirm {
    background: #4ecdc4;
    color: #fff;
}
</style>