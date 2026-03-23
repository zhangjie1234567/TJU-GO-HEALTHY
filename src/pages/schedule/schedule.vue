<template>
  <view class="container">
    <view class="hero">
      <text class="hero-title">TJUer 今天也要稳稳向前~</text>
      <text class="hero-subtitle">任务打卡 · 校园跑步 · 专注训练 · 健康成长</text>
    </view>

    <view class="task-card card">
      <view class="card-header">
        <text class="card-title">📋 每日打卡任务</text>
        <text class="add-btn" @click="showAddTaskModal = true">+ 添加</text>
      </view>

      <view class="punch-stats">
        <view class="stat-item">
          <text class="stat-num">{{ completedCount }}/{{ tasks.length }}</text>
          <text class="stat-label">已完成</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ punchTodayCount }}</text>
          <text class="stat-label">今日打卡</text>
        </view>
      </view>

      <view class="task-list">
        <view class="task-row" v-for="(task, index) in tasks" :key="index">
          <view class="task-left">
            <view class="checkbox" :class="{ checked: task.done }" @click="toggleTask(index)">
              <text v-if="task.done" class="check-mark">✔</text>
            </view>
            <view class="task-info">
              <text class="task-name" :class="{ completed: task.done }">{{ task.name }}</text>
              <text class="task-time" v-if="task.punchTime">{{ task.punchTime }}</text>
            </view>
          </view>
          <view class="task-actions">
            <text class="punch-btn" @click="punchTask(index)" v-if="!task.punchedToday">打卡</text>
            <text class="punch-btn cancel-punch" @click="cancelPunch(index)" v-else>✓已打卡</text>
            <text class="edit-btn" @click="editTask(index)">编辑</text>
            <text class="delete-btn" @click="deleteTask(index)">删除</text>
          </view>
        </view>
      </view>

      <view class="empty-state" v-if="tasks.length === 0">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无任务，点击上方"+ 添加"创建任务</text>
      </view>
    </view>

    <view class="run-card card">
      <view class="card-header">
        <text class="card-title">🏃 跑步记录</text>
      </view>

      <view class="pace-selector">
        <view
          v-for="item in paceModes"
          :key="item.value"
          class="pace-chip"
          :class="{ active: runMode === item.value }"
          @click="setRunMode(item.value)"
        >
          {{ item.label }}
        </view>
      </view>
      <view class="run-stats">
        <view class="run-stat">
          <text class="run-value">{{ runTimeText }}</text>
        </view>
      </view>

      <view class="run-actions">
        <button class="run-btn primary" @click="toggleRunning">{{ isRunning ? '暂停跑步' : '开始跑步' }}</button>
        <button class="run-btn" @click="saveRunRecord">保存记录</button>
        <button class="run-btn danger" @click="resetRun">重置</button>
      </view>

      <view class="history-box" v-if="runHistory.length">
        <text class="history-title">最近跑步</text>
        <text class="history-item" v-for="(item, idx) in runHistory" :key="`run-history-${idx}`">
          {{ item.time }} · {{ item.mode }} · {{ item.duration }}
        </text>
      </view>
    </view>

    <view class="focus-card card">
      <view class="card-header">
        <text class="card-title">⏱ 专注计划</text>
      </view>

      <view class="focus-badges">
        <text class="focus-badge">专注 {{ focusMinutes }}m</text>
        <text class="focus-badge">休息 {{ breakMinutes }}m</text>
        <text class="focus-badge">{{ focusRounds }} 轮</text>
      </view>

      <view class="focus-settings-box">
        <view class="focus-setting-item">
          <view class="focus-config-row">
            <text class="config-label">专注时长</text>
            <text class="config-value">{{ focusMinutes }} 分钟</text>
          </view>
          <slider :value="focusMinutes" :min="15" :max="90" :step="5" show-value @change="onFocusMinutesChange" activeColor="#ef6c57" />
        </view>

        <view class="focus-setting-item">
          <view class="focus-config-row">
            <text class="config-label">休息时长</text>
            <text class="config-value">{{ breakMinutes }} 分钟</text>
          </view>
          <slider :value="breakMinutes" :min="3" :max="20" :step="1" show-value @change="onBreakMinutesChange" activeColor="#ef6c57" />
        </view>

        <view class="focus-setting-item">
          <view class="focus-config-row">
            <text class="config-label">轮数</text>
            <text class="config-value">{{ focusRounds }} 轮</text>
          </view>
          <slider :value="focusRounds" :min="1" :max="6" :step="1" show-value @change="onFocusRoundsChange" activeColor="#ef6c57" />
        </view>
      </view>

      <view class="focus-timer-box">
        <view class="focus-timer-ring">
          <text class="focus-phase">{{ focusPhaseLabel }}</text>
          <text class="focus-timer">{{ focusRemainingText }}</text>
          <text class="focus-progress">第 {{ currentRound }}/{{ focusRounds }} 轮</text>
        </view>
      </view>

      <view class="focus-actions">
        <button class="focus-btn primary" @click="startOrResumeFocus">{{ focusRunning ? '继续' : '开始' }}</button>
        <button class="focus-btn" @click="pauseFocus" :disabled="!focusRunning">暂停</button>
        <button class="focus-btn danger" @click="resetFocus">重置</button>
      </view>
    </view>

    <view class="info-card card">
      <view class="card-header">
        <text class="card-title">💡 健康小知识</text>
      </view>
      <swiper class="info-swiper" vertical autoplay circular :interval="3200">
        <swiper-item v-for="(item, index) in healthTips" :key="index">
          <view class="info-content">{{ item }}</view>
        </swiper-item>
      </swiper>
    </view>

    <view class="game-card" @click="goToGames">
      <view class="game-bg">
        <view class="game-header">🎮 运动游戏</view>
        <view class="game-figure">🏃</view>
      </view>
      <view class="game-content">
        <view class="game-icons">
          <view class="game-icon-item">🏋️</view>
          <view class="game-icon-item">🧘</view>
          <view class="game-icon-item">🥊</view>
        </view>
        <view class="game-desc">智能深蹲 · 平衡挑战 · 拳击训练</view>
      </view>
    </view>

    <view style="height: 100rpx;"></view>

    <view v-if="showAddTaskModal" class="modal-overlay" @click="showAddTaskModal = false">
      <view class="modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingIndex !== null ? '编辑任务' : '添加任务' }}</text>
          <text class="close-btn" @click="showAddTaskModal = false">✕</text>
        </view>
        <view class="modal-body">
          <input v-model="newTaskName" class="modal-input" placeholder="请输入任务名称" maxlength="20" />
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="showAddTaskModal = false">取消</button>
          <button class="confirm-btn" @click="confirmAddTask">{{ editingIndex !== null ? '更新' : '添加' }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getDailyData, saveDailyData } from '../my/my-store'

