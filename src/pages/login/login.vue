<template>
  <view class="login-page">
    <view class="bg-blob bg-blob-top"></view>
    <view class="bg-blob bg-blob-bottom"></view>

    <view class="login-shell">
      <view class="hero-block">
        <view class="brand-mark">
          <text class="brand-mark-text">GO</text>
        </view>
        <text class="brand-title">TJU GO HEALTHY</text>
        <text class="brand-subtitle">校园健康管理，一次登录即可开启</text>
      </view>

      <view class="login-card">
        <view class="card-head">
          <text class="card-head-title">微信授权登录</text>
          <text class="card-head-desc">登录后可同步问卷、计划、记录与提醒</text>
        </view>

        <view class="benefit-list">
          <view class="benefit-item">
            <text class="benefit-dot"></text>
            <text class="benefit-text">一键进入首页与个人中心</text>
          </view>
          <view class="benefit-item">
            <text class="benefit-dot"></text>
            <text class="benefit-text">同步体重、饮水、运动等数据</text>
          </view>
          <view class="benefit-item">
            <text class="benefit-dot"></text>
            <text class="benefit-text">仅使用微信 code 登录，不额外收集头像昵称</text>
          </view>
        </view>

        <button
          class="login-btn"
          @click="onWechatLogin"
          :disabled="isSubmitting"
          :loading="isSubmitting"
        >
          {{ isSubmitting ? '登录中...' : '微信授权登录' }}
        </button>

        <button class="cancel-login-btn" @click="goToHome">取消登录</button>

        <view class="privacy-section">
          <text class="privacy-title">登录指引与隐私协议</text>
          <text class="privacy-text">
            本小程序为校园健康管理工具，仅通过微信授权登录（获取登录凭证 code）用于身份识别。我们会记录身高、体重、运动、饮食、饮水等健康数据，用于个人健康管理与数据统计展示；无支付交易功能，不收集姓名、手机号、学号等敏感个人信息。如您使用AI对话功能，我们会将用户健康相关信息传输至第三方人工智能服务接口，用于生成饮食、运动健康建议，我方严格管控数据安全，不向其他无关第三方泄露、不买卖用户个人信息。
          </text>
          <view class="privacy-actions">
            <text class="privacy-consent">登录即表示你已阅读并同意上述说明。</text>
            <text class="privacy-link" @click="showPrivacy = true">查看协议</text>
          </view>
        </view>

        <view class="login-note">
          <text>登录即表示你已准备好使用校园健康服务</text>
        </view>
      </view>
    </view>

    <view v-if="showPrivacy" class="privacy-modal" @click="showPrivacy = false">
      <view class="privacy-dialog" @click.stop>
        <text class="privacy-dialog-title">登录指引与隐私协议</text>
        <scroll-view class="privacy-dialog-body" scroll-y="true">
          <text class="privacy-dialog-text">
            本协议适用于Pro食养录小程序的登录与使用。请你在登录前仔细阅读并理解本协议内容。
            
            1. 功能与范围：本小程序为校园健康管理工具，提供健康记录与数据展示服务。
            
            2. 登录方式：仅通过微信授权登录获取登录凭证 code 进行身份识别，不额外获取昵称、头像等信息。
            
            3. 收集与使用：记录身高、体重、运动、饮食、饮水等健康数据，用于个人健康管理与数据统计展示。
            
            4. 不收集信息：不收集姓名、手机号、学号等敏感个人信息；无支付交易功能。

            5. 如用户使用AI对话功能，用户健康数据会传输至第三方人工智能服务商，用于生成个性化饮食、运动健康建议。

            6. 所有用户私密数据仅账号本人查看，平台不泄露、不共享、不出售任何用户信息。

            7. 开发者严格遵守《个人信息保护法》，妥善存储并保护用户个人隐私数据安全。
          </text>
        </scroll-view>
        <button class="privacy-dialog-btn" @click="showPrivacy = false">我已阅读</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { BASE_URL } from '@/config.js'

// 提交状态控制
const isSubmitting = ref(false)
const showPrivacy = ref(false)

function goToHome() {
  uni.switchTab({ url: '/pages/home/home' })
}

/**
 * 【微信小程序过审标准登录】
 * 仅使用 wx.login 获取 code，不获取昵称/头像，不强制授权
 * 完全符合微信官方要求，无任何审核风险
 */
function onWechatLogin() {
  if (isSubmitting.value) return
  isSubmitting.value = true

  uni.showLoading({
    title: '登录中...',
    mask: true
  })

  // 1. 获取微信登录 code（无授权弹窗，无隐私权限）
  uni.login({
    provider: 'weixin',
    success: (res) => {
      if (!res.code) {
        uni.hideLoading()
        isSubmitting.value = false
        uni.showToast({
          title: '获取登录信息失败',
          icon: 'none'
        })
        return
      }

      // 2. 只把 code 传给后端，后端通过 code2Session 换取 openid
      uni.request({
        url: BASE_URL + '/api/auth/login',
        method: 'POST',
        header: {
          'Content-Type': 'application/json'
        },
        data: {
          code: res.code
        },
        success: (response) => {
          const data = response.data || {}
          if (data.code === 200 && data.data) {
            const userInfo = data.data
            // 统一存储 token
            const token = userInfo.token || userInfo.auth_token || ''
            if (token) {
              uni.setStorageSync('token', token)
              uni.setStorageSync('auth_token', token)
              uni.setStorageSync('access_token', token)
            }

            // 只保留匿名标识与 token，不写入姓名、学号、昵称或头像
            const anonymousUser = {
              id: userInfo.id || ''
            }
            uni.setStorageSync('userInfo', anonymousUser)
            uni.setStorageSync('current_user_profile', anonymousUser)

            uni.hideLoading()
            uni.showToast({
              title: '登录成功',
              icon: 'success'
            })

            // 登录成功跳转
            setTimeout(() => {
              uni.navigateTo({ url: '/pages/questionnaire/questionnaire' })
            }, 1000)
          } else {
            uni.hideLoading()
            uni.showToast({
              title: data.message || '登录失败，请重试',
              icon: 'none'
            })
          }
        },
        fail: () => {
          uni.hideLoading()
          isSubmitting.value = false
          uni.showToast({
            title: '网络异常，请检查后重试',
            icon: 'none'
          })
        },
        complete: () => {
          isSubmitting.value = false
        }
      })
    },
    fail: () => {
      uni.hideLoading()
      isSubmitting.value = false
      uni.showToast({
        title: '微信登录授权失败',
        icon: 'none'
      })
    }
  })
}
</script>

