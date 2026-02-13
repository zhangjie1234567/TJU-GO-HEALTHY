<template>
  <view class="page">
    <!-- 中间白色卡片 -->
    <view class="card-wrap">
      <view class="card">
        <view class="flow-title">
          <text class="title-text">学生认证</text>
          <text class="subtitle-text">请登录您的账号</text>
        </view>

        <view class="form-wrap">
          <view class="form-group">
            <text class="form-label">姓名</text>
            <input
              v-model="form.name"
              class="form-input"
              type="text"
              placeholder="请输入真实姓名"
              placeholder-class="input-placeholder"
              maxlength="20"
            />
          </view>
          <view class="form-group">
            <text class="form-label">学号</text>
            <input
              v-model="form.studentId"
              class="form-input"
              type="number"
              placeholder="请输入10位学号"
              placeholder-class="input-placeholder"
              maxlength="10"
              @input="onStudentIdInput"
            />
            <text v-if="showStudentIdError" class="form-error">学号格式不正确</text>
          </view>

          <view class="remember-row">
            <checkbox-group @change="onRememberChange">
              <label class="remember-label">
                <checkbox
                  value="remember"
                  :checked="form.rememberMe"
                  color="#4FA1F2"
                />
                <text class="remember-text">记住我</text>
              </label>
            </checkbox-group>
          </view>

          <button class="auth-btn" hover-class="auth-btn-hover" @tap="onSubmit">
            认证
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const form = reactive({
  name: '',
  studentId: '',
  rememberMe: false
})

const showStudentIdError = ref(false)

// 学号仅允许数字，最多10位
function onStudentIdInput(e) {
  const val = (e.detail?.value ?? '').replace(/\D/g, '').slice(0, 10)
  form.studentId = val
  showStudentIdError.value = val.length > 0 && val.length !== 10
}

function onRememberChange(e) {
  form.rememberMe = (e.detail?.value || []).indexOf('remember') !== -1
}

// 校验学号：必须为10位数字
function validateStudentId(id) {
  return /^\d{10}$/.test((id || '').trim())
}

function onSubmit() {
  const name = (form.name || '').trim()
  const studentId = (form.studentId || '').trim()

  showStudentIdError.value = false
  if (!name) {
    uni.showToast({ title: '请输入真实姓名', icon: 'none' })
    return
  }
  if (!studentId) {
    uni.showToast({ title: '请输入学号', icon: 'none' })
    return
  }
  if (!validateStudentId(studentId)) {
    showStudentIdError.value = true
    uni.showToast({ title: '学号格式不正确，请输入10位数字', icon: 'none' })
    return
  }

  if (form.rememberMe) {
    try {
      uni.setStorageSync('login_remember_studentId', studentId)
      uni.setStorageSync('login_remember_name', name)
    } catch (e) {}
  } else {
    try {
      uni.removeStorageSync('login_remember_studentId')
      uni.removeStorageSync('login_remember_name')
    } catch (e) {}
  }

  uni.showToast({ title: '认证成功', icon: 'success' })
  setTimeout(() => {
    uni.switchTab({ url: '/pages/index/index' })
  }, 1500)
}

onMounted(() => {
  try {
    const savedId = uni.getStorageSync('login_remember_studentId')
    const savedName = uni.getStorageSync('login_remember_name')
    if (savedId) form.studentId = String(savedId).slice(0, 10)
    if (savedName) form.name = savedName
    if (savedId || savedName) form.rememberMe = true
  } catch (e) {}
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(165deg, #4FA1F2 0%, #80D0FF 100%);
  padding: 0 50rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-wrap {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
}

.card {
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 32rpx;
  padding: 56rpx 48rpx;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(20rpx);
}

.flow-title {
  text-align: center;
  margin-bottom: 48rpx;
}

.title-text {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 12rpx;
}

.subtitle-text {
  display: block;
  font-size: 28rpx;
  color: #666;
}

.form-wrap {
  width: 100%;
}

.form-group {
  margin-bottom: 36rpx;
}

.form-label {
  display: block;
  font-size: 32rpx;
  color: #4a5568;
  margin-bottom: 16rpx;
  padding-left: 10rpx;
}

.form-input {
  width: 100%;
  height: 96rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 48rpx;
  padding: 0 40rpx;
  font-size: 32rpx;
  color: #333;
  background: #fff;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #4FA1F2;
}

.input-placeholder {
  color: #999;
}

.form-error {
  display: block;
  font-size: 24rpx;
  color: #e74c3c;
  margin-top: 12rpx;
  padding-left: 10rpx;
}

.remember-row {
  margin-bottom: 40rpx;
}

.remember-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.remember-text {
  font-size: 28rpx;
  color: #666;
  margin-left: 12rpx;
}

.auth-btn {
  width: 100%;
  height: 100rpx;
  line-height: 100rpx;
  border: none;
  border-radius: 50rpx;
  background: linear-gradient(90deg, #4FA1F2 0%, #80D0FF 100%);
  color: #fff;
  font-size: 34rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(79, 161, 242, 0.4);
}

.auth-btn::after {
  border: none;
}

.auth-btn-hover {
  opacity: 0.92;
  transform: scale(0.99);
}
</style>
