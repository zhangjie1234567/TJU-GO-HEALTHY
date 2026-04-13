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

        <view
          v-if="selectedVisibility === '部分可见' || selectedVisibility === '部分不可见'"
          class="related-users"
        >
          <view class="related-users-title">
            {{ selectedVisibility === '部分可见' ? '选择可见用户' : '选择不可见用户' }}
          </view>
          <view class="related-users-hint">
            用户来源：关注你 + 你关注
          </view>
          <view v-if="loadingRelatedUsers" class="related-users-empty">正在加载用户...</view>
          <view v-else-if="relatedUsers.length === 0" class="related-users-empty">
            暂无可选用户，请先去社区关注同学
          </view>
          <view v-else class="user-list">
            <view
              v-for="item in relatedUsers"
              :key="item.userId"
              class="user-item"
              :class="{ active: isUserSelected(item.userId) }"
              @click="toggleUserSelection(item.userId)"
            >
              <view class="user-main">
                <text class="user-name">{{ item.name || `用户${item.userId}` }}</text>
                <text v-if="getRelationLabel(item)" class="relation-tag">{{ getRelationLabel(item) }}</text>
              </view>
              <text class="select-mark">{{ isUserSelected(item.userId) ? '已选择' : '选择' }}</text>
            </view>
          </view>
          <view class="selected-count">
            已选择 {{ selectedVisibility === '部分可见' ? selectedVisibleUserIds.length : selectedHiddenUserIds.length }} 人
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
import { apiRequest } from '../../utils/request'
import { getAuthHeaders, getAuthToken, handleAuthError } from './auth-helper'

const currentUser = ref({ name: '未登录用户', studentId: '', avatar: '' })
const title = ref('')
const tag = ref('')
const content = ref('')
const visibilityOptions = ['所有人可见', '部分可见', '部分不可见', '私密']
const selectedVisibility = ref('所有人可见')
const relatedUsers = ref([])
const loadingRelatedUsers = ref(false)
const selectedVisibleUserIds = ref([])
const selectedHiddenUserIds = ref([])

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
    '部分可见': '仅你选中的用户可以看到',
    '部分不可见': '你选中的用户将看不到',
    '私密': '完全私密，只有你能看到'
  }
  return descriptions[option] || ''
}

const getRelationLabel = (user) => {
  if (user.isFollowing && user.isFollower) return '互相关注'
  if (user.isFollowing) return '你关注了TA'
  if (user.isFollower) return 'TA关注了你'
  return ''
}

const loadRelatedUsers = async () => {
  if (!getAuthToken()) {
    relatedUsers.value = []
    return
  }
  loadingRelatedUsers.value = true
  try {
    const res = await apiRequest({
      url: '/api/community/follow/related-users',
      method: 'GET',
      header: getAuthHeaders()
    })
    relatedUsers.value = Array.isArray(res) ? res : []
  } catch (e) {
    if (!handleAuthError(e)) {
      console.error('加载相关用户失败', e)
    }
    relatedUsers.value = []
  } finally {
    loadingRelatedUsers.value = false
  }
}

const isUserSelected = (userId) => {
  const list = selectedVisibility.value === '部分可见'
    ? selectedVisibleUserIds.value
    : selectedHiddenUserIds.value
  return list.includes(userId)
}

const toggleUserSelection = (userId) => {
  const target = selectedVisibility.value === '部分可见'
    ? selectedVisibleUserIds.value
    : selectedHiddenUserIds.value
  const index = target.indexOf(userId)
  if (index >= 0) {
    target.splice(index, 1)
  } else {
    target.push(userId)
  }
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
  loadRelatedUsers()
})

const onVisibilityChange = (e) => {
  const index = Number(e.detail.value)
  selectedVisibility.value = visibilityOptions[index]
}

const publishPost = async () => {
  if (!getAuthToken()) {
    uni.showToast({ title: '请先去登录页认证账号', icon: 'none' })
    return
  }
  if (!title.value.trim() || !content.value.trim()) {
    uni.showToast({ title: '请填写标题和内容', icon: 'none' })
    return
  }
  if (selectedVisibility.value === '部分可见' && selectedVisibleUserIds.value.length === 0) {
    uni.showToast({ title: '请至少选择1位可见用户', icon: 'none' })
    return
  }
  if (selectedVisibility.value === '部分不可见' && selectedHiddenUserIds.value.length === 0) {
    uni.showToast({ title: '请至少选择1位不可见用户', icon: 'none' })
    return
  }
  uni.showLoading({ title: '发布中...' })
  try {
    await apiRequest({
      url: '/api/community/post',
      method: 'POST',
      data: {
        title: title.value.trim(),
        content: content.value.trim(),
        tag: tag.value.trim() || '日常分享',
        visibility: selectedVisibility.value,
        visibleUserIds: selectedVisibility.value === '部分可见' ? selectedVisibleUserIds.value : [],
        hiddenUserIds: selectedVisibility.value === '部分不可见' ? selectedHiddenUserIds.value : []
      },
      header: getAuthHeaders()
    })
    uni.hideLoading()
    uni.showToast({ title: '发布成功', icon: 'success' })
    title.value = ''
    tag.value = ''
    content.value = ''
    selectedVisibility.value = '所有人可见'
    selectedVisibleUserIds.value = []
    selectedHiddenUserIds.value = []
    setTimeout(() => uni.navigateBack(), 350)
  } catch (e) {
    uni.hideLoading()
    if (handleAuthError(e)) return
    uni.showToast({ title: '发布失败，请重试', icon: 'none' })
    console.error('发布帖子失败', e)
  }
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

.related-users {
  margin-top: 14rpx;
  padding: 14rpx;
  border-radius: 12rpx;
  background: #f7fbff;
  border: 1rpx solid #dcecf9;
}

.related-users-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #2f5f8b;
}

.related-users-hint {
  margin-top: 4rpx;
  font-size: 20rpx;
  color: #7d97ad;
}

.related-users-empty {
  margin-top: 12rpx;
  font-size: 22rpx;
  color: #8ca0b3;
}

.user-list {
  margin-top: 10rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12rpx;
  border-radius: 10rpx;
  background: #ffffff;
  border: 1rpx solid #e0ecf6;

  &.active {
    border-color: #4FA1F2;
    background: #eaf5ff;
  }
}

.user-main {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.user-name {
  font-size: 23rpx;
  color: #31485f;
}

.relation-tag {
  font-size: 18rpx;
  color: #4f85b8;
  background: #e9f4ff;
  padding: 3rpx 8rpx;
  border-radius: 999rpx;
}

.select-mark {
  font-size: 20rpx;
  color: #4FA1F2;
  font-weight: 600;
}

.selected-count {
  margin-top: 10rpx;
  font-size: 21rpx;
  color: #4f85b8;
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