const tasks = ref([])
const showAddTaskModal = ref(false)
const newTaskName = ref('')
const editingIndex = ref(null)

const healthTips = ref([
  '💧 成年人建议每天喝1500-2000毫升温水，少量多次饮用。',
  '🍽️ 饭后30分钟不要剧烈运动，静坐休息有助消化。',
  '😴 每天保持7-8小时充足睡眠，有助于新陈代谢。',
  '🥗 早餐要吃好，午餐要吃饱，晚餐要吃少，均衡最重要。',
  '🏃 每周至少进行150分钟有氧运动，增强心肺功能。',
  '💪 循序渐进锻炼，避免过度运动，科学健身更可持续。'
])

const paceModes = [
  { label: '轻松跑', value: 'easy', meterPerSecond: 2.1 },
  { label: '正常跑', value: 'normal', meterPerSecond: 2.8 },
  { label: '节奏跑', value: 'tempo', meterPerSecond: 3.4 }
]

const musicPresets = [
  { label: '轻松跑 150', value: 'easy', bpm: 150 },
  { label: '正常跑 165', value: 'normal', bpm: 165 },
  { label: '节奏跑 180', value: 'tempo', bpm: 180 }
]

const localMusicTracks = {
  easy: { name: '轻松跑配乐', src: '/static/music/run_calm.mp3' },
  normal: { name: '正常跑配乐', src: '/static/music/run_steady.mp3' },
  tempo: { name: '节奏跑配乐', src: '/static/music/run_rush.mp3' }
}

