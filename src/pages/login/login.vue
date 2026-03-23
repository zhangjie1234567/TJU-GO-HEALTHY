<template>
  <view class="page">
    <view class="proto">
      <view class="card-wrap">
        <view class="card">
          <view class="flow-title">
            <text class="title-text">学生认证</text>
            <text class="subtitle-text">请登录您的账号</text>
          </view>
          <view class="form-wrap">
            <view class="form-group">
              <text class="form-label">姓名</text>
              <input v-model="form.name" class="form-input" type="text" placeholder="请输入真实姓名"
                placeholder-class="input-placeholder" maxlength="20" />
            </view>
            <view class="form-group">
              <text class="form-label">学号</text>
              <input v-model="form.studentId" class="form-input" type="text" placeholder="请输入学号（3-20位字母或数字）"
                placeholder-class="input-placeholder" maxlength="20" @input="onStudentIdInput" />
              <text v-if="showStudentIdError" class="form-error">学号格式不正确</text>
            </view>
            <view class="remember-row">
              <checkbox-group @change="onRememberChange">
                <label class="remember-label">
                  <checkbox value="remember" :checked="form.rememberMe" color="#4FA1F2" />
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
  </view>
</template>

<script setup>
  import {
    ref,
    reactive,
    onMounted
  } from 'vue'
  import { login as loginApi, register as registerApi } from '../my/my-store'

  const form = reactive({
    name: '',
    studentId: '',
    rememberMe: false
  })
  const showStudentIdError = ref(false)

  // 学号输入预处理：去掉空白，限制长度
  function onStudentIdInput(e) {
    const val = String(e.detail?.value ?? '').trim().slice(0, 20)
    form.studentId = val
    showStudentIdError.value = val.length > 0 && !validateStudentId(val)
  }

  function onRememberChange(e) {
    form.rememberMe = (e.detail?.value || []).indexOf('remember') !== -1
  }

  function validateStudentId(id) {
    return /^[A-Za-z0-9]{3,20}$/.test((id || '').trim())
  }

  async function onSubmit() {
    const name = (form.name || '').trim()
    const studentId = (form.studentId || '').trim()
    showStudentIdError.value = false
    if (!name) {
      uni.showToast({
        title: '请输入真实姓名',
        icon: 'none'
      })
      return
    }
    if (!studentId) {
      uni.showToast({
        title: '请输入学号',
        icon: 'none'
      })
      return
    }
    if (!validateStudentId(studentId)) {
      showStudentIdError.value = true
      uni.showToast({
        title: '学号格式不正确，请输入3-20位字母或数字',
        icon: 'none'
      })
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

    try {
      const loginResult = await loginApi(studentId, name)
      if (!loginResult?.token) throw new Error('登录失败，请稍后重试')
    } catch (e) {
      try {
        await registerApi({ studentId, name, avatar: '😊' })
        const loginResult = await loginApi(studentId, name)
        if (!loginResult?.token) throw new Error('登录失败，请稍后重试')
      } catch (registerOrLoginError) {
        uni.showToast({
          title: registerOrLoginError?.message || e?.message || '登录失败',
          icon: 'none'
        })
        return
      }
    }

    uni.showToast({
      title: '认证成功',
      icon: 'success'
    })
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/questionnaire/questionnaire'
      })
    }, 1500)
  }
  onMounted(() => {
    try {
      const savedId = uni.getStorageSync('login_remember_studentId')
      const savedName = uni.getStorageSync('login_remember_name')
      if (savedId) form.studentId = String(savedId).slice(0, 20)
      if (savedName) form.name = savedName
      if (savedId || savedName) form.rememberMe = true
    } catch (e) {}
  })
</script>

