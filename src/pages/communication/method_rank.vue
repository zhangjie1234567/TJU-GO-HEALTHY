<template>
  <view class="container">
    <view class="rank-card">
      <view class="card-header">
        <text class="title">健康方案排行</text>
      </view>

      <view class="quick-choose">
        <text class="quick-title">给我的方案模板评分</text>
        <view class="quick-list">
          <view
            v-for="item in defaultPlans"
            :key="item"
            class="quick-item"
            :class="{ active: form.name === item }"
            @click="form.name = item"
          >
            {{ item }}
          </view>
        </view>
      </view>

      <view class="input-area">
        <input v-model="form.name" class="field" placeholder="输入条目名称（支持自定义）" maxlength="20" />
        <input v-model="form.score" class="field" placeholder="评分（0-10）" type="digit" />
        <view class="submit-row">
          <text class="submit-btn" @click="addRankItem">提交评分</text>
        </view>
      </view>

      <view v-if="currentRanks.length === 0" class="empty-tip">
        <text>暂无条目，请先提交第一条评分</text>
      </view>

      <view v-for="(item, index) in currentRanks" :key="item.id" class="rank-item">
        <view class="left">
          <text class="order">{{ index + 1 }}</text>
          <view class="meta">
            <text class="name">{{ item.name }}</text>
            <text class="desc">平均分 {{ item.score }} · {{ item.voteCount || 0 }} 人评分</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { apiRequest } from '../../utils/request'
import { getAuthHeaders, getAuthToken, handleAuthError } from './auth-helper'

const defaultPlans = ['速效减脂方案', '科学慢减方案', '健身增肌方案', '瑜伽冥想方案']
const rankData = ref([])
const form = ref({ name: '', score: '' })

const loadRankData = async () => {
  try {
    const res = await apiRequest({
      url: '/api/community/rank/method',
      method: 'GET',
      data: { type: 'plan' },
      header: getAuthHeaders()
    })
    rankData.value = Array.isArray(res) ? res.map(item => ({
      id: item.id,
      name: item.name,
      score: Number(item.score || 0).toFixed(1),
      voteCount: Number(item.voteCount || 0)
    })) : []
  } catch (e) {
    if (handleAuthError(e)) {
      rankData.value = []
      return
    }
    console.error('加载方法排行失败:', e)
  }
}

onShow(() => {
  loadRankData()
})

const currentRanks = computed(() => {
  return rankData.value.slice(0, 20)
})

const addRankItem = async () => {
  if (!getAuthToken()) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  const name = form.value.name.trim()
  const score = Number(form.value.score)

  if (!name || Number.isNaN(score)) {
    uni.showToast({ title: '请填写名称和评分', icon: 'none' })
    return
  }

  if (score < 0 || score > 10) {
    uni.showToast({ title: '评分需在0-10之间', icon: 'none' })
    return
  }

  try {
    await apiRequest({
      url: '/api/community/rank/method/add',
      method: 'POST',
      header: getAuthHeaders(),
      data: { type: 'plan', name, score: Number(score.toFixed(1)) }
    })
    form.value = { name: '', score: '' }
    await loadRankData()
    uni.showToast({ title: '评分已提交', icon: 'success' })
  } catch (e) {
    if (handleAuthError(e)) return
    console.error('提交评分失败:', e)
    uni.showToast({ title: '提交失败，请重试', icon: 'none' })
  }
}

</script>

<style lang="scss" scoped>
$main-blue: #4FA1F2;
$bg-blue: #E3F2FD;

.container {
  min-height: 100vh;
  background: linear-gradient(135deg, $bg-blue 0%, #F0F9FF 100%);
  padding: 20rpx;
}

.rank-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);
}

.quick-choose {
  margin-bottom: 14rpx;
}

.quick-title {
  display: block;
  margin-bottom: 10rpx;
  font-size: 23rpx;
  color: #5c7184;
}

.quick-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8rpx;
}

.quick-item {
  background: #f3f9ff;
  border: 1rpx solid #deebf7;
  border-radius: 10rpx;
  padding: 10rpx 12rpx;
  color: #4a759f;
  font-size: 22rpx;

  &.active {
    background: #4FA1F2;
    border-color: #4FA1F2;
    color: #fff;
  }
}

.input-area {
  margin-bottom: 14rpx;
}

.field {
  height: 72rpx;
  background: #f6fbff;
  border-radius: 12rpx;
  padding: 0 14rpx;
  font-size: 24rpx;
  margin-bottom: 10rpx;
}

.submit-row {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  background: #4FA1F2;
  color: #fff;
  border-radius: 20rpx;
  padding: 8rpx 18rpx;
  font-size: 22rpx;
}

.card-header {
  margin-bottom: 14rpx;

  .title {
    font-size: 30rpx;
    color: #2f2f2f;
    font-weight: 700;
  }
}

.empty-tip {
  background: #f6fbff;
  color: #718497;
  font-size: 23rpx;
  border-radius: 12rpx;
  padding: 18rpx 14rpx;
  margin-bottom: 12rpx;
}

.rank-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f6fbff;
  border-radius: 14rpx;
  padding: 16rpx;
  margin-bottom: 12rpx;
}

.left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.order {
  width: 44rpx;
  height: 44rpx;
  line-height: 44rpx;
  text-align: center;
  border-radius: 50%;
  background: rgba(79, 161, 242, 0.2);
  color: #2f6da6;
  font-weight: 700;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.name {
  font-size: 26rpx;
  color: #333;
  font-weight: 600;
}

.desc {
  font-size: 22rpx;
  color: #7d8b99;
}
</style>