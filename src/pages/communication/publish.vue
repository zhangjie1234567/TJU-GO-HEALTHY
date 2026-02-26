<template>
  <view class="container">
    <view class="editor-card">
      <view class="account-bar">发布账号：{{ currentUser.name }}</view>
      <input v-model="title" class="field-input" placeholder="动态标题" maxlength="24" />
      <input v-model="tag" class="field-input" placeholder="话题标签（如：减脂打卡）" maxlength="12" />

      <textarea
        v-model="content"
        class="textarea"
        placeholder="分享你的训练或饮食动态..."
        maxlength="300"
      />

      <view class="visibility-section">
        <view class="visibility-header">
          <text class="label">可见范围</text>
          <text class="current-choice">{{ selectedVisibility }}</text>
        </view>
        <view class="visibility-options">
          <view
            v-for="(option, index) in visibilityOptions"
            :key="index"
            class="visibility-option"
            :class="{ active: selectedVisibility === option }"
            @click="onVisibilityChange({ detail: { value: index } })"
          >
            <text class="option-emoji">{{ getVisibilityEmoji(option) }}</text>
            <view class="option-content">
              <text class="option-title">{{ option }}</text>
              <text class="option-desc">{{ getVisibilityDesc(option) }}</text>
            </view>
            <text v-if="selectedVisibility === option" class="option-check">✓</text>
          </view>
        </view>
      </view>

      <view class="btn-row">
        <text class="btn primary" @click="publishPost">发布</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { prependPost } from './community-store'

const currentUser = ref({ name: '未登录用户', studentId: '', avatar: '' })
const title = ref('')
const tag = ref('')
const content = ref('')
const visibilityOptions = ['所有人可见', '部分可见', '部分不可见', '私密']
const selectedVisibility = ref('所有人可见')

const getVisibilityEmoji = (option) => {
  const emojis = {
    '所有人可见': '🌐',
    '部分可见': '👥',
    '部分不可见': '🔒',
    '私密': '🔐'
  }
  return emojis[option] || '📝'
}

const getVisibilityDesc = (option) => {
  const descriptions = {
    '所有人可见': '所有用户都可以看到你的动态',
    '部分可见': '只有你关注的用户可以看到',
    '部分不可见': '只有你自己可以看到',
    '私密': '完全私密，只有你能看到'
  }
  return descriptions[option] || ''
}

const loadCurrentUser = () => {
  const saved = uni.getStorageSync('current_user_profile')
  if (saved?.name) {
    currentUser.value = {
      name: saved.name,
      studentId: saved.studentId || '',
      avatar: saved.avatar || saved.name.slice(0, 1)
    }
    return
  }

  const rememberName = uni.getStorageSync('login_remember_name')
  const rememberId = uni.getStorageSync('login_remember_studentId')
  if (rememberName) {
    currentUser.value = {
      name: rememberName,
      studentId: rememberId || '',
      avatar: rememberName.slice(0, 1)
    }
  }
}

onShow(() => {
  loadCurrentUser()
})

const onVisibilityChange = (e) => {
  const index = Number(e.detail.value)
  selectedVisibility.value = visibilityOptions[index]
}

const publishPost = () => {
  if (!currentUser.value.name || currentUser.value.name === '未登录用户') {
    uni.showToast({ title: '请先去登录页认证账号', icon: 'none' })
    return
  }

  if (!title.value.trim() || !content.value.trim()) {
    uni.showToast({ title: '请填写标题和内容', icon: 'none' })
    return
  }

  const post = {
    id: Date.now(),
    user: currentUser.value.name,
    studentId: currentUser.value.studentId,
    avatar: currentUser.value.avatar,
    title: title.value.trim(),
    desc: content.value.trim(),
    tag: tag.value.trim() || '日常分享',
    type: 'recommend',
    likes: 0,
    comments: 0,
    following: false,
    collected: false,
    visibility: selectedVisibility.value,
    createdAt: Date.now()
  }

  prependPost(post)

  uni.showToast({ title: '发布成功', icon: 'success' })
  title.value = ''
  tag.value = ''
  content.value = ''
  selectedVisibility.value = '所有人可见'

  setTimeout(() => {
    uni.navigateBack()
  }, 350)
}
</script>

<style lang="scss" scoped>
$main-blue: #4FA1F2;
$bg-blue: #E3F2FD;

.container {
  min-height: 100vh;
  background: linear-gradient(135deg, $bg-blue 0%, #F0F9FF 100%);
  padding: 20rpx;
}

.editor-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);
}

.account-bar {
  background: #eef7ff;
  color: #3a7fbb;
  border-radius: 14rpx;
  padding: 14rpx 16rpx;
  font-size: 24rpx;
  margin-bottom: 12rpx;
}

.field-input {
  height: 76rpx;
  background: #f6fbff;
  border-radius: 14rpx;
  padding: 0 16rpx;
  font-size: 24rpx;
  margin-bottom: 12rpx;
}

.textarea {
  width: 100%;
  min-height: 280rpx;
  font-size: 26rpx;
  color: #333;
  line-height: 1.6;
}

.visibility-section {
	margin-top: 16rpx;
	padding: 16rpx 0;
	border-top: 1rpx solid #edf3f8;
}

.visibility-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 14rpx;

	.label {
		font-size: 26rpx;
		font-weight: 600;
		color: #333;
	}

	.current-choice {
		font-size: 22rpx;
		background: #4FA1F2;
		color: white;
		padding: 6rpx 14rpx;
		border-radius: 16rpx;
		font-weight: 600;
	}
}

.visibility-options {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.visibility-option {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 12rpx 14rpx;
	background: #f6fbff;
	border: 1rpx solid #e0e6f2;
	border-radius: 12rpx;
	transition: all 0.2s;
	cursor: pointer;

	&.active {
		background: #e3f2fd;
		border-color: #4FA1F2;
		box-shadow: 0 0 8rpx rgba(79, 161, 242, 0.15);
	}

	&:active {
		transform: scale(0.98);
	}

	.option-emoji {
		font-size: 28rpx;
		flex-shrink: 0;
	}

	.option-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2rpx;
	}

	.option-title {
		font-size: 24rpx;
		color: #333;
		font-weight: 600;
	}

	.option-desc {
		font-size: 20rpx;
		color: #999;
	}

	.option-check {
		font-size: 26rpx;
		color: #4FA1F2;
		flex-shrink: 0;
		font-weight: 700;
  }
}

.btn-row {
  margin-top: 20rpx;
  display: flex;
  justify-content: flex-end;
}

.btn.primary {
  padding: 12rpx 30rpx;
  border-radius: 24rpx;
  background: $main-blue;
  color: #fff;
  font-size: 24rpx;
}
</style>