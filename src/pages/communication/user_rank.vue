<template>
  <view class="container">
    <view class="header-card">
      <text class="title">用户排行榜</text>
      <text class="desc">按运动量 / 坚持天数 / 打卡数统计</text>

      <view class="form-area">
        <view class="account-bar">当前账号：{{ currentUser.name }}</view>
        <input v-model="form.exercise" class="field" placeholder="新增运动量（km）" type="digit" />
        <input v-model="form.days" class="field" placeholder="新增坚持天数" type="number" />
        <input v-model="form.clock" class="field" placeholder="新增打卡数" type="number" />
        <view class="submit-row">
          <text class="submit-btn" @click="submitMetric">提交数据</text>
        </view>
      </view>
    </view>

    <view class="columns">
      <view class="rank-column" v-for="block in rankBlocks" :key="block.key">
        <text class="column-title">{{ block.title }}</text>
        <view v-if="block.list.length === 0" class="empty-row">暂无数据</view>
        <view v-for="(row, index) in block.list" :key="row.user" class="row-item">
          <text class="index">{{ index + 1 }}</text>
          <text class="name">{{ row.user }}</text>
          <text class="value">{{ row.value }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { apiRequest } from '../../utils/request'

const rankData = ref({ exercise: [], days: [], clock: [] })
const currentUser = ref({ name: '未登录用户', studentId: '', avatar: '' })
const form = ref({
  exercise: '',
  days: '',
  clock: ''
})

const loadMetrics = async () => {
  try {
    const res = await apiRequest({ url: '/api/community/rank/user', method: 'GET' })
    if (res) rankData.value = res
  } catch (e) {
    console.error('加载用户排行失败:', e)
  }
}

const loadCurrentUser = () => {
  const saved = uni.getStorageSync('current_user_profile')
  if (saved?.name) {
    currentUser.value = {
      name: saved.name,
      studentId: saved.studentId || '',
      avatar: saved.avatar || saved.name.slice(0, 1)
    }
    return
  }

  const rememberName = uni.getStorageSync('login_remember_name')
  const rememberId = uni.getStorageSync('login_remember_studentId')
  if (rememberName) {
    currentUser.value = {
      name: rememberName,
      studentId: rememberId || '',
      avatar: rememberName.slice(0, 1)
    }
  }
}

onShow(() => {
  loadCurrentUser()
  loadMetrics()
})

const rankBlocks = computed(() => [
  { key: 'exercise', title: '运动量', list: (rankData.value.exercise || []).slice(0, 5).map(r => ({ user: r.user, value: `${r.value} km` })) },
  { key: 'days', title: '坦持天数', list: (rankData.value.days || []).slice(0, 5).map(r => ({ user: r.user, value: `${r.value} 天` })) },
  { key: 'clock', title: '打卡数', list: (rankData.value.clock || []).slice(0, 5).map(r => ({ user: r.user, value: `${r.value} 次` })) }
])

const submitMetric = async () => {
  const user = currentUser.value.name
  if (!user || user === '未登录用户') {
    uni.showToast({ title: '请先去登录页认证账号', icon: 'none' })
    return
  }
  const exercise = Number(form.value.exercise || 0)
  const days = Number(form.value.days || 0)
  const clock = Number(form.value.clock || 0)
  if (exercise < 0 || days < 0 || clock < 0) {
    uni.showToast({ title: '数据不能为负数', icon: 'none' })
    return
  }
  try {
    const userId = uni.getStorageSync('current_user_id') || 1
    await apiRequest({
      url: '/api/community/rank/user/add',
      method: 'POST',
      header: { 'X-User-Id': userId },
      data: { exercise, days, clock }
    })
    form.value = { exercise: '', days: '', clock: '' }
    await loadMetrics()
    uni.showToast({ title: '数据已更新', icon: 'success' })
  } catch (e) {
    console.error('提交指标失败:', e)
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

.form-area {
  margin-top: 16rpx;
}

.field {
  background: #f6fbff;
  border-radius: 12rpx;
  height: 72rpx;
  padding: 0 14rpx;
  font-size: 24rpx;
  margin-bottom: 10rpx;
}

.account-bar {
  background: #eef7ff;
  border-radius: 12rpx;
  padding: 14rpx;
  font-size: 24rpx;
  color: #3a7fbb;
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

.columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
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