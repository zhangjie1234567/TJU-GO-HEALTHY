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
            <view class="food-item" v-for="(item, index) in todayMeals[type]" :key="item.id || index">
            <view class="food-info">
                <text class="food-name">{{ item.name }}</text>
                <text class="food-price">￥{{ item.price }}</text>
            </view>
            <view class="delete-btn" @click.stop="deleteMeal(item, type, index)">×</view>
            </view>
        </view>
        </view>
        
        <!-- 历史记录区域 -->
        <view class="history-section">
        <button class="toggle-history-btn" @click="toggleHistory">
            {{ showHistory ? '收起历史记录' : '查看历史记录' }}
        </button>
        
        <view class="history-list" v-if="showHistory">
            <view class="history-card" v-for="(record, date) in history" :key="date">
            <text class="history-date">{{ date }}</text>
            <view class="history-row" v-for="(label, type) in mealMap" :key="type">
                <block v-if="record[type] && record[type].length > 0">
                <text class="row-label">{{ label }}：</text>
                <text class="row-content">
                    {{ formatRecordList(record[type]) }}
                </text>
                </block>
            </view>
            </view>
        </view>
        </view>
    </view>
    
    <!-- 添加食物弹窗 -->
    <view class="modal-mask" v-if="showAddModal" @click="closeAddModal">
        <view class="modal-body" @click.stop>
        <text class="modal-header">添加{{ mealMap[currentMealType] }}内容</text>
        <input type="text" v-model="newFood.name" placeholder="请输入食物名称" class="input-box" />
        <input type="digit" v-model="newFood.price" placeholder="请输入价格 (元)" class="input-box" />
        <view class="modal-footer">
            <button class="btn btn-cancel" @click="closeAddModal">取消</button>
            <button class="btn btn-confirm" @click="confirmAdd">确定</button>
        </view>
        </view>
    </view>
    </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

const apiBase = 'http://localhost:8080'

// API helper supporting uni.request and fetch
const apiRequest = (method, path, data = null, params = null) => {
  const url = new URL(apiBase + path)
  if (params) {
    Object.keys(params).forEach(k => { if (params[k] !== undefined && params[k] !== null) url.searchParams.set(k, params[k]) })
  }

  return new Promise((resolve, reject) => {
    try {
      if (typeof uni !== 'undefined' && uni.request) {
        // @ts-ignore
        uni.request({
          url: url.toString(),
          method: method.toUpperCase(),
          data: data,
          success: (res) => {
            // uni returns { statusCode, data }
            if (res && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(res.data)
            } else {
              reject(res)
            }
          },
          fail: (err) => reject(err)
        })
        return
      }
    } catch (e) {
      // continue to fetch fallback
    }

    // fetch fallback for H5
    const fetchOpts = { method: method.toUpperCase(), headers: { 'Content-Type': 'application/json' } }
    if (data) fetchOpts.body = JSON.stringify(data)
    fetch(url.toString(), fetchOpts).then(async r => {
      const json = await r.json().catch(() => null)
      if (r.ok) resolve(json)
      else reject({ status: r.status, body: json })
    }).catch(err => reject(err))
  })
}

// meal types
const mealMap = { breakfast: '早饭', lunch: '午饭', dinner: '晚饭' }

const todayMeals = reactive({ breakfast: [], lunch: [], dinner: [] })
const history = reactive({})
const showHistory = ref(false)
const showAddModal = ref(false)
const currentMealType = ref('')
const newFood = reactive({ name: '', price: '' })
const todayDate = ref(new Date().toISOString().slice(0,10))

const totalCost = computed(() => {
  let sum = 0
  Object.values(todayMeals).forEach(list => list.forEach(item => { sum += Number(item.price) || 0 }))
  return sum.toFixed(1)
})

const formatRecordList = (list) => {
  if (!Array.isArray(list)) return ''
  return list.map(f => `${f.name}(${f.price}元)`).join('、')
}

const getPayload = (res) => {
  if (res == null) return null
  if (res.data !== undefined) return res.data
  if (res.code !== undefined && res.data !== undefined) return res.data
  return res
}

const mapItemType = (t) => {
  if (t === undefined || t === null) return null
  const s = String(t).toLowerCase()
  if (['breakfast','早','早饭','1','"1"'].includes(s) || s.includes('早')) return 'breakfast'
  if (['lunch','中','午饭','2','"2"'].includes(s) || s.includes('午')) return 'lunch'
  if (['dinner','晚','晚饭','3','"3"'].includes(s) || s.includes('晚')) return 'dinner'
  // fallback: try numeric
  if (s === '1') return 'breakfast'
  if (s === '2') return 'lunch'
  if (s === '3') return 'dinner'
  return null
}