const runMode = ref('normal')
const runMetricMode = ref('estimated')
const cadenceSpm = ref(170)
const strideLengthM = ref(0.95)
const musicPreset = ref('normal')
const musicEnabled = ref(true)
const musicPlaying = ref(false)
const voiceBroadcastEnabled = ref(false)
const realStepCount = ref(0)
const realTrackingSupported = ref(false)
const realTrackingActive = ref(false)
const instantSpeedMps = ref(0)
const isRunning = ref(false)
const runSeconds = ref(0)
const runSyncedSeconds = ref(0)
const runDistance = ref(0)
const runHistory = ref([])
const lastAnnouncedKm = ref(0)
const preferredSpeechVoice = ref(null)
const voiceResolverBound = ref(false)
let runTimer = null
let audioPlayer = null
let geoWatchId = null
let motionHandler = null
let lastGeoPoint = null
let lastStepTimestamp = 0
const recentStepTimestamps = []

const focusMinutes = ref(40)
const breakMinutes = ref(8)
const focusRounds = ref(3)
const focusRunning = ref(false)
const focusPhase = ref('focus')
const focusRemaining = ref(40 * 60)
const currentRound = ref(1)
const focusElapsedSeconds = ref(0)
const focusSyncedSeconds = ref(0)
let focusTimer = null

const completedCount = computed(() => tasks.value.filter(t => t.done).length)
const punchTodayCount = computed(() => tasks.value.filter(t => t.punchedToday).length)

const runModeDescription = computed(() => {
  if (runMode.value === 'easy') return '轻松跑: 更省力，适合热身和恢复'
  if (runMode.value === 'tempo') return '节奏跑: 更高强度，适合提速训练'
  return '正常跑: 日常训练，速度与耐力平衡'
})

const selectedBpm = computed(() => {
  const selected = musicPresets.find(item => item.value === musicPreset.value)
  return selected ? selected.bpm : 165
})

const currentTrackLabel = computed(() => {
  const track = localMusicTracks[musicPreset.value]
  if (!track) return '未设置'
  return `${track.name} (${selectedBpm.value} BPM)`
})

const runTimeText = computed(() => formatDuration(runSeconds.value))

const focusPhaseLabel = computed(() => {
  if (focusPhase.value === 'focus') return '专注中'
  if (focusPhase.value === 'break') return '休息中'
  return '已完成'
})

const focusRemainingText = computed(() => formatDuration(focusRemaining.value))

onMounted(() => {
  loadTasks()
  const savedRunHistory = uni.getStorageSync('run_history')
  runHistory.value = Array.isArray(savedRunHistory) ? savedRunHistory : []
  musicPreset.value = runMode.value
})

onUnmounted(() => {
  syncRunDurationToSummary(false)
  syncFocusDurationToSummary(false)
  stopRunTimer()
  stopMusicPlayback()
  destroyAudioPlayer()
  stopFocusTimer()
})

const loadTasks = () => {
  try {
    const saved = uni.getStorageSync('schedule_tasks')
    if (saved) {
      tasks.value = saved
      return
    }

    tasks.value = [
      { name: '晨间拉伸 10 分钟', done: true, punchedToday: true, punchTime: '07:20' },
      { name: '晚上散步 20 分钟', done: false, punchedToday: false, punchTime: '' },
      { name: '睡前不刷短视频', done: false, punchedToday: false, punchTime: '' }
    ]
  } catch (e) {
    console.error('加载任务失败', e)
  }
}

const saveTasks = () => {
  uni.setStorageSync('schedule_tasks', tasks.value)
}

const toggleTask = (index) => {
  tasks.value[index].done = !tasks.value[index].done
  if (tasks.value[index].done) {
    tasks.value[index].punchedToday = true
    tasks.value[index].punchTime = getCurrentTime()
  } else {
    tasks.value[index].punchedToday = false
    tasks.value[index].punchTime = ''
  }
  saveTasks()
}

const punchTask = (index) => {
  tasks.value[index].punchedToday = true
  tasks.value[index].done = true
  tasks.value[index].punchTime = getCurrentTime()
  uni.showToast({ title: '打卡成功！', icon: 'success' })
  saveTasks()
}

