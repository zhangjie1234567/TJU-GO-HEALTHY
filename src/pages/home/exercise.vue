<template>
  <view class="ex-bg">
    <view class="ex-summary-card">
      <view class="ex-summary-info">
        <view class="ex-row">
          <text>今日已消耗</text>
          <text class="ex-num">{{ todayCalorie }}</text><text class="ex-unit">大卡</text>
        </view>
        <view class="ex-row" @click="openGoalEdit" style="cursor:pointer;">
          <text>运动目标</text>
          <text class="ex-num ex-goal">{{ exerciseGoal }}</text><text class="ex-unit">大卡</text>
          <text style="font-size:12px;color:#90caf9;margin-left:4px;">✏️</text>
        </view>
      </view>
    </view>
    <view class="ex-tip">
      世界卫生组织建议成年人每周至少进行
      <text class="ex-tip-highlight">150-300分钟</text>的中等强度运动或
      <text class="ex-tip-highlight">75-150分钟</text>的高强度运动
    </view>
    <view class="ex-record-card">
      <view class="ex-record-header">
        今日记录（共{{ todayCalorie }}大卡，{{ totalMinutes }}分钟）
      </view>
      <view v-if="records.length === 0" class="ex-empty-tip">暂无运动记录，快来添加吧！</view>
      <view v-else>
        <view v-for="item in records" :key="item.id" class="ex-record-item">
          <view class="ex-record-icon">{{ item.icon }}</view>
          <view class="ex-record-info">
            <text class="ex-record-title">{{ item.name }}</text>
            <text class="ex-record-desc">{{ item.duration }}分钟</text>
          </view>
          <view class="ex-record-calorie">{{ item.calorie }}大卡</view>
        </view>
      </view>
      <button class="ex-add-btn" @click="showAdd = true">添加运动</button>
    </view>
    <!-- 添加运动弹窗 -->
    <view v-if="showAdd" class="ex-popup-mask">
      <view class="ex-popup-content">
        <view class="ex-popup-title">添加运动</view>
        <!-- 运动类型选择 -->
        <view class="ex-type-list">
          <view
            v-for="(type, index) in exerciseTypes"
            :key="index"
            class="ex-type-item"
            :class="{ active: selectedType === index }"
            @click="selectedType = index"
          >
            <text class="ex-type-icon">{{ type.icon }}</text>
            <text class="ex-type-name">{{ type.name }}</text>
          </view>
        </view>
        <input v-model="addDuration" type="number" class="ex-popup-input" placeholder="请输入时长(分钟)" />
        <!-- 自定义运动时显示额外输入 -->
        <template v-if="exerciseTypes[selectedType].custom">
          <input v-model="customName" class="ex-popup-input" placeholder="请输入运动名称" />
          <text class="ex-custom-hint">将按中等强度（约5大卡/分钟）自动估算消耗热量</text>
        </template>
        <view class="ex-popup-btn-row">
          <button class="ex-popup-btn" @click="showAdd = false">取消</button>
          <button class="ex-popup-btn confirm" @click="addExercise">添加</button>
        </view>
      </view>
    </view>

    <!-- 修改运动目标弹窗 -->
    <view v-if="showGoalEdit" class="ex-popup-mask">
      <view class="ex-popup-content">
        <view class="ex-popup-title">修改运动目标</view>
        <input v-model="goalEditValue" type="number" class="ex-popup-input" placeholder="请输入目标(大卡)" />
        <view class="ex-popup-btn-row">
          <button class="ex-popup-btn" @click="showGoalEdit = false">取消</button>
          <button class="ex-popup-btn confirm" @click="saveGoal">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
  import {
    ref,
    computed
  } from 'vue'
  import { onShow } from '@dcloudio/uni-app'
  import { BASE_URL } from '@/config.js'
  import { getDailyData, saveDailyData } from '../my/my-store'

  const todayCalorie = ref(0)
  const exerciseGoal = ref(500)
  const records = ref([])
  const showAdd = ref(false)
  const addDuration = ref('')
  const selectedType = ref(0)
  const customName = ref('')
  const showGoalEdit = ref(false)
  const goalEditValue = ref('')
  const loading = ref(false)

  // API基础URL
  const API_BASE = BASE_URL + '/api/exercise'

  // 获取token
  function getToken() {
    return uni.getStorageSync('token') || ''
  }

  const exerciseTypes = [
    { icon: '👣', name: '步行(3km/h)',   caloriePerMin: 2.1 },
    { icon: '🏃', name: '跑步(9.6km/h)', caloriePerMin: 8.8 },
    { icon: '🚴', name: '骑行(15km/h)',  caloriePerMin: 5.5 },
    { icon: '🏊', name: '游泳',           caloriePerMin: 7.0 },
    { icon: '🧘', name: '瑜伽',           caloriePerMin: 3.0 },
    { icon: '💃', name: '跳舞',           caloriePerMin: 5.0 },
    { icon: '🏓', name: '乒乓球',         caloriePerMin: 4.5 },
    { icon: '🏸', name: '羽毛球',         caloriePerMin: 6.0 },
    { icon: '🏐', name: '排球',           caloriePerMin: 5.0 },
    { icon: '🏀', name: '篮球',           caloriePerMin: 7.5 },
    { icon: '🎾', name: '网球',           caloriePerMin: 7.0 },
    { icon: '🎱', name: '壁球',           caloriePerMin: 9.0 },
    { icon: '🪝', name: '跳绳',           caloriePerMin: 10.0 },
    { icon: '✏️', name: '自定义',         caloriePerMin: 5.0, custom: true },
  ]

  const totalMinutes = computed(() => {
    return records.value.reduce((sum, r) => sum + Number(r.duration), 0)
  })

  // 从后端API加载今日运动记录
  function loadExercise() {
    loading.value = true
    const token = getToken()
    if (!token) {
      // 未登录时从本地存储降级
      loadExerciseFromLocal()
      return
    }
    uni.request({
      url: `${API_BASE}/today`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        console.log('今日运动响应：', res)
        if (res.statusCode === 200 && res.data.code === 200 && res.data.data) {
          const data = res.data.data
          // 后端返回格式: { todayCalorie, exerciseGoal, records: [{id, name, icon, duration, calorie}, ...] }
          records.value = (data.records || []).map(item => ({
            id: item.id,
            name: item.name,
            icon: item.icon,
            duration: item.duration,
            calorie: item.calorie
          }))
          todayCalorie.value = data.todayCalorie || 0
          exerciseGoal.value = data.exerciseGoal || 500
        } else {
          console.warn('今日运动接口返回非成功状态：', res.data)
          loadExerciseFromLocal()
        }
      },
      fail: (err) => {
        console.warn('运动记录加载失败，使用本地数据:', err)
        loadExerciseFromLocal()
      },
      complete: () => {
        loading.value = false
      }
    })
  }

  // 从本地存储加载（降级方案）
  function loadExerciseFromLocal() {
    try {
      const d = JSON.parse(uni.getStorageSync('exerciseRecords') || '{}')
      const today = new Date().toLocaleDateString()
      records.value = d[today] || []
      todayCalorie.value = records.value.reduce((sum, r) => sum + Number(r.calorie), 0)
      if (d.goal) exerciseGoal.value = d.goal
    } catch {}
    loading.value = false
  }

  onShow(loadExercise)

  function openGoalEdit() {
    goalEditValue.value = String(exerciseGoal.value || '')
    showGoalEdit.value = true
  }

  // 保存运动记录到本地（仅用于离线缓存）
  function saveExerciseToLocal() {
    const today = new Date().toLocaleDateString()
    let d = {}
    try {
      d = JSON.parse(uni.getStorageSync('exerciseRecords') || '{}')
    } catch {}
    d[today] = records.value
    d.goal = exerciseGoal.value
    uni.setStorageSync('exerciseRecords', JSON.stringify(d))
  }

  async function syncRunMinutesToSummary(name, duration) {
    if (!String(name || '').includes('跑步')) return
    const minutes = Number(duration)
    if (!Number.isFinite(minutes) || minutes <= 0) return

    const token = getToken()
    if (!token) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const dailyList = await getDailyData()
      const todayRecord = (dailyList || []).find(item => item?.date === today)
      const currentMetrics = todayRecord?.metrics || {}
      const currentRunMinutes = Number(currentMetrics.runMinutes) || 0

      await saveDailyData(dailyList, {
        date: today,
        metrics: {
          distance: Number(currentMetrics.distance) || 0,
          runMinutes: Number((currentRunMinutes + minutes).toFixed(2)),
          focus: Number(currentMetrics.focus) || 0,
          weight: Number(currentMetrics.weight) || 0,
          water: Number(currentMetrics.water) || 0
        }
      })
    } catch (error) {
      console.warn('同步跑步时长到数据小结失败', error)
    }
  }

  function addExercise() {
    const duration = parseInt(addDuration.value)
    if (!duration || duration < 1 || duration > 300) {
      uni.showToast({ title: '请输入合理时长', icon: 'none' })
      return
    }
    const type = exerciseTypes[selectedType.value]
    let name = type.name
    let caloriePerMin = type.caloriePerMin
    if (type.custom) {
      if (!customName.value.trim()) {
        uni.showToast({ title: '请输入运动名称', icon: 'none' })
        return
      }
      name = customName.value.trim()
      // 自定义运动按中等强度5大卡/分钟自动估算
      caloriePerMin = 5.0
    }
    const calorie = Math.round(caloriePerMin * duration)

    const token = getToken()
    if (!token) {
      // 未登录时仅保存到本地
      records.value.push({
        id: Date.now(),
        icon: type.icon,
        name,
        duration,
        calorie
      })
      todayCalorie.value += calorie
      saveExerciseToLocal()
      syncRunMinutesToSummary(name, duration)
      showAdd.value = false
      addDuration.value = ''
      customName.value = ''
      uni.showToast({ title: '运动已保存到本地', icon: 'success' })
      return
    }

    // 调用后端API保存运动记录
    uni.request({
      url: `${API_BASE}/add`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        name,
        icon: type.icon,
        duration,
        calorie
      },
      success: (res) => {
        console.log('新增运动响应：', res)
        if (res.statusCode === 200 && res.data.code === 200) {
          syncRunMinutesToSummary(name, duration)
          // 后端保存成功，重新加载列表
          loadExercise()
          uni.showToast({ title: '运动已记录', icon: 'success' })
        } else {
          uni.showToast({ title: res.data.message || '保存失败', icon: 'none' })
        }
      },
      fail: (err) => {
        console.error('运动记录保存失败:', err)
        // 失败降级到本地
        records.value.push({
          id: Date.now(),
          icon: type.icon,
          name,
          duration,
          calorie
        })
        todayCalorie.value += calorie
        saveExerciseToLocal()
        syncRunMinutesToSummary(name, duration)
        uni.showToast({ title: '已保存到本地', icon: 'warning' })
      }
    })

    showAdd.value = false
    addDuration.value = ''
    customName.value = ''
  }

  function saveGoal() {
    const v = parseInt(goalEditValue.value)
    if (!v || v < 1 || v > 10000) {
      uni.showToast({ title: '请输入1~10000之间的目标', icon: 'none' })
      return
    }

    const token = getToken()
    if (!token) {
      exerciseGoal.value = v
      saveExerciseToLocal()
      showGoalEdit.value = false
      goalEditValue.value = ''
      uni.showToast({ title: '已保存到本地', icon: 'success' })
      return
    }

    uni.request({
      url: `${API_BASE}/goal`,
      method: 'PUT',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: { goal: v },
      success: (res) => {
        console.log('修改运动目标响应：', res)
        if (res.statusCode === 200 && res.data && res.data.code === 200) {
          loadExercise()
          saveExerciseToLocal()
          uni.showToast({ title: '目标已更新', icon: 'success' })
        } else {
          uni.showToast({ title: (res.data && res.data.message) || '更新失败', icon: 'none' })
        }
      },
      fail: (err) => {
        console.error('修改运动目标请求失败:', err)
        uni.showToast({ title: '网络错误', icon: 'none' })
      }
    })

    showGoalEdit.value = false
    goalEditValue.value = ''
  }
