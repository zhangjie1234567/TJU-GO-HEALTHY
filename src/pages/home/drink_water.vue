<template>
  <view class="dw-bg">
    <view class="dw-summary-card">
      <view class="dw-summary-info">
        <view class="dw-row">
          <text>今日已喝</text>
          <text class="dw-num">{{ todayDrank }}</text><text class="dw-unit">ml</text>
        </view>
        <view class="dw-row">
          <text>喝水目标</text>
          <text class="dw-num dw-goal">{{ drinkGoal }}</text><text class="dw-unit">ml</text>
        </view>
      </view>
    </view>
    <view class="dw-cup-title">常用杯型及容量</view>
    <view class="dw-cup-list">
      <view v-for="cup in cups" :key="cup.value" class="dw-cup-item" @click="addWater(cup.value)">
        <view class="dw-cup-icon">{{ cup.icon }}</view>
        <view class="dw-cup-label">{{ cup.label }}</view>
        <view class="dw-cup-value">{{ cup.value }}ml</view>
      </view>
      <view class="dw-cup-item" @click="showCustom = true">
        <view class="dw-cup-icon">＋</view>
        <view class="dw-cup-label">自定义</view>
      </view>
    </view>
    <view class="dw-tip">注：点击杯型将对应容量的水添加到“今日已喝”中</view>
    <!-- 自定义弹窗 -->
    <view v-if="showCustom" class="dw-popup-mask">
      <view class="dw-popup-content">
        <view class="dw-popup-title">自定义容量</view>
        <input v-model="customValue" type="number" class="dw-popup-input" placeholder="请输入容量(ml)" />
        <view class="dw-popup-btn-row">
          <button class="dw-popup-btn" @click="showCustom = false">取消</button>
          <button class="dw-popup-btn confirm" @click="addCustom">添加</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
  import {
    ref,
    onMounted
  } from 'vue'
  const todayDrank = ref(0)
  const drinkGoal = ref(1800)
  const showCustom = ref(false)
  const customValue = ref('')

  const cups = [{
      icon: '☕',
      label: '咖啡杯',
      value: 80
    },
    {
      icon: '🥤',
      label: '纸杯',
      value: 250
    },
    {
      icon: '🧴',
      label: '矿泉水瓶',
      value: 550
    },
    {
      icon: '🏃',
      label: '运动水壶',
      value: 1000
    },
    {
      icon: '🫙',
      label: '大肚杯',
      value: 2000
    },
  ]

  function loadDrink() {
    try {
      const d = JSON.parse(uni.getStorageSync('drinkWater') || '{}')
      const today = new Date().toLocaleDateString()
      todayDrank.value = d[today] || 0
      if (d.goal) drinkGoal.value = d.goal
    } catch {}
  }
  onMounted(loadDrink)

  function saveDrink() {
    const today = new Date().toLocaleDateString()
    let d = {}
    try {
      d = JSON.parse(uni.getStorageSync('drinkWater') || '{}')
    } catch {}
    d[today] = todayDrank.value
    d.goal = drinkGoal.value
    uni.setStorageSync('drinkWater', JSON.stringify(d))
  }

  function addWater(val) {
    todayDrank.value += val
    saveDrink()
  }

  function addCustom() {
    const v = parseInt(customValue.value)
    if (!v || v < 1 || v > 5000) {
      uni.showToast({
        title: '请输入合理容量',
        icon: 'none'
      })
      return
    }
    addWater(v)
    showCustom.value = false
    customValue.value = ''
  }
</script>

<style scoped>
  .dw-bg {
    min-height: 100vh;
    background: linear-gradient(135deg, #E3F2FD 0%, #F0F9FF 100%);
    padding: 18px 20px 0 20px;
  }

  .dw-summary-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(79, 161, 242, 0.08);
    margin: 0 auto 18px auto;
    max-width: 340px;
    padding: 18px 18px 12px 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .dw-water-img {
    width: 120px;
    height: 90px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 10px;
  }

  .dw-summary-info {
    width: 100%;
  }

  .dw-row {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: 17px;
    margin-bottom: 6px;
  }

  .dw-num {
    color: #2196f3;
    font-size: 24px;
    font-weight: 700;
    margin: 0 2px;
  }

  .dw-goal {
    color: #1976d2;
  }

  .dw-unit {
    color: #2196f3;
    font-size: 15px;
  }

  .dw-cup-title {
    text-align: center;
    font-size: 18px;
    color: #333;
    font-weight: 600;
    margin-bottom: 10px;
  }

  .dw-cup-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 10px;
    justify-content: center;
    margin-bottom: 10px;
  }

  .dw-cup-item {
    width: 80px;
    height: 90px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 1px 6px rgba(79, 161, 242, 0.06);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: box-shadow 0.2s;
    border: 2px solid #f4fbff;
  }

  .dw-cup-item:active {
    box-shadow: 0 2px 12px #90caf9;
    border: 2px solid #90caf9;
  }

  .dw-cup-icon {
    font-size: 32px;
    margin-bottom: 2px;
  }

  .dw-cup-label {
    font-size: 13px;
    color: #2196f3;
    margin-bottom: 2px;
  }

  .dw-cup-value {
    font-size: 13px;
    color: #888;
  }

  .dw-tip {
    text-align: center;
    color: #888;
    font-size: 13px;
    margin: 8px 0 16px 0;
  }

  .dw-popup-mask {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.25);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dw-popup-content {
    background: #fff;
    border-radius: 12px;
    min-width: 260px;
    max-width: 90vw;
    padding: 24px 18px 18px 18px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .dw-popup-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 18px;
    text-align: center;
  }

  .dw-popup-input {
    min-height: 40px;
    border-radius: 8px;
    border: 1px solid #e3f2fd;
    padding: 10px;
    font-size: 15px;
    margin-bottom: 12px;
    background: #f7f7fa;
    color: #333;
  }

  .dw-popup-btn-row {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
  }

  .dw-popup-btn {
    flex: 1;
    text-align: center;
    padding: 10px 0;
    font-size: 16px;
    border-radius: 8px;
    background: #f0f0f0;
    margin: 0 6px;
    cursor: pointer;
  }

  .dw-popup-btn.confirm {
    background: #2196f3;
    color: #fff;
    font-weight: 600;
  }
</style>