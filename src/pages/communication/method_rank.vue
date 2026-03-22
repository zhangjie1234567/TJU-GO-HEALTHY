<template>
  <view class="container">
    <view class="rank-tabs">
      <view
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentTab === tab.value }"
        @click="currentTab = tab.value"
      >
        {{ tab.label }}
      </view>
    </view>

    <view class="rank-card">
      <view class="input-area">
        <input v-model="form.name" class="field" placeholder="新增条目名称" maxlength="20" />
        <input v-model="form.score" class="field" placeholder="评分（0-10）" type="digit" />
        <view class="submit-row">
          <text class="submit-btn" @click="addRankItem">提交评分</text>
        </view>
      </view>

      <view class="card-header">
        <text class="title">{{ currentLabel }} TOP3</text>
      </view>

      <view v-if="currentRanks.length === 0" class="empty-tip">
        <text>暂无评分数据，先提交第一条吧</text>
      </view>

      <view v-for="(item, index) in currentRanks" :key="item.id" class="rank-item">
        <view class="left">
          <text class="order">{{ index + 1 }}</text>
          <view class="meta">
            <text class="name">{{ item.name }}</text>
            <text class="desc">评分 {{ item.score }} · 收藏 {{ item.collect }}</text>
          </view>
        </view>
        <text
          class="collect-btn"
          :class="{ active: item.collected }"
          @click="toggleCollect(item.id)"
        >
          {{ item.collected ? '已收藏' : '收藏' }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { apiRequest } from '../../utils/request'

const tabs = [
  { label: '减重方案排行', value: 'plan' },
  { label: '食谱排行', value: 'recipe' },
  { label: '运动方式排行', value: 'sport' }
]

const currentTab = ref('plan')

const rankData = ref({ plan: [], recipe: [], sport: [] })
const form = ref({ name: '', score: '' })

const loadRankData = async () => {
  try {
    const res = await apiRequest({ url: '/api/community/rank/method', method: 'GET' })
    const grouped = { plan: [], recipe: [], sport: [] }
    if (Array.isArray(res)) {
      res.forEach(item => {
        const type = item.type
        if (grouped[type]) {
          grouped[type].push({ id: item.id, name: item.name, score: item.score, collect: item.collectCount || 0, collected: false })
        }
      })
    }
    rankData.value = grouped
  } catch (e) {
    console.error('加载方法排行失败:', e)
  }
}

onShow(() => {
  loadRankData()
})

const currentRanks = computed(() => {
  const list = rankData.value[currentTab.value] || []
  return [...list].sort((a, b) => Number(b.score) - Number(a.score)).slice(0, 3)
})
const currentLabel = computed(() => tabs.find(item => item.value === currentTab.value)?.label || '排行')

const addRankItem = async () => {
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
      data: { type: currentTab.value, name, score: Number(score.toFixed(1)) }
    })
    form.value = { name: '', score: '' }
    await loadRankData()
    uni.showToast({ title: '评分已提交', icon: 'success' })
  } catch (e) {
    console.error('提交评分失败:', e)
    uni.showToast({ title: '提交失败，请重试', icon: 'none' })
  }
}

const toggleCollect = (id) => {
  const list = rankData.value[currentTab.value]
  const target = list.find(item => item.id === id)
  if (!target) return
  target.collected = !target.collected
  target.collect = Math.max(0, target.collect + (target.collected ? 1 : -1))
  uni.showToast({ title: target.collected ? '已收藏' : '已取消收藏', icon: 'none' })
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

.rank-tabs {
  display: flex;
  gap: 10rpx;
  margin-bottom: 16rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  background: #fff;
  padding: 14rpx 8rpx;
  border-radius: 14rpx;
  color: #4a759f;
  font-size: 22rpx;

  &.active {
    background: $main-blue;
    color: #fff;
    font-weight: 600;
  }
}

.rank-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);
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

.collect-btn {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  background: #eaf5ff;
  color: #3a7fbb;
  font-size: 22rpx;

  &.active {
    background: $main-blue;
    color: #fff;
  }
}
</style>