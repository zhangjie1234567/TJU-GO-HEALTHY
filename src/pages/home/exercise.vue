<template>
  <view class="ex-bg">
    <view class="ex-summary-card">
      <view class="ex-summary-info">
        <view class="ex-row">
          <text>今日已消耗</text>
          <text class="ex-num">{{ todayCalorie }}</text><text class="ex-unit">大卡</text>
        </view>
        <view class="ex-row">
          <text>运动目标</text>
          <text class="ex-num ex-goal">{{ exerciseGoal }}</text><text class="ex-unit">大卡</text>
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
  </view>
</template>

<script setup>
  import {
    ref,
    computed,
    onMounted
  } from 'vue'
  const todayCalorie = ref(0)
  const exerciseGoal = ref(500)
  const records = ref([])
  const showAdd = ref(false)
  const addDuration = ref('')
  const selectedType = ref(0)
  const customName = ref('')

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

  function loadExercise() {
    try {
      const d = JSON.parse(uni.getStorageSync('exerciseRecords') || '{}')
      const today = new Date().toLocaleDateString()
      records.value = d[today] || []
      todayCalorie.value = records.value.reduce((sum, r) => sum + Number(r.calorie), 0)
      if (d.goal) exerciseGoal.value = d.goal
    } catch {}
  }
  onMounted(loadExercise)

  function saveExercise() {
    const today = new Date().toLocaleDateString()
    let d = {}
    try {
      d = JSON.parse(uni.getStorageSync('exerciseRecords') || '{}')
    } catch {}
    d[today] = records.value
    d.goal = exerciseGoal.value
    uni.setStorageSync('exerciseRecords', JSON.stringify(d))
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
    records.value.push({
      id: Date.now(),
      icon: type.icon,
      name,
      duration,
      calorie
    })
    todayCalorie.value += calorie
    saveExercise()
    showAdd.value = false
    addDuration.value = ''
    customName.value = ''
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