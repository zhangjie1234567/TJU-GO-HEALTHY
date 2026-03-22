<template>
  <view class="rw-bg">
    <view class="rw-input-card">
      <text class="rw-label">今日体重</text>
      <input v-model="weightInput" type="number" class="rw-input" placeholder="请输入" />
      <text class="rw-unit">千克</text>
      <button class="rw-btn" @click="saveWeight">保存</button>
    </view>
    <view class="rw-input-card rw-target-card">
      <text class="rw-label">目标体重</text>
      <text class="rw-target-value">{{ targetWeightDisplay }} 千克</text>
      <button class="rw-btn rw-edit-btn" @click="showTargetPopup = true">修改</button>
    </view>
    <view v-if="showTargetPopup" class="rw-popup-mask">
      <view class="rw-popup-content">
        <view class="rw-popup-title">修改目标体重</view>
        <input v-model="targetWeightInput" type="number" class="rw-popup-input" placeholder="请输入目标体重（kg）" />
        <view class="rw-popup-btn-row">
          <button class="rw-popup-btn" @click="showTargetPopup = false">取消</button>
          <button class="rw-popup-btn confirm" @click="confirmTargetWeight">保存</button>
        </view>
      </view>
    </view>
    <view class="rw-compare">
      <text>昨日体重：<text class="rw-compare-num">{{ yesterdayWeightStr }}</text> 千克，今日减重：<text
          class="rw-compare-num">{{ diffWeightStr }}</text> 千克</text>
    </view>
    <view class="rw-history">
      <view class="rw-history-header">
        <text class="rw-history-icon">📈</text>
        <text class="rw-history-title">历史记录</text>
      </view>
      <view v-if="weightList.length === 0" class="rw-empty-tip">
        <text>暂无体重记录，快来记录吧！</text>
      </view>
      <view v-else class="rw-history-list">
        <view v-for="item in weightList" :key="item.date" class="rw-history-item">
          <text class="rw-item-icon">📝</text>
          <text class="rw-item-date">{{ item.date }}</text>
          <text class="rw-item-value">{{ item.weight }} kg</text>
        </view>
      </view>
    </view>
    <view v-if="weightList.length > 1" class="rw-trend">
      <text class="rw-trend-title">体重趋势</text>
      <view class="rw-trend-container">
        <!-- Y轴刻度 -->
        <view class="rw-trend-axis">
          <view v-for="(tick, idx) in yAxisTicks" :key="idx" class="rw-axis-tick">
            <text class="rw-axis-label">{{ tick }}</text>
          </view>
        </view>
        <!-- 趋势点 -->
        <view class="rw-trend-bar">
          <view v-for="item in trendList" :key="item.date" class="rw-trend-item">
            <view class="rw-trend-dot" :style="trendDotStyle(item.weight)"></view>
            <text class="rw-trend-date">{{ item.date }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
  import {
    ref,
    onMounted,
    computed
  } from 'vue'


  const weightInput = ref('')
  const weightList = ref([])
  const targetWeight = ref('')
  const showTargetPopup = ref(false)
  const targetWeightInput = ref('')
  const loading = ref(false)

  // API基础URL
  const API_BASE_URL = 'http://localhost:8080'
  const API_BASE = API_BASE_URL + '/api/weight'

  // 获取token
  function getToken() {
    return uni.getStorageSync('token') || ''
  }

  const targetWeightDisplay = computed(() => {
    // 显示为数字或“--”
    if (!targetWeight.value || isNaN(Number(targetWeight.value))) return '--'
    return Number(targetWeight.value).toFixed(2)
  })

  function loadWeight() {
    // 先尝试从后端API获取体重数据，失败则使用本地存储
    loading.value = true
    const token = getToken()
    if (!token) {
      console.warn('体重接口可能未登录：token 为空，后端请求可能返回未授权')
    }
    uni.request({
      url: `${API_BASE}/list`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        console.log('体重列表响应：', res)
        if (res.statusCode === 200 && res.data.code === 200) {
          const data = res.data.data
          // WeightListVO 返回 { targetWeight, records: [{id, weight, date}, ...] }
          if (data && data.records) {
            // 转换后端数据格式为前端显示格式
            weightList.value = data.records.map(item => ({
              date: item.date,  // 日期格式已是 yyyy-MM-dd
              weight: Number(item.weight)
            }))
          }
          // 设置目标体重
          if (data && data.targetWeight) {
            targetWeight.value = String(data.targetWeight)
            targetWeightInput.value = String(data.targetWeight)
          }
          loading.value = false
        } else {
          console.warn('体重列表接口返回非成功状态：', res.data)
          // API返回错误，降级到本地存储
          loadWeightFromLocal()
        }
      },
      fail: (err) => {
        // API调用失败，降级到本地存储
        console.warn('API加载失败，使用本地数据:', err)
        loadWeightFromLocal()
      }
    })
  }

  // 从本地存储读取体重数据（降级方案）
  function loadWeightFromLocal() {
    try {
      weightList.value = JSON.parse(uni.getStorageSync('weightList') || '[]')
    } catch {
      weightList.value = []
    }
    // 目标体重优先取本地存储
    let t = ''
    try {
      t = uni.getStorageSync('targetWeight') || ''
    } catch {}
    if (!t) {
      // 若本地无则尝试从问卷同步
      try {
        const q = JSON.parse(uni.getStorageSync('questionnaireBaseInfo') || '{}')
        if (q && q.targetWeight) t = q.targetWeight.replace('kg', '').replace('千克', '')
      } catch {}
    }
    // 修复false问题
    if (!t || t === 'false') t = ''
    targetWeight.value = t
    targetWeightInput.value = t
    
    // 读取今日体重数据（从问卷预填）
    try {
      const todayData = JSON.parse(uni.getStorageSync('todayWeight') || '{}')
      if (todayData && todayData.weight) {
        weightInput.value = String(todayData.weight)
        console.log('✅ 已读取今日体重预填值:', todayData.weight)
      }
    } catch (e) {
      console.warn('读取今日体重失败:', e)
    }
    
    loading.value = false
  }
  onMounted(loadWeight)

  function saveWeight() {
    const val = parseFloat(weightInput.value)
    if (!val || val < 20 || val > 300) {
      uni.showToast({
        title: '请输入合理体重',
        icon: 'none'
      })
      return
    }

    // 先尝试调用后端API
    uni.request({
      url: `${API_BASE}/add`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      data: {
        weight: val
      },
      success: (res) => {
        console.log('新增体重响应：', res)
        if (res.statusCode === 200 && res.data.code === 200) {
          // 后端保存成功，刷新列表
          loadWeight()
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
          weightInput.value = ''
        } else {
          console.warn('新增体重接口返回非成功状态：', res.data)
          // API返回错误，降级到本地存储
          saveWeightToLocal(val)
        }
      },
      fail: (err) => {
        console.error('新增体重请求失败：', err)
        // API调用失败，降级到本地存储
        console.warn('API保存失败，保存到本地')
        saveWeightToLocal(val)
      }
    })
  }

  // 保存体重到本地存储（降级方案）
  function saveWeightToLocal(val) {
    const now = new Date()
    const dateStr =
      `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
    // 若当天已记录则覆盖
    const idx = weightList.value.findIndex(w => w.date === dateStr)
    if (idx >= 0) {
      weightList.value[idx].weight = val
    } else {
      weightList.value.unshift({
        date: dateStr,
        weight: val
      })
    }
    uni.setStorageSync('weightList', JSON.stringify(weightList.value))
    uni.showToast({
      title: '保存成功（本地存储）',
      icon: 'success'
    })
    weightInput.value = ''
  }

  function confirmTargetWeight() {
    const val = parseFloat(targetWeightInput.value)
    if (!val || val < 20 || val > 300) {
      uni.showToast({
        title: '请输入合理目标体重',
        icon: 'none'
      })
      return
    }

    // 先尝试调用后端API
    uni.request({
      url: `${API_BASE}/target`,
      method: 'PUT',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      data: {
        weight: val
      },
      success: (res) => {
        console.log('修改目标体重响应：', res)
        if (res.statusCode === 200 && res.data.code === 200) {
          targetWeight.value = val.toString()
          showTargetPopup.value = false
          uni.showToast({
            title: '目标体重已更新',
            icon: 'success',
            duration: 1500
          })
        } else {
          console.warn('修改目标体重接口返回非成功状态：', res.data)
          // API返回错误，降级到本地存储
          updateTargetWeightLocal(val)
        }
      },
      fail: (err) => {
        console.error('修改目标体重请求失败：', err)
        // API调用失败，降级到本地存储
        console.warn('API更新失败，保存到本地')
        updateTargetWeightLocal(val)
      }
    })
  }

  // 更新目标体重到本地存储（降级方案）
  function updateTargetWeightLocal(val) {
    targetWeight.value = val.toString()
    uni.setStorageSync('targetWeight', targetWeight.value)
    showTargetPopup.value = false
    uni.showToast({
      title: '目标体重已更新（本地存储）',
      icon: 'success',
      duration: 1500
    })
  }

  const yesterdayWeightStr = computed(() => {
    if (weightList.value.length < 2) return '--'
    return weightList.value[1].weight
  })
  const diffWeightStr = computed(() => {
    if (weightList.value.length < 2) return '--'
    const diff = (weightList.value[1].weight - weightList.value[0].weight)
    return (diff >= 0 ? diff : 0).toFixed(2)
  })

  // 趋势按时间正序展示
  const trendList = computed(() => weightList.value.slice().reverse())

  // Y轴刻度计算
  const yAxisTicks = computed(() => {
    if (weightList.value.length === 0) return []
    const weights = weightList.value.map(w => w.weight)
    const min = Math.min(...weights)
    const max = Math.max(...weights)
    const step = Math.ceil((max - min) / 3 * 4) / 4 || 1
    const ticks = []
    for (let i = Math.floor(min); i <= Math.ceil(max); i += step) {
      ticks.push(i.toFixed(1))
    }
    return ticks.length > 0 ? ticks : [min.toFixed(1), max.toFixed(1)]
  })

  // 趋势点样式
  function trendDotStyle(weight) {
    // 以最大最小体重映射高度
    const min = Math.min(...weightList.value.map(w => w.weight))
    const max = Math.max(...weightList.value.map(w => w.weight))
    const range = max - min || 1
    const percent = ((weight - min) / range)
    return {
      marginBottom: `${percent * 60 + 10}px`,
      background: percent > 0.5 ? '#53B1EF' : '#FDD0D0'
    }
  }
</script>

<style scoped>
  .rw-target-card {
    background: #f7f7fa;
    border: 1px solid #e3f2fd;
    margin-bottom: 10px;
  }

  .rw-target-value {
    font-size: 18px;
    color: #53B1EF;
    font-weight: 600;
    margin: 0 8px;
    white-space: nowrap;
    flex: 1;
  }

  .rw-edit-btn {
    background: #53B1EF;
    color: #fff;
    border-radius: 8px;
    font-size: 16px;
    padding: 8px 18px;
    font-weight: 600;
    border: none;
  }

  .rw-popup-mask {
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

  .rw-popup-content {
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

  .rw-popup-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 18px;
    text-align: center;
  }

  .rw-popup-input {
    min-height: 40px;
    border-radius: 8px;
    border: 1px solid #e3f2fd;
    padding: 10px;
    font-size: 15px;
    margin-bottom: 12px;
    background: #f7f7fa;
    color: #333;
  }

  .rw-popup-btn-row {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
  }

  .rw-popup-btn {
    flex: 1;
    text-align: center;
    padding: 10px 0;
    font-size: 16px;
    border-radius: 8px;
    background: #f0f0f0;
    margin: 0 6px;
    cursor: pointer;
  }

  .rw-popup-btn.confirm {
    background: #53B1EF;
    color: #fff;
    font-weight: 600;
  }

  .rw-bg {
    min-height: 100vh;
    background: linear-gradient(135deg, #E3F2FD 0%, #F0F9FF 100%);
    padding: 24rpx;
    box-sizing: border-box;
  }

  .rw-input-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(79, 161, 242, 0.08);
    padding: 18px 16px;
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: 350px;
    margin-left: auto;
    margin-right: auto;
  }

  .rw-label {
    font-size: 16px;
    color: #53B1EF;
    font-weight: 600;
    min-width: 80px;
  }

  .rw-inc-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #e3f2fd;
    color: #53B1EF;
    font-size: 22px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin: 0 2px;
    box-shadow: 0 1px 4px rgba(79, 161, 242, 0.04);
    cursor: pointer;
  }

  .rw-unit {
    color: #888;
    font-size: 15px;
    margin-left: 2px;
    margin-right: 8px;
  }

  .rw-btn {
    background: #53B1EF;
    color: #fff;
    border-radius: 8px;
    font-size: 16px;
    padding: 8px 18px;
    font-weight: 600;
    border: none;
    margin-left: 8px;
  }

  .rw-compare {
    text-align: center;
    color: #888;
    font-size: 15px;
    margin-bottom: 10px;
  }

  .rw-compare-num {
    color: #53B1EF;
    font-weight: 600;
    margin: 0 2px;
  }

  .rw-input {
    flex: 1;
    border-radius: 8px;
    border: 1px solid #e3f2fd;
    padding: 8px 12px;
    font-size: 16px;
    background: #f7f7fa;
    color: #333;
    margin: 0 8px;
  }

  .rw-btn {
    background: #53B1EF;
    color: #fff;
    border-radius: 8px;
    font-size: 16px;
    padding: 8px 18px;
    font-weight: 600;
    border: none;
  }

  .rw-history {
    margin-bottom: 18px;
  }

  .rw-history-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    font-size: 18px;
    font-weight: 600;
  }

  .rw-history-icon {
    font-size: 22px;
    margin-right: 4px;
  }

  .rw-history-title {
    font-size: 18px;
    color: #333;
    font-weight: 600;
  }

  .rw-empty-tip {
    text-align: center;
    color: #999;
    font-size: 15px;
    margin-top: 12px;
  }

  .rw-history-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .rw-history-item {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #F7FBFF;
    border-radius: 8px;
    padding: 8px 12px;
    box-shadow: 0 1px 4px rgba(79, 161, 242, 0.04);
  }

  .rw-item-icon {
    font-size: 18px;
    margin-right: 4px;
  }

  .rw-item-date {
    font-size: 14px;
    color: #53B1EF;
  }

  .rw-item-value {
    font-size: 16px;
    color: #333;
    font-weight: 600;
  }

  .rw-trend {
    margin-top: 18px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(79, 161, 242, 0.08);
    padding: 16px 12px;
  }

  .rw-trend-title {
    font-size: 16px;
    color: #53B1EF;
    font-weight: 600;
    margin-bottom: 12px;
  }

  .rw-trend-container {
    display: flex;
    gap: 8px;
  }

  .rw-trend-axis {
    display: flex;
    flex-direction: column-reverse;
    min-width: 30px;
    justify-content: space-between;
    padding-right: 4px;
  }

  .rw-axis-tick {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 20px;
  }

  .rw-axis-label {
    font-size: 11px;
    color: #999;
    white-space: nowrap;
  }

  .rw-trend-bar {
    height: 110px;
    display: flex;
    align-items: flex-end;
    gap: 12px;
    margin-top: 8px;
    flex: 1;
    position: relative;
  }

  .rw-trend-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
    min-width: 40px;
    box-sizing: border-box;
  }

  .rw-trend-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    transition: margin-bottom 0.3s;
  }

  .rw-trend-date {
    font-size: 12px;
    color: #7a8ba0;
    margin-top: 6px;
    white-space: nowrap;
  }
</style>