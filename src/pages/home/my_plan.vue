<template>
  <view class="my-plan-container">
    <!-- 操作按钮栏 -->
    <view class="plan-action-bar">
      <view v-if="!editMode" class="edit-btn" @click="startEdit">
        <text class="edit-btn-icon">✏️</text>
        <text class="edit-btn-text">修改方案</text>
      </view>
      <view v-else class="action-btns">
        <view class="cancel-btn" @click="cancelEdit">
          <text class="cancel-btn-text">取消</text>
        </view>
        <view class="save-btn" :class="{ 'saving': isSaving }" @click="saveEdit">
          <text class="save-btn-text">{{ isSaving ? '保存中…' : '保存' }}</text>
        </view>
      </view>
    </view>

    <!-- 饮食方案卡片 -->
    <view class="plan-card">
      <view class="card-header" @click="!editMode && toggleExpand('diet')">
        <view class="card-title">饮食方案</view>
        <view v-if="!editMode" class="expand-icon" :class="{ expanded: expandedDiet }">›</view>
      </view>
      <view v-if="editMode" class="card-edit">
        <textarea
          class="edit-textarea"
          v-model="editDiet"
          placeholder="请输入饮食方案..."
          :maxlength="2000"
          :auto-height="true"
        />
      </view>
      <view v-else-if="expandedDiet" class="card-content">
        <text v-if="planData && planData.diet">{{ planData.diet }}</text>
        <text v-else class="placeholder">请先在AI页面生成饮食方案</text>
      </view>
      <view v-else class="card-preview">
        <text v-if="planData && planData.diet">{{ getPreview(planData.diet) }}</text>
        <text v-else class="placeholder">请先在AI页面生成饮食方案</text>
      </view>
    </view>

    <!-- 运动计划卡片 -->
    <view class="plan-card">
      <view class="card-header" @click="!editMode && toggleExpand('exercise')">
        <view class="card-title">运动计划</view>
        <view v-if="!editMode" class="expand-icon" :class="{ expanded: expandedExercise }">›</view>
      </view>
      <view v-if="editMode" class="card-edit">
        <textarea
          class="edit-textarea"
          v-model="editExercise"
          placeholder="请输入运动计划..."
          :maxlength="2000"
          :auto-height="true"
        />
      </view>
      <view v-else-if="expandedExercise" class="card-content">
        <text v-if="planData && planData.exercise">{{ planData.exercise }}</text>
        <text v-else class="placeholder">请先在AI页面生成运动计划</text>
      </view>
      <view v-else class="card-preview">
        <text v-if="planData && planData.exercise">{{ getPreview(planData.exercise) }}</text>
        <text v-else class="placeholder">请先在AI页面生成运动计划</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
  import { BASE_URL } from '@/config.js'

const planData = ref(null)
const expandedDiet = ref(false)
const expandedExercise = ref(false)
const editMode = ref(false)
const editDiet = ref('')
const editExercise = ref('')
const isSaving = ref(false)

function getToken() {
  return uni.getStorageSync('token') || ''
}

onMounted(() => {
  // 先从本地缓存读取，防止网络加载时页面空白
  const savedPlan = uni.getStorageSync('myPlan')
  if (savedPlan && (savedPlan.diet || savedPlan.exercise)) {
    planData.value = savedPlan
  }

  // 再从后端 API 拉取最新方案
  const token = getToken()
  if (!token) return
  uni.request({
    url: BASE_URL + '/api/plan/my',
    method: 'GET',
    header: { Authorization: 'Bearer ' + token },
    success(res) {
      if (res.data && res.data.code === 200 && res.data.data) {
        const data = res.data.data
        planData.value = { diet: data.diet || '', exercise: data.exercise || '' }
        uni.setStorageSync('myPlan', planData.value)
      }
    }
  })
})

function toggleExpand(type) {
  if (type === 'diet') {
    expandedDiet.value = !expandedDiet.value
  } else if (type === 'exercise') {
    expandedExercise.value = !expandedExercise.value
  }
}

function getPreview(text) {
  if (!text) return ''
  return text.length > 100 ? text.substring(0, 100) + '...' : text
}

function startEdit() {
  editDiet.value = planData.value ? (planData.value.diet || '') : ''
  editExercise.value = planData.value ? (planData.value.exercise || '') : ''
  editMode.value = true
}

function cancelEdit() {
  editMode.value = false
}

function saveEdit() {
  if (isSaving.value) return
  const token = getToken()
  if (!token) {
    // 未登录时只保存到本地
    planData.value = { diet: editDiet.value, exercise: editExercise.value }
    uni.setStorageSync('myPlan', planData.value)
    editMode.value = false
    uni.showToast({ title: '已保存到本地', icon: 'success' })
    return
  }
  isSaving.value = true
  uni.request({
    url: BASE_URL + '/api/plan/my',
    method: 'PUT',
    header: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    data: { diet: editDiet.value, exercise: editExercise.value },
    success(res) {
      isSaving.value = false
      if (res.data && res.data.code === 200) {
        planData.value = { diet: editDiet.value, exercise: editExercise.value }
        uni.setStorageSync('myPlan', planData.value)
        editMode.value = false
        uni.showToast({ title: '方案已保存', icon: 'success' })
      } else {
        uni.showToast({ title: (res.data && res.data.message) || '保存失败', icon: 'none' })
      }
    },
    fail() {
      isSaving.value = false
      uni.showToast({ title: '网络错误，请重试', icon: 'none' })
    }
  })
}
</script>

<style scoped>
.my-plan-container {
  min-height: 100vh;
  background: #f5f6fa;
  padding: 24px 16px;
}

.plan-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
  padding: 0;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.card-header:active {
  background-color: #f5f6fa;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #4e9afe;
}

.expand-icon {
  font-size: 24px;
  color: #999;
  transition: transform 0.3s;
  transform: rotate(0deg);
}

.expand-icon.expanded {
  transform: rotate(90deg);
  color: #4e9afe;
}

.card-content {
  padding: 16px;
  font-size: 14px;
  color: #333;
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
}

.card-preview {
  padding: 16px;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}

.placeholder {
  color: #999;
  font-size: 14px;
}

/* ── 操作按钮栏 ── */
.plan-action-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
  padding: 0 4px;
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  border: 1px solid #4e9afe;
  border-radius: 20px;
  padding: 8px 18px;
  box-shadow: 0 1px 4px rgba(78, 154, 254, 0.15);
}

.edit-btn-icon {
  font-size: 14px;
}

.edit-btn-text {
  font-size: 14px;
  color: #4e9afe;
  font-weight: 500;
}

.action-btns {
  display: flex;
  gap: 10px;
  align-items: center;
}

.cancel-btn {
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 8px 18px;
  background: #fff;
}

.cancel-btn-text {
  font-size: 14px;
  color: #666;
}

.save-btn {
  background: #4e9afe;
  border-radius: 20px;
  padding: 8px 22px;
}

.save-btn.saving {
  background: #a0c4fd;
}

.save-btn-text {
  font-size: 14px;
  color: #fff;
  font-weight: 500;
}

/* ── 编辑区 ── */
.card-edit {
  padding: 12px 16px 16px;
}

.edit-textarea {
  width: 100%;
  min-height: 120px;
  font-size: 14px;
  color: #333;
  background: #f9f9fc;
  border: 1px solid #dde6f5;
  border-radius: 8px;
  padding: 12px;
  box-sizing: border-box;
  line-height: 1.7;
}
</style>