<style lang="scss" scoped>
  .page {
    min-height: 100vh;
    /* 改为你想要的蓝色渐变背景 */
    background: linear-gradient(165deg, #4FA1F2 0%, #80D0FF 100%);
    display: flex;
    align-items: center;
    /* 垂直居中 */
    justify-content: center;
    /* 水平居中 */
    padding: 40rpx 30rpx;
    /* 左右留少量内边距，避免内容贴边 */
    box-sizing: border-box;
  }

  .proto {
    width: 100%;
    max-width: 600rpx;
    /* 限制最大宽度，适配大屏手机 */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .card-wrap {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card {
    width: 100%;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20rpx;
    padding: 40rpx 35rpx;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
    backdrop-filter: blur(10rpx);
  }

  .flow-title {
    text-align: center;
    margin-bottom: 35rpx;
  }

  .title-text {
    display: block;
    font-size: 42rpx;
    font-weight: 700;
    color: #2C3E50;
    margin-bottom: 10rpx;
    letter-spacing: 2rpx;
  }

  .subtitle-text {
    display: block;
    font-size: 30rpx;
    color: #666;
  }

  .form-wrap {
    width: 100%;
  }

  .form-group {
    margin-bottom: 28rpx;
  }

  .form-label {
    display: block;
    font-size: 32rpx;
    color: #4A5568;
    margin-bottom: 12rpx;
    padding-left: 8rpx;
  }

  .form-input {
    width: 100%;
    height: 73rpx;
    /* 从48rpx增大到70rpx */
    border: 2rpx solid #e0e0e0;
    /* 加粗边框 */
    border-radius: 35rpx;
    /* 对应高度调整圆角 */
    padding: 0 24rpx;
    /* 增大输入框内边距 */
    font-size: 28rpx;
    /* 从16rpx增大到22rpx */
    color: #333;
    background: #fff;
    box-sizing: border-box;
  }

  .form-input:focus {
    border-color: #4FA1F2;
    box-shadow: 0 0 0 5rpx rgba(79, 161, 242, 0.2);
    /* 增大聚焦阴影 */
  }

  .input-placeholder {
    color: #999;
    font-size: 20rpx;
    /* 放大占位符字体 */
  }

  // 放大错误提示字体
  .form-error {
    display: block;
    font-size: 18rpx;
    /* 从12rpx增大到18rpx */
    color: #e74c3c;
    margin-top: 10rpx;
    padding-left: 8rpx;
  }

  /* 兼容H5和小程序的输入框聚焦发光蓝色边框 */
  .form-input:focus {
    border-color: #4FA1F2 !important;
    box-shadow: 0 0 0 3px rgba(79, 161, 242, 0.18) !important;
    outline: none !important;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  /* H5下uni-app的input聚焦时也加发光 */
  input.form-input:focus {
    border-color: #4FA1F2 !important;
    box-shadow: 0 0 0 3px rgba(79, 161, 242, 0.18) !important;
    outline: none !important;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  /* 美化记住我复选框尺寸，兼容H5和小程序 */
  .remember-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 14rpx;
    color: #666;
    margin-bottom: 30rpx;
    /* 增加复选框与按钮间距 */
  }

  .remember-label .uni-checkbox-input {
    width: 14px !important;
    height: 14px !important;
    min-width: 14px !important;
    min-height: 14px !important;
    border-radius: 3px !important;
    border: 1px solid #4FA1F2 !important;
    margin-right: 6px;
    box-sizing: border-box;
    vertical-align: middle;
  }

  .remember-label .uni-checkbox-input-checked {
    background: linear-gradient(90deg, #4FA1F2 0%, #80D0FF 100%) !important;
    border-color: #4FA1F2 !important;
  }

  .remember-label .uni-checkbox-input:after {
    border-color: #fff !important;
  }

  .remember-text {
    font-size: 24rpx;
    color: #666;
    margin-left: 10rpx;
  }

  .auth-btn {
    width: 100%;
    height: 80rpx;
    /* 从50rpx增大到80rpx */
    line-height: 80rpx;
    /* 对应高度调整行高 */
    border: none;
    border-radius: 40rpx;
    /* 对应高度调整圆角 */
    background: linear-gradient(90deg, #4FA1F2 0%, #80D0FF 100%);
    color: #fff;
    font-size: 30rpx;
    /* 从18rpx增大到26rpx */
    font-weight: 600;
    box-shadow: 0 8rpx 15rpx rgba(79, 161, 242, 0.4);
    /* 增大按钮阴影 */
  }

  .auth-btn::after {
    border: none;
  }

  .auth-btn-hover {
    opacity: 0.92;
    transform: scale(0.99);
  }
</style>