const cancelPunch = (index) => {
  uni.showModal({
    title: '取消打卡',
    content: '确定要取消本次打卡吗？',
    success: (res) => {
      if (!res.confirm) return
      tasks.value[index].punchedToday = false
      tasks.value[index].done = false
      tasks.value[index].punchTime = ''
      saveTasks()
    }
  })
}

const editTask = (index) => {
  editingIndex.value = index
  newTaskName.value = tasks.value[index].name
  showAddTaskModal.value = true
}

const deleteTask = (index) => {
  uni.showModal({
    title: '删除任务',
    content: '确定要删除此任务吗？',
    success: (res) => {
      if (!res.confirm) return
      tasks.value.splice(index, 1)
      saveTasks()
      uni.showToast({ title: '删除成功', icon: 'success' })
    }
  })
}

const confirmAddTask = () => {
  if (!newTaskName.value.trim()) {
    uni.showToast({ title: '请输入任务名称', icon: 'none' })
    return
  }

  if (editingIndex.value !== null) {
    tasks.value[editingIndex.value].name = newTaskName.value.trim()
    editingIndex.value = null
  } else {
    tasks.value.push({
      name: newTaskName.value.trim(),
      done: false,
      punchedToday: false,
      punchTime: ''
    })
  }

  saveTasks()
  showAddTaskModal.value = false
  newTaskName.value = ''
}

const setRunMode = (mode) => {
  runMode.value = mode
  musicPreset.value = mode
  if (isRunning.value && musicEnabled.value) {
    syncMusicTrack(true)
  }
}

const ensureAudioPlayer = () => {
  if (audioPlayer) return true
  if (typeof uni.createInnerAudioContext !== 'function') {
    uni.showToast({ title: '当前环境不支持音频', icon: 'none' })
    return false
  }

  audioPlayer = uni.createInnerAudioContext()
  audioPlayer.loop = true
  audioPlayer.autoplay = false

  audioPlayer.onPlay(() => {
    musicPlaying.value = true
  })
  audioPlayer.onPause(() => {
    musicPlaying.value = false
  })
  audioPlayer.onStop(() => {
    musicPlaying.value = false
  })
  audioPlayer.onEnded(() => {
    musicPlaying.value = false
    // Some runtimes may not honor loop reliably; restart playback as a fallback.
    if (isRunning.value && musicEnabled.value) {
      audioPlayer.play()
    }
  })
  audioPlayer.onError(() => {
    musicPlaying.value = false
    uni.showToast({ title: '配乐文件不存在', icon: 'none' })
  })

  return true
}

const syncMusicTrack = (autoPlay = false) => {
  if (!musicEnabled.value) return
  if (!ensureAudioPlayer()) return

  const track = localMusicTracks[musicPreset.value]
  if (!track) return

  if (audioPlayer.src !== track.src) {
    audioPlayer.src = track.src
  }

  if (autoPlay) {
    audioPlayer.play()
  }
}

const stopMusicPlayback = () => {
  if (!audioPlayer) return
  audioPlayer.pause()
  musicPlaying.value = false
}

const destroyAudioPlayer = () => {
  if (!audioPlayer) return
  audioPlayer.destroy()
  audioPlayer = null
}

const toggleRunning = () => {
  if (isRunning.value) {
    syncRunDurationToSummary(false)
    stopRunTimer()
    stopMusicPlayback()
    isRunning.value = false
    return
  }

  isRunning.value = true
  musicPreset.value = runMode.value
  syncMusicTrack(true)
  runTimer = setInterval(() => {
    runSeconds.value += 1
  }, 1000)
}

const stopRunTimer = () => {
  if (!runTimer) return
  clearInterval(runTimer)
  runTimer = null
}

const addDailyMetricValue = (metricType, addValue) => {
  const value = Number(addValue)
  if (!Number.isFinite(value) || value <= 0) return

  try {
    const data = getDailyData()
    const today = new Date().toISOString().split('T')[0]
    let todayRecord = data.find(d => d.date === today)

    if (!todayRecord) {
      todayRecord = { date: today, metrics: {} }
      data.push(todayRecord)
    }

    const current = Number(todayRecord.metrics?.[metricType]) || 0
    todayRecord.metrics[metricType] = Number((current + value).toFixed(2))
    saveDailyData(data)
  } catch (error) {
    console.error('写入数据小结失败', error)
  }
}

