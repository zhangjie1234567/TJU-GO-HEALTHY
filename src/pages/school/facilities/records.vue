<template>
  <view class="page">
    <view class="content">
      <text class="page-title">消费记录</text>
      
      <view class="record-list">
        <view class="record-item" v-for="(record, idx) in records" :key="idx">
          <view class="record-time">
            <text class="record-date">{{ record.date }}</text>
            <text class="record-clock">{{ record.time }}</text>
          </view>
          <view class="record-info">
            <text class="record-type">{{ record.type }}</text>
            <text class="record-amount" :class="record.type === '充值' ? 'amount-income' : 'amount-expense'">{{ record.amount }}元</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive } from 'vue'

const records = reactive([
  { date: '2024-02-24', time: '10:30', type: '消费', amount: '2' },
  { date: '2024-02-23', time: '16:45', type: '消费', amount: '1.5' },
  { date: '2024-02-22', time: '09:15', type: '充值', amount: '50' },
  { date: '2024-02-21', time: '14:20', type: '消费', amount: '1' },
  { date: '2024-02-20', time: '11:00', type: '消费', amount: '2' },
  { date: '2024-02-19', time: '15:30', type: '消费', amount: '1.5' },
  { date: '2024-02-18', time: '08:45', type: '充值', amount: '30' },
  { date: '2024-02-17', time: '13:20', type: '消费', amount: '1' },
  { date: '2024-02-16', time: '10:00', type: '消费', amount: '2' },
  { date: '2024-02-15', time: '16:15', type: '消费', amount: '1.5' }
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
  margin-bottom: 24rpx;
  text-align: center;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  margin: 20rpx 0 16rpx 0;
}

.record-list {
  margin-top: 16rpx;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #BEEAFB;
  border-radius: 24rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
}

.record-time {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.record-date {
  font-size: 24rpx;
  color: #333;
}

.record-clock {
  font-size: 22rpx;
  color: #666;
}

.record-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.record-type {
  font-size: 26rpx;
  font-weight: 700;
}

.record-amount {
  font-size: 28rpx;
  font-weight: 800;
}

.amount-income {
  color: #00C853;
}

.amount-expense {
  color: #FF3D00;
}
</style>