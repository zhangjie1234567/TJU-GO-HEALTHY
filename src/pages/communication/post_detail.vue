<template>
  <view class="container">
    <view class="post-card">
      <view class="post-header">
        <view class="user-info">
          <view class="avatar">{{ post.avatar }}</view>
          <view class="meta">
            <view class="name-row">
              <text class="name">{{ post.user }}</text>
              <text v-if="isOwnPost" class="owner-badge">作者</text>
            </view>
            <text class="tag">#{{ post.tag }}</text>
          </view>
        </view>
        <!-- 如果是自己的帖子，显示删除按钮 -->
        <view v-if="isOwnPost" class="post-menu">
          <text class="menu-btn" @click="showDeleteConfirm">⋮</text>
        </view>
      </view>

      <!-- 可见范围提示 -->
      <view class="visibility-info">
        <text class="visibility-icon" :class="`visibility-${getVisibilityType(post.visibility)}`">
          {{ getVisibilityLabel(post.visibility) }}
        </text>
      </view>

      <view class="post-content">
        <text class="title">{{ post.title }}</text>
        <text class="desc">{{ post.desc }}</text>
      </view>

      <view class="post-stats">
        <text class="stat">🔥 {{ post.likes }} 赞</text>
        <text class="stat">💬 {{ post.comments }} 评论</text>
      </view>

      <view class="post-actions">
        <text class="like-btn" :class="{ active: post.liked }" @click="toggleLike">
          {{ post.liked ? '已点赞' : '点赞' }}
        </text>
      </view>
    </view>

    <view class="comment-card">
      <view class="comment-header">
        <text class="comment-title">评论区</text>
      </view>

      <view v-for="item in commentList" :key="item.id" class="comment-item">
        <view class="comment-main">
          <text class="comment-user">{{ item.user }}</text>
          <text class="comment-text">{{ item.content }}</text>
        </view>
        <text class="reply-btn" @click="replyComment(item)">回复</text>
      </view>

      <view class="input-row">
        <input v-model="commentText" class="comment-input" placeholder="写下你的评论..." />
        <text class="send-btn" @click="sendComment">发送</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref, computed } from 'vue'
import { apiRequest } from '../../utils/request'

const post = ref({
  id: 0,
  user: '社区用户',
  avatar: '🙂',
  title: '动态详情',
  desc: '这里展示动态详情内容。',
  tag: '社区',
  likes: 0,
  comments: 0
})

const commentText = ref('')
const commentList = ref([])
const currentUser = ref({ name: '未登录用户', studentId: '', avatar: '' })

// 判断是否是自己的帖子
const isOwnPost = computed(() => {
  const currentUserId = uni.getStorageSync('current_user_id') || 1
  return post.value.userId === currentUserId
})

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

onLoad(async (options) => {
  loadCurrentUser()
  const postId = Number(options?.id || 0)
  if (!postId) { commentList.value = []; return }
  try {
    const data = await apiRequest({ url: `/api/community/post/${postId}`, method: 'GET' })
    post.value = {
      ...post.value,
      id: data.id,
      userId: data.userId,
      user: `用户${data.userId || ''}`,
      avatar: data.avatar || '🙂',
      title: data.title,
      desc: data.content,
      tag: data.tags || '社区',
      visibility: data.visibility || '所有人可见',
      likes: data.likes || 0,
      comments: data.comments || 0
    }
    commentList.value = (data.comments_list || []).map(c => ({
      id: c.id,
      user: `用户${c.userId}`,
      content: c.content,
      time: c.createTime
    }))
  } catch (e) {
    uni.showToast({ title: '帖子不存在或已被删除', icon: 'none' })
    setTimeout(() => uni.navigateBack({ delta: 1 }), 500)
  }
})

// 获取可见范围的显示标签
const getVisibilityLabel = (visibility) => {
  const labels = {
    '所有人可见': '🌐 公开可见',
    '部分可见': '👥 仅关注者可见',
    '部分不可见': '🔒 仅自己可见',
    '私密': '🔐 私密'
  }
  return labels[visibility] || '公开可见'
}

// 获取可见范围类型
const getVisibilityType = (visibility) => {
  const typeMap = {
    '所有人可见': 'public',
    '部分可见': 'partial',
    '部分不可见': 'private',
    '私密': 'secret'
  }
  return typeMap[visibility] || 'public'
}

const showDeleteConfirm = () => {
  // 再次确认这是自己的帖子
  if (!isOwnPost.value) {
    uni.showToast({ title: '只能删除自己的帖子', icon: 'none' })
    return
  }

  uni.showModal({
    title: '删除帖子',
    content: '确定要删除这篇帖子吗？删除后将不可恢复。',
    confirmText: '删除',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        deletePostFunc()
      }
    }
  })
}