const syncRunDurationToSummary = (force = false) => {
  const deltaSeconds = runSeconds.value - runSyncedSeconds.value
  if (deltaSeconds <= 0) return false
  if (!force && deltaSeconds < 20) return false

  addDailyMetricValue('runMinutes', deltaSeconds / 60)
  runSyncedSeconds.value = runSeconds.value
  return true
}

const syncFocusDurationToSummary = (force = false) => {
  const deltaSeconds = focusElapsedSeconds.value - focusSyncedSeconds.value
  if (deltaSeconds <= 0) return false
  if (!force && deltaSeconds < 60) return false

  addDailyMetricValue('focus', deltaSeconds / 3600)
  focusSyncedSeconds.value = focusElapsedSeconds.value
  return true
}

const saveRunRecord = () => {
  if (runSeconds.value < 20) {
    uni.showToast({ title: '跑步时间太短，先多跑一会儿', icon: 'none' })
    return
  }

  const record = {
    time: new Date().toLocaleString(),
    mode: paceModes.find(item => item.value === runMode.value)?.label || '正常跑',
    duration: runTimeText.value,
    bpm: selectedBpm.value
  }
  runHistory.value = [record, ...runHistory.value].slice(0, 5)
  uni.setStorageSync('run_history', runHistory.value)
  syncRunDurationToSummary(true)
  uni.showToast({ title: '已保存跑步记录', icon: 'success' })
}

const resetRun = () => {
  syncRunDurationToSummary(false)
  stopRunTimer()
  stopMusicPlayback()
  isRunning.value = false
  runSeconds.value = 0
  runSyncedSeconds.value = 0
}

const onFocusMinutesChange = (e) => {
  focusMinutes.value = Number(e.detail.value)
  if (!focusRunning.value && focusPhase.value !== 'break') {
    focusRemaining.value = focusMinutes.value * 60
  }
}

const onBreakMinutesChange = (e) => {
  breakMinutes.value = Number(e.detail.value)
}

const onFocusRoundsChange = (e) => {
  focusRounds.value = Number(e.detail.value)
}

const startOrResumeFocus = () => {
  if (focusPhase.value === 'done') {
    resetFocus()
  }

  if (focusTimer) {
    clearInterval(focusTimer)
  }

  focusRunning.value = true
  focusTimer = setInterval(() => {
    if (focusRemaining.value > 0) {
      if (focusPhase.value === 'focus') {
        focusElapsedSeconds.value += 1
      }
      focusRemaining.value -= 1
      return
    }

    if (focusPhase.value === 'focus') {
      focusPhase.value = 'break'
      focusRemaining.value = breakMinutes.value * 60
      return
    }

    if (currentRound.value >= focusRounds.value) {
      focusPhase.value = 'done'
      focusRunning.value = false
      stopFocusTimer()
      syncFocusDurationToSummary(true)
      uni.showToast({ title: '专注计划完成', icon: 'success' })
      return
    }

    currentRound.value += 1
    focusPhase.value = 'focus'
    focusRemaining.value = focusMinutes.value * 60
  }, 1000)
}

const pauseFocus = () => {
  syncFocusDurationToSummary(false)
  focusRunning.value = false
  stopFocusTimer()
}

const resetFocus = () => {
  syncFocusDurationToSummary(false)
  focusRunning.value = false
  focusPhase.value = 'focus'
  currentRound.value = 1
  focusRemaining.value = focusMinutes.value * 60
  focusElapsedSeconds.value = 0
  focusSyncedSeconds.value = 0
  stopFocusTimer()
}

const stopFocusTimer = () => {
  if (!focusTimer) return
  clearInterval(focusTimer)
  focusTimer = null
}

