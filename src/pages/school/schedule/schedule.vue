<template>
  <view class="page">
    <view class="content">
      <view class="card">
        <text class="section-title">我的课表</text>
        <view class="form-grid">
          <input class="input" v-model="form.courseName" placeholder="课程名称（如：高数）" />

          <picker mode="selector" :range="dayOptions" :value="form.dayIndex" @change="onDayChange">
            <view class="picker">上课日期：{{ dayOptions[form.dayIndex] }}</view>
          </picker>

          <picker mode="selector" :range="timeOptions" :value="form.startIndex" @change="onStartChange">
            <view class="picker">开始时间：{{ timeOptions[form.startIndex] }}</view>
          </picker>
          <input
            v-if="timeOptions[form.startIndex] === CUSTOM_TIME"
            class="input"
            v-model="form.customStart"
            placeholder="请输入开始时间（如 09:10）"
          />

          <picker mode="selector" :range="timeOptions" :value="form.endIndex" @change="onEndChange">
            <view class="picker">结束时间：{{ timeOptions[form.endIndex] }}</view>
          </picker>
          <input
            v-if="timeOptions[form.endIndex] === CUSTOM_TIME"
            class="input"
            v-model="form.customEnd"
            placeholder="请输入结束时间（如 10:40）"
          />

          <input class="input" v-model="form.location" placeholder="上课地点（如：A1-45）" />

          <view class="btn-add" @click="addLesson">+ 添加课程</view>
        </view>
      </view>

      <view class="week-card" v-for="(day, dayIndex) in weekData" :key="day.title">
        <text class="day-title">{{ day.title }}</text>
        <view class="lessons">
          <view v-if="day.lessons.length === 0" class="no-lesson">暂无课程</view>

          <view class="lesson" v-for="(l, idx) in day.lessons" :key="`${dayIndex}-${idx}`">
            <view class="lesson-main">
              <text class="lesson-name">{{ l.courseName }}</text>
              <text class="lesson-time">{{ l.startTime }} - {{ l.endTime }}</text>
              <text class="lesson-room">{{ l.location }}</text>
            </view>
            <text class="lesson-delete" @click="removeLesson(l.id)">删除</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'

const STORAGE_KEY = 'school_schedule_lessons_v1'
const dayOptions = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
const CUSTOM_TIME = '自定义填写'
const timeOptions = ['8:30', '10:05', '10:25', '12:00', '13:30', '15:05', '15:25', '17:00', '18:30', '8:05', '8:55', CUSTOM_TIME]

const form = reactive({
  courseName: '',
  dayIndex: 0,
  startIndex: 0,
  endIndex: 1,
  customStart: '',
  customEnd: '',
  location: ''
})

const lessons = ref([])

const weekData = computed(() => {
  return dayOptions.map((title, index) => ({
    title,
    lessons: lessons.value.filter(item => item.dayIndex === index)
  }))
})

const loadLessons = () => {
  try {
    const cached = uni.getStorageSync(STORAGE_KEY)
    const parsed = typeof cached === 'string' ? JSON.parse(cached || '[]') : cached
    lessons.value = Array.isArray(parsed) ? parsed : []
  } catch (e) {
    lessons.value = []
  }
}

const saveLessons = () => {
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(lessons.value))
}

const onDayChange = (e) => {
  form.dayIndex = Number(e?.detail?.value || 0)
}

const onStartChange = (e) => {
  const nextStart = Number(e?.detail?.value || 0)
  form.startIndex = nextStart
}

const onEndChange = (e) => {
  const nextEnd = Number(e?.detail?.value || 0)
  form.endIndex = nextEnd
}

const parseTimeToMinutes = (timeText) => {
  const normalized = String(timeText || '').trim().replace('：', ':')
  const match = normalized.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  const h = Number(match[1])
  const m = Number(match[2])
  if (h < 0 || h > 23 || m < 0 || m > 59) return null
  return h * 60 + m
}

