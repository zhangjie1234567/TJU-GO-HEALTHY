<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack">‹</view>
      <text class="title">课表</text>
    </view>

    <view class="content">
      <view class="week-card" v-for="day in weekData" :key="day.title">
        <text class="day-title">{{ day.title }}</text>
        <view class="lessons">
          <view v-if="!day.lessons || day.lessons.length === 0" class="no-lesson">无</view>

          <view class="lesson" v-for="(l, idx) in day.lessons" :key="idx">
            <text class="lesson-name">{{ l.courseName }}</text>
            <text class="lesson-time">{{ l.startSection }} - {{ l.endSection }}</text>
            <text class="lesson-room">{{ l.location }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
const apiUrl = ref('http://localhost:8080')
const weekData = reactive([
  { title: '星期一', lessons: [] },
  { title: '星期二', lessons: [] },
  { title: '星期三', lessons: [] },
  { title: '星期四', lessons: [] },
  { title: '星期五', lessons: [] },
  { title: '星期六', lessons: [] },
  { title: '星期日', lessons: [] }
])

const apiGet = async (path) => {
  const url = `${apiUrl.value}${path}`
  try {
    if (typeof uni !== 'undefined' && uni.request) {
      return new Promise((resolve, reject) => {
        // @ts-ignore
        uni.request({ url, method: 'GET', success: (res) => resolve(res.data), fail: reject })
      })
    }
    const res = await fetch(url)
    return await res.json()
  } catch (e) { console.warn(e); return null }
}

const fetchSchedules = async (week = 1) => {
  const res = await apiGet(`/schedules?week=${week}`)
  if (res && res.data) {
    // res.data is array of Schedule
    // group by day (1-7)
    weekData.forEach(d => d.lessons.splice(0))
    res.data.forEach(item => {
      const dayIndex = Math.max(1, Math.min(7, item.day || 1)) - 1
      weekData[dayIndex].lessons.push(item)
    })
  } else {
    // fallback sample for visual
    weekData.forEach(d => d.lessons.splice(0))
    weekData[0].lessons = [ { courseName: '高数', startSection: '1 - 2', endSection: '', location: '45教A101' } ]
  }
}

onMounted(async () => { await fetchSchedules(1) })

const goBack = () => { try{ if (typeof uni !== 'undefined' && uni.navigateBack) { uni.navigateBack({ delta: 1 }); return } } catch(e){} if (window && window.history) window.history.back() }
</script>

<style lang="scss" scoped>
.page { padding-bottom: 100rpx; background: #fff; min-height: 100vh; }
.header { display:flex; align-items:center; height:88rpx; padding:0 24rpx; }
.back { font-size:48rpx; line-height:88rpx; width:88rpx; color:#111 }
.title { font-size:36rpx; font-weight:700; margin-left:8rpx }
.content { padding: 24rpx }
.week-card { background:#BEEAFB; border-radius:30rpx; padding: 24rpx; margin-bottom: 28rpx; box-shadow: 0 6rpx 18rpx rgba(0,0,0,0.04); }
.day-title { font-weight:800; font-size:30rpx; margin-bottom: 16rpx }

.lessons { display:flex; flex-direction:column; gap:12rpx }

/* Each lesson is a three-column row: name | time | room */
.lesson {
  display: grid;
  grid-template-columns: 1fr 220rpx 220rpx;
  align-items: center;
  gap: 12rpx;
  padding: 14rpx 18rpx;
  background: rgba(255,255,255,0.6);
  border-radius: 16rpx;
}

.lesson-name { font-size:26rpx; font-weight:700; color:#0b3b45 }
.lesson-time { font-size:24rpx; color:#0b3b45; text-align:center }
.lesson-room { font-size:24rpx; color:#0b3b45; text-align:right }

.no-lesson {
  padding: 18rpx;
  color: #666;
  font-size: 26rpx;
  text-align: left;
  background: rgba(255,255,255,0.6);
  border-radius: 16rpx;
}

/* Responsive adjustments for narrow screens */
@media (max-width: 420px) {
  .lesson { grid-template-columns: 1fr 160rpx 140rpx; }
  .lesson-time { font-size:22rpx }
  .lesson-room { font-size:22rpx }
}

@media (max-width: 340px) {
  .lesson { grid-template-columns: 1fr 120rpx 120rpx; }
  .day-title { font-size:28rpx }
}
</style>
