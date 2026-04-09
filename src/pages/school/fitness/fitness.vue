<template>
  <view class="page">
    <view class="content">
      <view class="card">
        <text class="section-title">体测记录</text>
        <view class="form-grid">
          <picker mode="selector" :range="yearOptions" :value="yearIndex" @change="onYearChange">
            <view class="picker">年度：{{ yearOptions[yearIndex] }}</view>
          </picker>

          <picker mode="selector" :range="genderOptions" :value="genderIndex" @change="onGenderChange">
            <view class="picker">性别：{{ genderOptions[genderIndex] }}</view>
          </picker>

          <picker mode="selector" :range="projectOptions" :value="form.projectIndex" @change="onProjectChange">
            <view class="picker">项目名称：{{ projectOptions[form.projectIndex] }}</view>
          </picker>
          <input class="input" v-model="form.value" placeholder="成绩（如 3分56秒 / 2.56m / 32次）" />
          <view class="btn-add" @click="addStat">+ 添加记录</view>
        </view>
      </view>

      <view class="stat-card">
        <view class="stat-row" v-for="(s, i) in stats" :key="i">
          <view class="stat-meta">
            <text class="stat-name">{{ s.itemName }}</text>
            <text class="stat-value">{{ s.value }}</text>
          </view>
          <text class="remove" @click="removeStat(i)">删除</text>
        </view>
        <view v-if="stats.length === 0" class="empty">暂无记录，可手动填写</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'

const STATS_BY_YEAR_KEY = 'school_fitness_stats_by_year_v2'
const LEGACY_STATS_KEY = 'school_fitness_stats_v1'

const buildYearOptions = () => {
  const now = new Date().getFullYear()
  return Array.from({ length: 8 }, (_, idx) => String(now - idx))
}

const yearOptions = ref(buildYearOptions())
const yearIndex = ref(0)
const genderOptions = ['女生', '男生']
const genderIndex = ref(0)
const statsByYear = ref({})

const selectedYear = computed(() => yearOptions.value[yearIndex.value] || String(new Date().getFullYear()))
const stats = computed(() => {
  const list = statsByYear.value[selectedYear.value]
  return Array.isArray(list) ? list : []
})

const COMMON_PROJECTS = ['BMI', '肺活量', '50米', '立定跳远', '坐位体前屈']
const FEMALE_PROJECTS = ['800米（女生）', '一分钟仰卧起坐（女生）']
const MALE_PROJECTS = ['1000米（男生）', '引体向上（男生）']

const projectOptions = ref([...COMMON_PROJECTS, ...FEMALE_PROJECTS])

const form = reactive({
  projectIndex: 0,
  value: ''
})

const refreshProjectOptions = () => {
  const current = projectOptions.value[form.projectIndex]
  projectOptions.value = genderIndex.value === 0
    ? [...COMMON_PROJECTS, ...FEMALE_PROJECTS]
    : [...COMMON_PROJECTS, ...MALE_PROJECTS]
  const idx = projectOptions.value.findIndex(item => item === current)
  form.projectIndex = idx >= 0 ? idx : 0
}

const saveStatsByYear = () => {
  uni.setStorageSync(STATS_BY_YEAR_KEY, JSON.stringify(statsByYear.value))
}

const normalizeStatsArray = (list) => {
  if (!Array.isArray(list)) return []
  const map = new Map()
  list.forEach((item) => {
    const itemName = String(item?.itemName || '').trim()
    const value = String(item?.value || '').trim()
    if (!itemName || !value) return
    map.set(itemName, { itemName, value })
  })
  return Array.from(map.values())
}

const addStat = () => {
  const itemName = projectOptions.value[form.projectIndex]
  const value = String(form.value || '').trim()
  if (!itemName || !value) {
    uni.showToast({ title: '请填写项目和成绩', icon: 'none' })
    return
  }

  const currentYear = selectedYear.value
  const currentList = normalizeStatsArray(statsByYear.value[currentYear])
  const index = currentList.findIndex(item => item.itemName === itemName)
  if (index >= 0) {
    currentList[index] = { itemName, value }
    uni.showToast({ title: '已更新该项目成绩', icon: 'none' })
  } else {
    currentList.push({ itemName, value })
  }

  statsByYear.value = {
    ...statsByYear.value,
    [currentYear]: currentList
  }
  saveStatsByYear()
  form.value = ''
}

const removeStat = (index) => {
  const currentYear = selectedYear.value
  const currentList = normalizeStatsArray(statsByYear.value[currentYear])
  currentList.splice(index, 1)
  statsByYear.value = {
    ...statsByYear.value,
    [currentYear]: currentList
  }
  saveStatsByYear()
}

const onProjectChange = (e) => {
  form.projectIndex = Number(e?.detail?.value || 0)
}

const onGenderChange = (e) => {
  genderIndex.value = Number(e?.detail?.value || 0)
  refreshProjectOptions()
}

const onYearChange = (e) => {
  yearIndex.value = Number(e?.detail?.value || 0)
}

onMounted(() => {
  refreshProjectOptions()
  try {
    const raw = uni.getStorageSync(STATS_BY_YEAR_KEY)
    const parsed = typeof raw === 'string' ? JSON.parse(raw || '{}') : raw
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const next = {}
      Object.keys(parsed).forEach((year) => {
        next[String(year)] = normalizeStatsArray(parsed[year])
      })
      statsByYear.value = next
    } else {
      statsByYear.value = {}
    }

    if (Object.keys(statsByYear.value).length === 0) {
      const legacyRaw = uni.getStorageSync(LEGACY_STATS_KEY)
      const legacyParsed = typeof legacyRaw === 'string' ? JSON.parse(legacyRaw || '[]') : legacyRaw
      const legacyList = normalizeStatsArray(legacyParsed)
      if (legacyList.length) {
        const currentYear = selectedYear.value
        statsByYear.value = { [currentYear]: legacyList }
        saveStatsByYear()
      }
    }
  } catch (e) {
    statsByYear.value = {}
  }
})
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: linear-gradient(135deg, #E3F2FD 0%, #F0F9FF 100%); font-family: "PingFang SC", "Helvetica Neue", "Microsoft Yahei", Arial, sans-serif; }
.content { padding: 24rpx; }

.card,
.stat-card { background: #ffffff; border-radius: 24rpx; padding: 24rpx; margin-bottom: 20rpx; box-shadow: 0 6rpx 18rpx rgba(79, 161, 242, 0.12); }

.section-title { display: block; font-size: 32rpx; font-weight: 700; color: #2a4b6b; margin-bottom: 14rpx; }
.form-grid { display: flex; flex-direction: column; gap: 14rpx; }

.input,
.picker {
  width: 100%;
  background: #f5f9ff;
  border-radius: 14rpx;
  min-height: 76rpx;
  padding: 16rpx 20rpx;
  box-sizing: border-box;
  font-size: 26rpx;
  color: #35536f;
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

.stat-row { display: flex; justify-content: space-between; align-items: center; padding: 12rpx 0; border-bottom: 1rpx solid #ecf3ff; }
.stat-row:last-child { border-bottom: none; }
.stat-meta { display: flex; align-items: center; gap: 20rpx; }
.stat-name { font-weight: 700; font-size: 28rpx; color: #2a4b6b; min-width: 140rpx; }
.stat-value { font-weight: 600; font-size: 26rpx; color: #35536f; }
.remove { color: #ff5a5a; font-size: 24rpx; }
.empty { color: #7f9cb7; font-size: 24rpx; text-align: center; padding: 20rpx 0; }
</style>