const resolveSelectedTime = (index, customValue) => {
  const option = timeOptions[index]
  if (option !== CUSTOM_TIME) return option
  return String(customValue || '').trim().replace('：', ':')
}

const addLesson = () => {
  const courseName = String(form.courseName || '').trim()
  const location = String(form.location || '').trim()
  const startTime = resolveSelectedTime(form.startIndex, form.customStart)
  const endTime = resolveSelectedTime(form.endIndex, form.customEnd)

  if (!courseName || !location) {
    uni.showToast({ title: '请填写课程和地点', icon: 'none' })
    return
  }
  if (!startTime || !endTime) {
    uni.showToast({ title: '请填写开始和结束时间', icon: 'none' })
    return
  }

  const startMinutes = parseTimeToMinutes(startTime)
  const endMinutes = parseTimeToMinutes(endTime)
  if (startMinutes === null || endMinutes === null) {
    uni.showToast({ title: '时间格式应为 HH:MM', icon: 'none' })
    return
  }
  if (endMinutes <= startMinutes) {
    uni.showToast({ title: '结束时间需晚于开始时间', icon: 'none' })
    return
  }

  lessons.value.push({
    id: `${Date.now()}-${Math.random()}`,
    courseName,
    location,
    dayIndex: form.dayIndex,
    startTime,
    endTime
  })
  saveLessons()
  form.courseName = ''
  form.location = ''
  form.customStart = ''
  form.customEnd = ''
}

const removeLesson = (id) => {
  lessons.value = lessons.value.filter(item => item.id !== id)
  saveLessons()
}

onMounted(loadLessons)
</script>

<style lang="scss" scoped>

.page { min-height: 100vh; background: linear-gradient(135deg, #E3F2FD 0%, #F0F9FF 100%); }
.content { padding: 24rpx; }

.card,
.week-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 6rpx 18rpx rgba(79, 161, 242, 0.12);
}

.section-title { display: block; font-size: 32rpx; font-weight: 700; color: #2a4b6b; margin-bottom: 18rpx; }

.form-grid { display: flex; flex-direction: column; gap: 14rpx; }
.input,
.picker {
  background: #f5f9ff;
  border-radius: 14rpx;
  min-height: 76rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #35536f;
  box-sizing: border-box;
  width: 100%;
}

.btn-add {
  height: 76rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 28rpx;
  font-weight: 600;
  background: linear-gradient(120deg, #4FA1F2, #80D0FF);
}

.day-title { font-weight: 700; font-size: 30rpx; color: #2a4b6b; margin-bottom: 12rpx; }

.lessons { display:flex; flex-direction:column; gap:12rpx }

.lesson {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  padding: 14rpx 18rpx;
  background: #f5f9ff;
  border-radius: 16rpx;
}

.lesson-main { display: grid; grid-template-columns: 1fr 160rpx 180rpx; align-items: center; gap: 12rpx; flex: 1; }

.lesson-name { font-size:26rpx; font-weight:700; color:#0b3b45 }
.lesson-time { font-size:24rpx; color:#0b3b45; text-align:center }
.lesson-room { font-size:24rpx; color:#0b3b45; text-align:right }
.lesson-delete { color: #ff5a5a; font-size: 24rpx; min-width: 64rpx; text-align: right; }

.no-lesson {
  padding: 18rpx;
  color: #7f9cb7;
  font-size: 26rpx;
  text-align: left;
  background: #f5f9ff;
  border-radius: 16rpx;
}

@media (max-width: 420px) {
  .lesson-main { grid-template-columns: 1fr 140rpx 120rpx; }
  .lesson-time { font-size:22rpx }
  .lesson-room { font-size:22rpx }
}

@media (max-width: 340px) {
  .lesson { grid-template-columns: 1fr 120rpx 120rpx; }
  .day-title { font-size:28rpx }
}
</style>