const getCurrentTime = () => {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const formatMmSs = (totalSeconds) => {
  const mm = Math.floor(totalSeconds / 60)
  const ss = Math.floor(totalSeconds % 60)
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

const goToGames = () => {
  uni.navigateTo({ url: '/pages/schedule/games' })
}
</script>

<style lang="scss" scoped>
$main-blue: #3f8cff;
$light-blue: #9cc5ff;
$text-title: #24324a;

.container {
  background: linear-gradient(135deg, #E3F2FD 0%, #F0F9FF 100%);
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
}

.hero {
  margin-bottom: 22rpx;

  .hero-title {
    display: block;
    font-size: 38rpx;
    font-weight: 700;
    color: #2c3e55;
  }

  .hero-subtitle {
    display: block;
    margin-top: 8rpx;
    font-size: 24rpx;
    color: #5f7392;
  }
}

.card {
  background: white;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 22rpx;
  box-shadow: 0 4rpx 16rpx rgba(79, 161, 242, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-title;
}

.hint-text {
  font-size: 22rpx;
  color: #7b92b4;
}

.add-btn {
  background: $main-blue;
  color: white;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 600;
}

.punch-stats {
  display: flex;
  gap: 16rpx;
  margin-bottom: 18rpx;

  .stat-item {
    flex: 1;
    text-align: center;
    background: #f2f7ff;
    border-radius: 14rpx;
    padding: 16rpx 10rpx;

    .stat-num {
      display: block;
      font-size: 34rpx;
      color: $main-blue;
      font-weight: 700;
      margin-bottom: 6rpx;
    }

    .stat-label {
      font-size: 23rpx;
      color: #70809d;
    }
  }
}

.task-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #edf3ff;

  &:last-child {
    border-bottom: none;
  }
}

.task-left {
  display: flex;
  align-items: center;
  gap: 14rpx;
  flex: 1;
}

.checkbox {
  width: 42rpx;
  height: 42rpx;
  border-radius: 50%;
  border: 2rpx solid $light-blue;
  display: flex;
  align-items: center;
  justify-content: center;

  &.checked {
    background: $main-blue;
    border-color: $main-blue;
  }
}

.check-mark {
  color: #fff;
  font-size: 22rpx;
  font-weight: 700;
}

.task-info {
  display: flex;
  flex-direction: column;
}

.task-name {
  font-size: 27rpx;
  color: $text-title;

  &.completed {
    color: #95a2bc;
    text-decoration: line-through;
  }
}

.task-time {
  font-size: 20rpx;
  color: #5a9cff;
}

.task-actions {
  display: flex;
  gap: 10rpx;
}

.punch-btn,
.edit-btn,
.delete-btn {
  font-size: 20rpx;
  padding: 8rpx 12rpx;
  border-radius: 12rpx;
}

.punch-btn {
  background: $main-blue;
  color: #fff;

  &.cancel-punch {
    background: #eaf8ec;
    color: #43a35f;
  }
}

.edit-btn {
  background: #fff3dd;
  color: #d2821f;
}

.delete-btn {
  background: #ffe9e9;
  color: #d85858;
}

.empty-state {
  text-align: center;
  padding: 44rpx 20rpx;

  .empty-icon {
    display: block;
    font-size: 70rpx;
    margin-bottom: 12rpx;
  }

  .empty-text {
    font-size: 24rpx;
    color: #8b98b0;
  }
}

.pace-selector {
  display: flex;
  gap: 10rpx;
  margin-bottom: 14rpx;
}

.mode-desc {
  display: block;
  font-size: 22rpx;
  color: #5b7396;
  margin-bottom: 10rpx;
}

.run-indicator-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.run-indicator {
  font-size: 22rpx;
  color: #4f6f97;
  font-weight: 600;
}

.run-config-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8rpx;
}

.music-title {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #445670;
}

.music-selector {
  display: flex;
  gap: 10rpx;
  margin-top: 10rpx;
  margin-bottom: 8rpx;
}

.music-status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6rpx;
}

.voice-status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6rpx;
}

.metric-mode-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6rpx;
  margin-bottom: 4rpx;
}

.voice-actions {
  display: flex;
  gap: 14rpx;
}

.music-status {
  font-size: 22rpx;
  color: #5f7595;
}

.music-action {
  font-size: 22rpx;
  color: #3f8cff;
  font-weight: 700;
}

.mode-active {
  color: #1f5ca8;
  text-decoration: underline;
}