const normalizeDailyMeals = (payload) => {
  // clear current
  ['breakfast','lunch','dinner'].forEach(k => todayMeals[k].splice(0, todayMeals[k].length))

  if (!payload) return

  // payload may already have breakfast/lunch/dinner
  if (payload.breakfast || payload.lunch || payload.dinner) {
    ['breakfast','lunch','dinner'].forEach(k => {
      if (Array.isArray(payload[k])) payload[k].forEach(item => todayMeals[k].push(item))
    })
    return
  }

  // payload may be an array of items
  if (Array.isArray(payload)) {
    payload.forEach(item => {
      const t = mapItemType(item.type || item.meal_type || item.mealType)
      const key = t || 'lunch'
      todayMeals[key].push(item)
    })
    return
  }

  // payload may have a nested list: { list: [...] }
  if (Array.isArray(payload.list)) {
    payload.list.forEach(item => {
      const t = mapItemType(item.type || item.meal_type || item.mealType)
      const key = t || 'lunch'
      todayMeals[key].push(item)
    })
    return
  }

  // unknown shape: if object with keys that look like dates, maybe server returned { date: {breakfast:..., ...} }
  // try to extract today's key
  const todayKey = todayDate.value
  if (payload[todayKey]) {
    normalizeDailyMeals(payload[todayKey])
    return
  }
}

const loadToday = async (dateStr) => {
  try {
    const res = await apiRequest('get', '/meals', null, { date: dateStr })
    const payload = getPayload(res)
    console.debug('loadToday payload:', payload)
    normalizeDailyMeals(payload)
  } catch (e) {
    console.warn('loadToday failed', e)
  }
}

const normalizeHistory = (payload) => {
  // clear
  Object.keys(history).forEach(k => delete history[k])
  if (!payload) return
  // if payload is object mapping date->record
  if (!Array.isArray(payload) && typeof payload === 'object' && (payload.breakfast || payload.lunch || payload.dinner || Object.keys(payload).some(k => k.includes('-')))) {
    // if keys are dates, copy
    Object.keys(payload).forEach(k => { history[k] = payload[k] })
    return
  }
  // if payload is array of records like [{ date, items: [...] }] or [{date, breakfast:[], lunch:[] }]
  if (Array.isArray(payload)) {
    payload.forEach(entry => {
      if (!entry) return
      const date = entry.date || entry.day || entry._date
      if (!date) return
      if (entry.breakfast || entry.lunch || entry.dinner) {
        history[date] = { breakfast: entry.breakfast || [], lunch: entry.lunch || [], dinner: entry.dinner || [] }
        return
      }
      // if entry has items array, group them
      if (Array.isArray(entry.items) || Array.isArray(entry.list)) {
        const arr = entry.items || entry.list
        const grouped = { breakfast: [], lunch: [], dinner: [] }
        arr.forEach(it => {
          const t = mapItemType(it.type || it.meal_type || it.mealType)
          const key = t || 'lunch'
          grouped[key].push(it)
        })
        history[date] = grouped
      }
    })
    return
  }
}

const loadHistory = async () => {
  try {
    const res = await apiRequest('get', '/meals/history')
    const payload = getPayload(res)
    console.debug('loadHistory payload:', payload)
    normalizeHistory(payload)
  } catch (e) {
    console.warn('loadHistory failed', e)
  }
}

const openAddModal = (type) => {
  currentMealType.value = type
  newFood.name = ''
  newFood.price = ''
  showAddModal.value = true
}

const closeAddModal = () => { showAddModal.value = false }

const confirmAdd = async () => {
  const nameStr = String(newFood.name || '').trim()
  const priceVal = parseFloat(newFood.price)
  if (!nameStr) { uni.showToast({ title: '请输入名称', icon: 'none' }); return }
  if (isNaN(priceVal) || priceVal < 0) { uni.showToast({ title: '请输入价格', icon: 'none' }); return }

  // include mealType and meal_type to match backend expectations
  const payload = { date: todayDate.value, type: currentMealType.value, mealType: currentMealType.value, meal_type: currentMealType.value, name: nameStr, price: priceVal }
  try {
    const res = await apiRequest('post', '/meals', payload)
    console.debug('confirmAdd resp:', res)
    // reload today's data to keep server authoritative
    await loadToday(todayDate.value)
    // if history panel is open, refresh
    if (showHistory.value) await loadHistory()
    uni.showToast({ title: '添加成功', icon: 'success' })
    showAddModal.value = false
  } catch (e) {
    console.error('confirmAdd failed', e)
    uni.showToast({ title: '添加失败', icon: 'none' })
  }
}

const deleteMeal = async (item, type, index) => {
  // if item has id, call backend; otherwise just remove local
  if (item && item.id) {
    try {
      await apiRequest('delete', `/meals/${item.id}`)
      await loadToday(todayDate.value)
      uni.showToast({ title: '删除成功', icon: 'success' })
    } catch (e) {
      console.error('delete failed', e)
      uni.showToast({ title: '删除失败', icon: 'none' })
    }
  } else {
    todayMeals[type].splice(index, 1)
    uni.showToast({ title: '已删除', icon: 'success' })
  }
}

const toggleHistory = async () => {
  showHistory.value = !showHistory.value
  if (showHistory.value) await loadHistory()
}

const goBack = () => {
  try { uni.navigateBack({}) } catch (e) { window.history.back() }
}

onMounted(async () => {
  await loadToday(todayDate.value)
})
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