</script>

<style scoped>
  .ex-bg {
    min-height: 100vh;
    background: #f4fbff;
    padding: 18px 20px 0 20px;
  }

  .ex-summary-card {
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

  .ex-img {
    width: 120px;
    height: 90px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 10px;
  }

  .ex-summary-info {
    width: 100%;
  }

  .ex-row {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-size: 17px;
    margin-bottom: 6px;
  }

  .ex-num {
    color: #2196f3;
    font-size: 24px;
    font-weight: 700;
    margin: 0 2px;
  }

  .ex-goal {
    color: #1976d2;
  }

  .ex-unit {
    color: #2196f3;
    font-size: 15px;
  }

  .ex-tip {
    text-align: center;
    color: #333;
    font-size: 14px;
    margin: 8px 0 16px 0;
  }

  .ex-tip-highlight {
    color: #1976d2;
    font-weight: 600;
  }

  .ex-record-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(79, 161, 242, 0.08);
    margin: 0 auto 18px auto;
    max-width: 340px;
    padding: 18px 18px 12px 18px;
  }

  .ex-record-header {
    font-size: 15px;
    color: #2196f3;
    font-weight: 600;
    margin-bottom: 10px;
  }

  .ex-empty-tip {
    text-align: center;
    color: #888;
    font-size: 14px;
    margin-bottom: 10px;
  }

  .ex-record-item {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #f7f7fa;
    border-radius: 10px;
    padding: 8px 12px;
    margin-bottom: 8px;
  }

  .ex-record-icon {
    font-size: 32px;
  }

  .ex-record-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .ex-record-title {
    font-size: 15px;
    color: #333;
    font-weight: 600;
  }

  .ex-record-desc {
    font-size: 13px;
    color: #888;
  }

  .ex-record-calorie {
    font-size: 15px;
    color: #1976d2;
    font-weight: 600;
  }

  .ex-add-btn {
    width: 100%;
    height: 38px;
    background: linear-gradient(to right, #64b5f6, #42a5f5);
    border-radius: 8px;
    color: #fff;
    font-size: 16px;
    border: none;
    margin-top: 8px;
    font-weight: 600;
  }

  .ex-popup-mask {
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

  .ex-popup-content {
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

  .ex-popup-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 14px;
    text-align: center;
  }

  .ex-type-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 14px;
    max-height: 220px;
    overflow-y: auto;
  }

  .ex-type-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    background: #f7f7fa;
    border: 2px solid transparent;
    cursor: pointer;
  }

  .ex-type-item.active {
    background: #e3f2fd;
    border-color: #2196f3;
  }

  .ex-type-icon {
    font-size: 22px;
  }

  .ex-type-name {
    font-size: 15px;
    color: #333;
  }

  .ex-type-item.active .ex-type-name {
    color: #1976d2;
    font-weight: 600;
  }

  .ex-popup-input {
    min-height: 40px;
    border-radius: 8px;
    border: 1px solid #e3f2fd;
    padding: 10px;
    font-size: 15px;
    margin-bottom: 12px;
    background: #f7f7fa;
    color: #333;
  }

  .ex-custom-hint {
    font-size: 12px;
    color: #888;
    margin-bottom: 12px;
    text-align: center;
    display: block;
  }

  .ex-popup-btn-row {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
  }

  .ex-popup-btn {
    flex: 1;
    text-align: center;
    padding: 10px 0;
    font-size: 16px;
    border-radius: 8px;
    background: #f0f0f0;
    margin: 0 6px;
    cursor: pointer;
  }

  .ex-popup-btn.confirm {
    background: #2196f3;
    color: #fff;
    font-weight: 600;
  }
</style>