.music-tip {
  display: block;
  margin-top: 4rpx;
  margin-bottom: 6rpx;
  font-size: 20rpx;
  color: #8ca0bd;
}

.music-chip {
  flex: 1;
  text-align: center;
  font-size: 22rpx;
  padding: 10rpx;
  border-radius: 999rpx;
  background: #f3f7ff;
  border: 2rpx solid #d9e8ff;
  color: #667ea0;

  &.active {
    background: linear-gradient(120deg, #4FA1F2, #80D0FF);
    color: #fff;
    border-color: transparent;
  }
}

.run-formula {
  display: block;
  font-size: 21rpx;
  color: #7d8fa9;
  margin-bottom: 10rpx;
}

.pace-chip {
  flex: 1;
  text-align: center;
  padding: 10rpx;
  border-radius: 999rpx;
  background: #f3f7ff;
  color: #6d7ea0;
  font-size: 22rpx;
  border: 2rpx solid #d9e8ff;

  &.active {
    background: linear-gradient(120deg, #4FA1F2, #80D0FF);
    color: #fff;
    border-color: transparent;
  }
}

.run-stats {
  display: flex;
  justify-content: center;
  margin: 8rpx 0 18rpx;
}

.run-stat {
  width: 360rpx;
  max-width: 100%;
  background: linear-gradient(145deg, #f8fcff, #edf5ff);
  border: 2rpx solid #e0ecff;
  border-radius: 22rpx;
  box-shadow: 0 10rpx 26rpx rgba(79, 161, 242, 0.12);
  text-align: center;
  padding: 30rpx 18rpx;
}

.run-value {
  display: block;
  font-size: 72rpx;
  font-weight: 800;
  letter-spacing: 2rpx;
  color: #29456b;
}

.track-box {
  height: 100rpx;
  display: flex;
  align-items: flex-end;
  gap: 8rpx;
  padding: 10rpx 8rpx;
  border-radius: 12rpx;
  background: linear-gradient(180deg, #ebf4ff, #f7fbff);
  margin-bottom: 14rpx;
}

.track-line {
  flex: 1;
  border-radius: 8rpx 8rpx 0 0;
  background: linear-gradient(180deg, #4FA1F2, #80D0FF);
  transition: height 0.35s ease;
}

.run-actions,
.focus-actions {
  display: flex;
  gap: 10rpx;
}

.run-btn {
  flex: 1;
  border-radius: 16rpx;
  height: 84rpx;
  line-height: 84rpx;
  font-size: 24rpx;
  font-weight: 700;
  border: none;
  background: #e8f1ff;
  color: #2e517c;
  box-shadow: 0 6rpx 16rpx rgba(79, 161, 242, 0.1);

  &.primary {
    background: linear-gradient(120deg, #4FA1F2, #80D0FF);
    color: #fff;
  }

  &.danger {
    background: #ffe7e7;
    color: #ba5454;
  }
}

.history-box {
  margin-top: 14rpx;
  border-top: 1rpx dashed #d7e4f7;
  padding-top: 12rpx;
}

.history-title {
  display: block;
  font-size: 24rpx;
  color: #4f6282;
  margin-bottom: 8rpx;
}

.history-item {
  display: block;
  font-size: 21rpx;
  color: #7386a5;
  margin-bottom: 6rpx;
}

.focus-card {
  background: linear-gradient(165deg, #ffffff 0%, #f8fbff 100%);
}

.focus-badges {
  display: flex;
  gap: 10rpx;
  margin-bottom: 14rpx;
}

.focus-badge {
  flex: 1;
  text-align: center;
  padding: 8rpx 10rpx;
  border-radius: 999rpx;
  background: #fff3ef;
  border: 2rpx solid #ffd8cd;
  color: #d06a52;
  font-size: 21rpx;
  font-weight: 700;
}

.focus-settings-box {
  border-radius: 18rpx;
  background: #f6f9ff;
  border: 2rpx solid #e6eeff;
  padding: 10rpx 14rpx;
  margin-bottom: 14rpx;
}

.focus-setting-item {
  padding: 10rpx 0;
  border-bottom: 1rpx dashed #dbe8ff;

  &:last-child {
    border-bottom: none;
  }
}

.focus-config-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rpx;
  margin-bottom: 6rpx;
}

.config-label {
  font-size: 24rpx;
  color: #445670;
}

.config-value {
  font-size: 24rpx;
  color: #1c3a61;
  font-weight: 700;
}

.focus-timer-box {
  margin: 12rpx 0 18rpx;
  padding: 6rpx;
  display: flex;
  justify-content: center;
}

.focus-timer-ring {
  width: 320rpx;
  height: 320rpx;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 25%, #ffffff 0%, #f0f6ff 68%, #e6f1ff 100%);
  border: 10rpx solid #d7e9ff;
  box-shadow: inset 0 0 0 6rpx #edf5ff, 0 10rpx 24rpx rgba(90, 140, 205, 0.14);
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.focus-phase {
  display: block;
  font-size: 24rpx;
  color: #56739a;
  letter-spacing: 1rpx;
}

.focus-timer {
  display: block;
  font-size: 62rpx;
  font-weight: 800;
  color: #2f6fcc;
  margin: 8rpx 0;
  letter-spacing: 2rpx;
}

.focus-progress {
  font-size: 23rpx;
  color: #6d85a7;
}

.focus-btn {
  flex: 1;
  border-radius: 16rpx;
  height: 82rpx;
  line-height: 82rpx;
  font-size: 24rpx;
  font-weight: 700;
  border: none;
  background: #edf3ff;
  color: #385f8b;
  box-shadow: 0 8rpx 16rpx rgba(86, 134, 204, 0.1);

  &.primary {
    background: linear-gradient(120deg, #ff8b76, #ffae7d);
    color: #fff;
  }

  &.danger {
    background: #ffe9e9;
    color: #bf5757;
  }
}

.info-swiper {
  height: 156rpx;
}

.info-content {
  padding: 24rpx;
  background: #f5faff;
  border-radius: 16rpx;
  font-size: 26rpx;
  color: #2f4668;
  line-height: 1.7;
  border-left: 6rpx solid #3f8cff;
}

.game-card {
  border-radius: 24rpx;
  overflow: hidden;
  background: white;
  box-shadow: 0 6rpx 20rpx rgba(79, 161, 242, 0.12);
  margin-bottom: 24rpx;
  transition: all 0.3s ease;

  &:active {
    transform: translateY(-4rpx);
    box-shadow: 0 12rpx 28rpx rgba(79, 161, 242, 0.16);
  }

  .game-bg {
    position: relative;
    padding: 24rpx;
    background: linear-gradient(135deg, #FF6B6B 0%, rgba(255, 255, 255, 0.5) 100%);
    color: #fff;
    min-height: 112rpx;
    overflow: hidden;
  }

  .game-header {
    font-size: 32rpx;
    font-weight: 700;
  }

  .game-figure {
    font-size: 100rpx;
    opacity: 0.38;
    position: absolute;
    right: -10rpx;
    bottom: -30rpx;
  }

  .game-content {
    padding: 20rpx 24rpx;
  }

  .game-icons {
    display: flex;
    justify-content: center;
    gap: 20rpx;
    margin-bottom: 10rpx;
  }

  .game-icon-item {
    font-size: 46rpx;
    animation: bounce 2s ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }

  .game-desc {
    text-align: center;
    font-size: 26rpx;
    color: #666;
    font-weight: 600;
    letter-spacing: 2rpx;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-12rpx);
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
  z-index: 999;
}

.modal {
  width: 100%;
  background: #fff;
  border-radius: 30rpx 30rpx 0 0;
  padding: 30rpx;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-title;
}

.close-btn {
  font-size: 28rpx;
  color: #8590a6;
}

.modal-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #cfe1ff;
  border-radius: 12rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
  margin-bottom: 20rpx;
}

.modal-footer {
  display: flex;
  gap: 14rpx;

  .cancel-btn,
  .confirm-btn {
    flex: 1;
    height: 78rpx;
    border-radius: 12rpx;
    font-size: 27rpx;
    border: none;
  }

  .cancel-btn {
    background: #eef1f6;
    color: #6f7b91;
  }

  .confirm-btn {
    background: $main-blue;
    color: #fff;
  }
}
</style>