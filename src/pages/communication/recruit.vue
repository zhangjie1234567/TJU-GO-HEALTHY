<template>
  <view class="container">
    <view class="tip-card">
      <text class="tip-title">健康搭子招募</text>
      <text class="tip-desc">找一起训练、互相监督的伙伴</text>

      <view class="form-area">
        <input v-model="form.name" class="field" placeholder="队伍名称" maxlength="16" />
        <input v-model="form.tag" class="field" placeholder="标签（减脂/增肌等）" maxlength="10" />
        <input v-model="form.goal" class="field" placeholder="目标" maxlength="30" />
        <input v-model="form.time" class="field" placeholder="时间段" maxlength="20" />
        <view class="submit-row">
          <text class="submit-btn" @click="addRecruit">发布招募</text>
        </view>
      </view>
    </view>

    <view v-for="item in recruits" :key="item.id" class="recruit-card">
      <view class="head">
        <text class="name">{{ item.name }}</text>
        <text class="tag">{{ item.tag }}</text>
      </view>
      <text class="goal">目标：{{ item.goal }}</text>
      <text class="time">时间：{{ item.time }}</text>
      <text class="time">成员：{{ item.members }} 人</text>
      <view class="action-row">
        <text class="btn" @click="join(item)">我要加入</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { apiRequest } from '../../utils/request'

const recruits = ref([])

const form = ref({
  name: '',
  tag: '',
  goal: '',
  time: ''
})

const loadRecruits = async () => {
  try {
    const res = await apiRequest({ url: '/api/community/recruit?page=1&size=50', method: 'GET' })
    recruits.value = (res || [])
  } catch (e) {
    console.error('加载招募失败:', e)
  }
}

onShow(() => {
  loadRecruits()
})

const addRecruit = async () => {
  if (!form.value.name.trim() || !form.value.goal.trim()) {
    uni.showToast({ title: '请至少填写名称和目标', icon: 'none' })
    return
  }
  try {
    const userId = uni.getStorageSync('current_user_id') || 1
    await apiRequest({
      url: '/api/community/recruit',
      method: 'POST',
      header: { 'X-User-Id': userId },
      data: {
        name: form.value.name.trim(),
        tag: form.value.tag.trim() || '互助',
        goal: form.value.goal.trim(),
        time: form.value.time.trim() || '时间待定'
      }
    })
    form.value = { name: '', tag: '', goal: '', time: '' }
    await loadRecruits()
    uni.showToast({ title: '招募已发布', icon: 'success' })
  } catch (e) {
    console.error('发布招募失败:', e)
    uni.showToast({ title: '发布失败，请重试', icon: 'none' })
  }
}

const join = async (item) => {
  try {
    await apiRequest({ url: `/api/community/recruit/${item.id}/join`, method: 'POST' })
    uni.showToast({ title: `已申请加入${item.name}`, icon: 'none' })
    await loadRecruits()
  } catch (e) {
    console.error('加入招募失败:', e)
    uni.showToast({ title: '加入失败，请重试', icon: 'none' })
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

.tip-card {
  background: #fff;
  border-radius: 18rpx;
  padding: 18rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);
}

.tip-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: #333;
}

.tip-desc {
  font-size: 22rpx;
  color: #7b8a98;
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

.recruit-card {
  background: #fff;
  border-radius: 18rpx;
  padding: 16rpx;
  margin-bottom: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);
}

.head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.name {
  font-size: 27rpx;
  font-weight: 600;
  color: #333;
}

.tag {
  font-size: 20rpx;
  color: #3a7fbb;
  background: #eaf5ff;
  border-radius: 10rpx;
  padding: 4rpx 10rpx;
}

.goal,
.time {
  display: block;
  font-size: 23rpx;
  color: #6e8092;
  margin-bottom: 6rpx;
}

.action-row {
  display: flex;
  justify-content: flex-end;
}

.btn {
  background: $main-blue;
  color: #fff;
  border-radius: 20rpx;
  padding: 8rpx 18rpx;
  font-size: 22rpx;
}
</style>