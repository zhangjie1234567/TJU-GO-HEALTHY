<template>
  <view class="container">
    <view class="header-card">
      <text class="title">用户排行榜</text>
      <text class="desc">仅按首页计划进度中的使用天数排名</text>
    </view>

    <view class="rank-column">
      <text class="column-title">使用天数排行</text>
      <view v-if="rankList.length === 0" class="empty-row">暂无排行数据</view>
      <view v-for="(row, index) in rankList" :key="`${row.userId || row.user}-${index}`" class="row-item">
        <text class="index">{{ index + 1 }}</text>
        <text class="name">{{ row.user }}</text>
        <text class="value">{{ row.value }} 天</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { apiRequest } from '../../utils/request'
import { getAuthHeaders, handleAuthError } from './auth-helper'

const rankList = ref([])

const loadMetrics = async () => {
  try {
    const res = await apiRequest({ url: '/api/community/rank/user', method: 'GET', header: getAuthHeaders() })
    rankList.value = Array.isArray(res) ? res.map(item => ({
      user: item.user || '社区用户',
      userId: item.userId,
      value: Number(item.value || 0)
    })) : []
  } catch (e) {
    if (handleAuthError(e)) {
      rankList.value = []
      return
    }
    console.error('加载用户排行失败:', e)
  }
}

onShow(() => {
  loadMetrics()
})
</script>

<style lang="scss" scoped>
$main-blue: #4FA1F2;
$bg-blue: #E3F2FD;

.container {
  min-height: 100vh;
  background: linear-gradient(135deg, $bg-blue 0%, #F0F9FF 100%);
  padding: 20rpx;
}

.header-card {
  background: #fff;
  border-radius: 18rpx;
  padding: 18rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);

  .title {
    display: block;
    font-size: 32rpx;
    color: #2f2f2f;
    font-weight: 700;
    margin-bottom: 4rpx;
  }

  .desc {
    font-size: 22rpx;
    color: #7f8d9a;
  }
}

.rank-column {
  background: #fff;
  border-radius: 16rpx;
  padding: 14rpx;
  box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);
}

.column-title {
  display: block;
  font-size: 24rpx;
  color: $main-blue;
  font-weight: 600;
  margin-bottom: 10rpx;
}

.row-item {
  background: #f6fbff;
  border-radius: 10rpx;
  padding: 10rpx;
  margin-bottom: 8rpx;
  display: flex;
  flex-direction: column;
  gap: 2rpx;
}

.empty-row {
  background: #f6fbff;
  border-radius: 10rpx;
  padding: 14rpx 10rpx;
  font-size: 22rpx;
  color: #7b8b99;
  margin-bottom: 8rpx;
}

.index {
  font-size: 20rpx;
  color: #6f8192;
}

.name {
  font-size: 24rpx;
  color: #333;
  font-weight: 600;
}

.value {
  font-size: 22rpx;
  color: #4a759f;
}
</style>