<style scoped>
.login-page {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, #f6fbff 0%, #eef7ff 45%, #ffffff 100%);
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(18px);
  opacity: 0.8;
}

.bg-blob-top {
  width: 260rpx;
  height: 260rpx;
  top: -90rpx;
  left: -100rpx;
  background: rgba(96, 165, 250, 0.16);
}

.bg-blob-bottom {
  width: 220rpx;
  height: 220rpx;
  right: -90rpx;
  bottom: 160rpx;
  background: rgba(96, 165, 250, 0.10);
}

.login-shell {
  position: relative;
  z-index: 1;
  min-height: 100%;
  padding: 104rpx 48rpx 64rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.hero-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 40rpx;
}

.brand-mark {
  width: 116rpx;
  height: 116rpx;
  border-radius: 34rpx;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 18rpx 42rpx rgba(59, 130, 246, 0.24);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.brand-mark-text {
  color: #fff;
  font-size: 36rpx;
  font-weight: 800;
  letter-spacing: 2rpx;
}

.brand-title {
  font-size: 42rpx;
  line-height: 1.2;
  font-weight: 800;
  color: #163024;
}

.brand-subtitle {
  margin-top: 14rpx;
  font-size: 26rpx;
  line-height: 1.6;
  color: #5f7669;
}

.login-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1rpx solid rgba(59, 130, 246, 0.10);
  border-radius: 36rpx;
  padding: 34rpx 30rpx 28rpx;
  box-shadow: 0 18rpx 50rpx rgba(23, 58, 41, 0.08);
}

.card-head {
  margin-bottom: 26rpx;
}

.card-head-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
  color: #17382a;
}

.card-head-desc {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
  color: #6b8176;
}

.benefit-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 30rpx;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
}

.benefit-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  margin-top: 10rpx;
  flex-shrink: 0;
}

.benefit-text {
  flex: 1;
  font-size: 24rpx;
  line-height: 1.6;
  color: #395446;
}

.login-btn {
  width: 100%;
  height: 94rpx;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 700;
  box-shadow: 0 16rpx 28rpx rgba(59, 130, 246, 0.24);
}

.login-btn::after {
  border: none;
}

.cancel-login-btn {
  margin-top: 16rpx;
  height: 84rpx;
  border-radius: 999rpx;
  background: #f1f5f9;
  color: #334155;
  font-size: 28rpx;
  font-weight: 600;
  border: 2rpx solid rgba(51, 65, 85, 0.12);
}

.cancel-login-btn::after {
  border: none;
}

.login-note {
  margin-top: 22rpx;
  text-align: center;
  font-size: 22rpx;
  line-height: 1.6;
  color: #8a9c91;
}

.privacy-section {
  margin-top: 26rpx;
  padding: 18rpx 20rpx;
  border-radius: 20rpx;
  background: rgba(59, 130, 246, 0.06);
  border: 1rpx solid rgba(59, 130, 246, 0.12);
}

.privacy-title {
  display: block;
  font-size: 24rpx;
  font-weight: 700;
  color: #1f3b2d;
  margin-bottom: 10rpx;
}

.privacy-text {
  display: block;
  font-size: 22rpx;
  line-height: 1.6;
  color: #4b6658;
}

.privacy-consent {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #3b5a4b;
}

.privacy-actions {
  margin-top: 10rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.privacy-link {
  align-self: flex-start;
  font-size: 22rpx;
  color: #2563eb;
  text-decoration: underline;
}

.privacy-modal {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
  padding: 40rpx;
}

.privacy-dialog {
  width: 100%;
  max-width: 640rpx;
  background: #fff;
  border-radius: 28rpx;
  padding: 28rpx 26rpx 24rpx;
  box-shadow: 0 20rpx 60rpx rgba(15, 23, 42, 0.18);
}

.privacy-dialog-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
  color: #12231a;
  text-align: center;
  margin-bottom: 18rpx;
}

.privacy-dialog-body {
  max-height: 520rpx;
}

.privacy-dialog-text {
  display: block;
  font-size: 24rpx;
  line-height: 1.7;
  color: #425347;
  white-space: pre-line;
}

.privacy-dialog-btn {
  margin-top: 20rpx;
  height: 84rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #fff;
  font-size: 28rpx;
  font-weight: 700;
}

.privacy-dialog-btn::after {
  border: none;
}

@media screen and (max-height: 700px) {
  .login-shell {
    padding-top: 72rpx;
    justify-content: flex-start;
  }
}
</style>