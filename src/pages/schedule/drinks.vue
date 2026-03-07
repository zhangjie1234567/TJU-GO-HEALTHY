<template>
  <view class="container">
    <view class="hero">
      <text class="hero-title">专注续航助手</text>
      <text class="hero-subtitle">不查数据也能给你可执行的学习续航方案</text>
    </view>

    <view class="panel">
      <view class="field">
        <text class="label">你现在的精神状态</text>
        <view class="chip-row">
          <view
            v-for="item in energyOptions"
            :key="item.value"
            class="chip"
            :class="{ active: energyLevel === item.value }"
            @click="energyLevel = item.value"
          >
            {{ item.label }}
          </view>
        </view>
      </view>

      <view class="field">
        <view class="row-between">
          <text class="label">预计还要学习</text>
          <text class="value">{{ studyHours }} 小时</text>
        </view>
        <slider
          :value="studyHours"
          :min="1"
          :max="6"
          :step="1"
          show-value
          activeColor="#ff7f50"
          @change="onHourChange"
        />
      </view>

      <view class="field">
        <view class="row-between">
          <text class="label">预算</text>
          <text class="value">{{ budget }} 元</text>
        </view>
        <slider
          :value="budget"
          :min="5"
          :max="35"
          :step="1"
          show-value
          activeColor="#ff7f50"
          @change="onBudgetChange"
        />
      </view>

      <view class="switch-row">
        <text class="label">今晚容易失眠</text>
        <switch :checked="sleepSensitive" color="#ff7f50" @change="onSleepSensitiveChange" />
      </view>

      <view class="switch-row">
        <text class="label">接受咖啡因</text>
        <switch :checked="allowCaffeine" color="#ff7f50" @change="onCaffeineChange" />
      </view>
    </view>

    <view class="result-panel">
      <view class="result-header">
        <text class="result-title">智能方案</text>
        <text class="result-score">续航指数 {{ staminaScore }}/100</text>
      </view>

      <view class="plan-card" v-for="plan in plans" :key="plan.id">
        <view class="plan-top">
          <text class="plan-name">{{ plan.title }}</text>
          <text class="plan-tag">{{ plan.tag }}</text>
        </view>
        <text class="plan-reason">{{ plan.reason }}</text>
        <text class="plan-step" v-for="(step, i) in plan.steps" :key="`${plan.id}-${i}`">{{ i + 1 }}. {{ step }}</text>
      </view>

      <view class="timeline">
        <text class="timeline-title">接下来 {{ studyHours }} 小时行动线</text>
        <text class="timeline-item" v-for="(item, idx) in timeline" :key="`line-${idx}`">{{ item }}</text>
      </view>

      <button class="save-btn" @click="saveCurrentPlan">保存今天方案</button>
    </view>

    <view class="history-panel" v-if="history.length">
      <text class="history-title">最近保存</text>
      <view class="history-item" v-for="(item, idx) in history" :key="`history-${idx}`">
        <text class="history-time">{{ item.time }}</text>
        <text class="history-content">{{ item.summary }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const energyOptions = [
  { label: '困', value: 'low' },
  { label: '一般', value: 'mid' },
  { label: '在线', value: 'high' }
]

const energyLevel = ref('mid')
const studyHours = ref(2)
const budget = ref(15)
const sleepSensitive = ref(false)
const allowCaffeine = ref(true)
const history = ref([])

const staminaScore = computed(() => {
  let score = 70
  if (energyLevel.value === 'low') score -= 20
  if (studyHours.value >= 4) score -= 10
  if (!allowCaffeine.value && energyLevel.value === 'low') score -= 5
  if (sleepSensitive.value && allowCaffeine.value) score -= 8
  if (budget.value >= 18) score += 5
  return Math.max(35, Math.min(98, score))
})

const plans = computed(() => {
  const quickBoost = {
    id: 'boost',
    title: '快速提神方案',
    tag: allowCaffeine.value ? '效率优先' : '无咖替代',
    reason: allowCaffeine.value
      ? '你当前需要短时间拉起专注，优先用少量咖啡因配合补水。'
      : '你不希望使用咖啡因，改用节奏激活和补水拉专注。',
    steps: allowCaffeine.value
      ? [
          '先喝 200ml 温水，避免空腹直接提神。',
          '选择 1 份小杯提神饮品，15 分钟内慢饮。',
          '45 分钟后做 2 分钟拉伸，防止后劲疲劳。'
        ]
      : [
          '先喝 300ml 温水并洗脸，快速激活状态。',
          '做 3 轮 30 秒深呼吸 + 30 秒站立拉伸。',
          '每 40 分钟补 150ml 水，维持清醒。'
        ]
  }

  const stablePlan = {
    id: 'stable',
    title: '稳态续航方案',
    tag: '长时学习',
    reason: `${studyHours.value} 小时学习更看重稳定输出，不靠短刺激。`,
    steps: [
      '按 45/10 番茄节奏学习，休息时离座活动。',
      '预算优先给补水和轻食，避免高糖反噬。',
      '每小时复盘一次进度，防止忙碌但低产出。'
    ]
  }

  const sleepPlan = {
    id: 'sleep',
    title: sleepSensitive.value ? '护眠优先方案' : '晚间收束方案',
    tag: sleepSensitive.value ? '睡眠友好' : '平衡效率',
    reason: sleepSensitive.value
      ? '你标记了易失眠，晚间要降低刺激避免影响明天状态。'
      : '今晚不特别敏感，可以保留适度提神但要控制时间。',
    steps: sleepSensitive.value
      ? [
          '20:00 后不再摄入咖啡因。',
          '改为温热低糖饮品，学习后半段减少兴奋输入。',
          '结束前 20 分钟只做整理任务，帮助大脑降速。'
        ]
      : [
          '咖啡因最晚在睡前 6 小时停止。',
          '后半程切换无糖补水，保持平稳。',
          '学习结束后走动 5 分钟，避免直接刷手机。'
        ]
  }

  if (energyLevel.value === 'low') {
    return [quickBoost, stablePlan, sleepPlan]
  }
  if (energyLevel.value === 'high') {
    return [stablePlan, sleepPlan, quickBoost]
  }
  return [stablePlan, quickBoost, sleepPlan]
})

const timeline = computed(() => {
  const output = []
  for (let i = 0; i < studyHours.value; i += 1) {
    const minute = i * 60
    const focus = `${minute}-${minute + 45} 分钟: 主任务冲刺`
    const rest = `${minute + 45}-${minute + 55} 分钟: 起身活动 + 补水`
    output.push(focus)
    output.push(rest)
  }
  output.push('最后 10 分钟: 收尾复盘 + 明日待办')
  return output
})

const onHourChange = (e) => {
  studyHours.value = Number(e.detail.value)
}

const onBudgetChange = (e) => {
  budget.value = Number(e.detail.value)
}

const onSleepSensitiveChange = (e) => {
  sleepSensitive.value = Boolean(e.detail.value)
}

const onCaffeineChange = (e) => {
  allowCaffeine.value = Boolean(e.detail.value)
}

const saveCurrentPlan = () => {
  const firstPlan = plans.value[0]
  const summary = `${firstPlan.title} | ${studyHours.value}h | 预算${budget.value}元 | 指数${staminaScore.value}`
  const current = {
    time: new Date().toLocaleString(),
    summary
  }
  const next = [current, ...history.value].slice(0, 5)
  history.value = next
  uni.setStorageSync('focus_stamina_history', next)
  uni.showToast({ title: '已保存', icon: 'success' })
}

onMounted(() => {
  const saved = uni.getStorageSync('focus_stamina_history')
  history.value = Array.isArray(saved) ? saved : []
})
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 15% 15%, rgba(255, 127, 80, 0.25), transparent 35%),
    radial-gradient(circle at 85% 20%, rgba(255, 184, 108, 0.22), transparent 40%),
    linear-gradient(165deg, #fff6ee 0%, #ffe0cc 100%);
}