const deletePostFunc = async () => {
  try {
    if (!post.value.id) { uni.showToast({ title: '帖子ID无效', icon: 'none' }); return }
    const userId = uni.getStorageSync('current_user_id') || 1
    await apiRequest({
      url: `/api/community/post/${post.value.id}`,
      method: 'DELETE',
      header: { 'X-User-Id': userId }
    })
    uni.showToast({ title: '帖子已删除', icon: 'success' })
    setTimeout(() => uni.navigateBack({ delta: 1 }), 500)
  } catch (error) {
    console.error('删除帖子失败:', error)
    uni.showToast({ title: '删除失败，请重试', icon: 'none' })
  }
}

const replyComment = (item) => {
  commentText.value = `回复 ${item.user}：`
}

const sendComment = () => {
  const text = commentText.value.trim()
  if (!text) {
    uni.showToast({ title: '请输入评论内容', icon: 'none' })
    return
  }

  commentList.value.unshift({
    id: Date.now(),
    user: currentUser.value.name,
    studentId: currentUser.value.studentId,
    content: text
  })
  post.value.comments += 1
  commentText.value = ''
  uni.showToast({ title: '评论成功', icon: 'success' })
}

const toggleLike = () => {
  const liked = Boolean(post.value.liked)
  post.value.liked = !liked
  post.value.likes = Math.max(0, Number(post.value.likes || 0) + (post.value.liked ? 1 : -1))

  uni.showToast({ title: post.value.liked ? '已点赞' : '已取消点赞', icon: 'none' })
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

.post-card,
.comment-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 18rpx;
  box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);
}

.post-card {
  margin-bottom: 16rpx;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 10rpx;
  position: relative;
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex: 1;
  min-width: 0;
}

.avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  line-height: 56rpx;
  text-align: center;
  background: #eaf5ff;
  flex-shrink: 0;
  font-size: 28rpx;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
  flex: 1;
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.name {
  font-size: 25rpx;
  color: #333;
  font-weight: 600;
}

.owner-badge {
  font-size: 18rpx;
  background: #4FA1F2;
  color: white;
  padding: 2rpx 8rpx;
  border-radius: 10rpx;
  font-weight: 500;
}

.tag {
  font-size: 20rpx;
  color: #4a7eaf;
}

.post-menu {
  display: flex;
  align-items: center;
  margin-left: auto;
  padding-left: 16rpx;
}

.menu-btn {
  font-size: 32rpx;
  color: #999;
  padding: 8rpx;
  cursor: pointer;
  transition: all 0.2s;

  &:active {
    transform: scale(0.9);
    color: #333;
  }
}

.visibility-info {
  margin: 12rpx 0;
  padding: 10rpx 14rpx;
  border-radius: 10rpx;
  background: #f5f8fc;
}

.visibility-icon {
  font-size: 22rpx;
  font-weight: 500;
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
  display: inline-block;

  &.visibility-public {
    background: #e8f5e9;
    color: #2e7d32;
  }

  &.visibility-partial {
    background: #e3f2fd;
    color: #1565c0;
  }

  &.visibility-private {
    background: #fff3e0;
    color: #e65100;
  }

  &.visibility-secret {
    background: #fce4ec;
    color: #c2185b;
  }
}

.name {
  font-size: 25rpx;
  color: #333;
  font-weight: 600;
}

.tag {
  font-size: 20rpx;
  color: #4a7eaf;
}

.post-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  margin-bottom: 10rpx;
}

.title {
  font-size: 30rpx;
  color: #2f2f2f;
  font-weight: 700;
}

.desc {
  font-size: 24rpx;
  color: #687b8d;
  line-height: 1.6;
}

.post-stats {
  display: flex;
  gap: 16rpx;

  .stat {
    font-size: 22rpx;
    color: #7c8a97;
  }
}

.post-actions {
  margin-top: 12rpx;
}

.like-btn {
  display: inline-block;
  font-size: 22rpx;
  color: #4f8bc8;
  background: #eef7ff;
  border-radius: 14rpx;
  padding: 8rpx 16rpx;

  &.active {
    background: #ff6b81;
    color: #fff;
  }
}

.comment-header {
  margin-bottom: 10rpx;
}

.comment-title {
  font-size: 28rpx;
  color: #2f2f2f;
  font-weight: 700;
}

.comment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1rpx solid #eef4f9;
  padding: 14rpx 0;
}

.comment-main {
  flex: 1;
  margin-right: 12rpx;
}

.comment-user {
  display: block;
  font-size: 24rpx;
  color: #335b7f;
  margin-bottom: 4rpx;
}

.comment-text {
  font-size: 23rpx;
  color: #607486;
}

.reply-btn {
  font-size: 22rpx;
  color: $main-blue;
  background: #eef7ff;
  border-radius: 16rpx;
  padding: 6rpx 14rpx;
}

.input-row {
  margin-top: 14rpx;
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.comment-input {
  flex: 1;
  background: #f6fbff;
  border-radius: 16rpx;
  height: 70rpx;
  padding: 0 16rpx;
  font-size: 24rpx;
}

.send-btn {
  background: $main-blue;
  color: #fff;
  border-radius: 16rpx;
  font-size: 22rpx;
  padding: 12rpx 16rpx;
}
</style>