.hero {
  margin-bottom: 20rpx;
}

.hero-title {
  display: block;
  font-size: 46rpx;
  font-weight: 800;
  color: #6d2f11;
}

.hero-subtitle {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #8e4d2c;
}

.panel,
.result-panel,
.history-panel {
  background: rgba(255, 255, 255, 0.88);
  border: 2rpx solid rgba(255, 127, 80, 0.25);
  border-radius: 24rpx;
  padding: 20rpx;
  margin-bottom: 18rpx;
  backdrop-filter: blur(4px);
}

.field {
  margin-bottom: 16rpx;
}

.label {
  font-size: 26rpx;
  color: #5f331f;
  font-weight: 600;
}

.chip-row {
  display: flex;
  gap: 12rpx;
  margin-top: 10rpx;
}

.chip {
  padding: 8rpx 18rpx;
  border-radius: 999rpx;
  background: #fff4ea;
  color: #9a5d39;
  border: 2rpx solid #ffd1b3;
  font-size: 24rpx;
}

.chip.active {
  background: #ff7f50;
  border-color: #ff7f50;
  color: #fff;
}

.row-between,
.switch-row,
.result-header,
.plan-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.value,
.result-score,
.plan-tag {
  font-size: 24rpx;
  color: #9a5d39;
}

.switch-row {
  padding: 10rpx 0;
}

.result-title,
.history-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #6d2f11;
}

.plan-card {
  margin-top: 16rpx;
  padding: 16rpx;
  border-radius: 16rpx;
  background: linear-gradient(150deg, #fff7ef, #ffe8d4);
}

.plan-name {
  font-size: 28rpx;
  font-weight: 700;
  color: #6d2f11;
}

.plan-reason,
.plan-step,
.timeline-item,
.history-content,
.history-time,
.timeline-title {
  display: block;
  font-size: 24rpx;
  color: #7b4a2f;
  line-height: 1.5;
  margin-top: 8rpx;
}

.timeline {
  margin-top: 14rpx;
  padding: 12rpx;
  border-radius: 12rpx;
  background: #fff3e8;
}

.save-btn {
  margin-top: 16rpx;
  background: linear-gradient(120deg, #ff7f50, #ff9855);
  color: #fff;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 700;
}

.history-item {
  margin-top: 10rpx;
  padding: 10rpx 12rpx;
  border-radius: 12rpx;
  background: #fff8f2;
}

@media (max-width: 420px) {
  .hero-title {
    font-size: 40rpx;
  }
}
</style>