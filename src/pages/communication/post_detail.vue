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

      <view v-for="item in threadedComments" :key="item.id" class="comment-item">
        <view class="comment-main">
          <text class="comment-user">{{ item.user }}</text>
          <text class="comment-text">{{ item.content }}</text>
        </view>
        <view class="comment-actions">
          <text class="comment-like-btn" :class="{ active: item.liked }" @click="toggleCommentLike(item)">
            {{ item.liked ? `已赞 ${item.likes}` : `点赞 ${item.likes}` }}
          </text>
          <text class="reply-btn" @click="replyComment(item)">回复</text>
          <text v-if="item.canDelete" class="comment-delete-btn" @click="deleteComment(item)">删除</text>
        </view>

        <view v-if="item.replies && item.replies.length" class="reply-list">
          <view v-for="reply in item.replies" :key="reply.id" class="reply-item">
            <view class="comment-main">
              <text class="comment-user">{{ reply.user }}</text>
              <text class="comment-text">{{ reply.content }}</text>
            </view>
            <view class="comment-actions">
              <text class="comment-like-btn" :class="{ active: reply.liked }" @click="toggleCommentLike(reply)">
                {{ reply.liked ? `已赞 ${reply.likes}` : `点赞 ${reply.likes}` }}
              </text>
              <text class="reply-btn" @click="replyComment(reply)">回复</text>
              <text v-if="reply.canDelete" class="comment-delete-btn" @click="deleteComment(reply)">删除</text>
            </view>
          </view>
        </view>
      </view>

      <view v-if="replyTarget" class="replying-tip">
        <text>正在回复 {{ replyTarget.user }}：</text>
        <text class="cancel-reply" @click="clearReplyTarget">取消</text>
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
import { getAuthHeaders, handleAuthError } from './auth-helper'

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
const replyTarget = ref(null)

const getCurrentUserId = () => Number(uni.getStorageSync('current_user_id') || 0)

// 判断是否是自己的帖子
const isOwnPost = computed(() => {
  const currentUserId = Number(uni.getStorageSync('current_user_id') || 0)
  return post.value.userId === currentUserId
})

const threadedComments = computed(() => {
  const list = commentList.value || []
  const topLevel = list
    .filter(item => !item.parentId)
    .map(item => ({ ...item, replies: [] }))

  const topMap = new Map(topLevel.map(item => [item.id, item]))
  list
    .filter(item => Boolean(item.parentId))
    .forEach(item => {
      const parent = topMap.get(Number(item.parentId))
      if (parent) {
        parent.replies.push({ ...item })
      } else {
        topLevel.push({ ...item, replies: [] })
      }
    })

  return topLevel
})

const loadCurrentUser = () => {
  const rawSaved = uni.getStorageSync('current_user_profile')
  let saved = rawSaved
  if (typeof rawSaved === 'string') {
    try {
      saved = JSON.parse(rawSaved || '{}')
    } catch (e) {
      saved = null
    }
  }
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
    const data = await apiRequest({ url: `/api/community/post/${postId}`, method: 'GET', header: getAuthHeaders() })
    post.value = {
      ...post.value,
      id: data.id,
      userId: data.userId,
      user: data.userName || (data.userId ? `用户${data.userId}` : '社区用户'),
      avatar: data.avatar || '🙂',
      title: data.title,
      desc: data.content,
      tag: data.tags || '社区',
      visibility: data.visibility || '所有人可见',
      likes: data.likeCount || data.likes || 0,
      comments: data.commentCount || data.comments || 0,
      liked: Boolean(data.liked)
    }
    commentList.value = (data.comments_list || []).map(c => ({
      id: c.id,
      userId: c.userId,
      user: c.userName || `用户${c.userId}`,
      content: c.content,
      parentId: c.parentId ? Number(c.parentId) : null,
      time: c.createTime,
      likes: Number(c.likeCount || 0),
      liked: Boolean(c.liked),
      canDelete: Boolean(c.canDelete)
    }))
  } catch (e) {
    if (handleAuthError(e)) {
      setTimeout(() => uni.navigateBack({ delta: 1 }), 500)
      return
    }
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
    await apiRequest({
      url: `/api/community/post/${post.value.id}`,
      method: 'DELETE',
      header: getAuthHeaders()
    })
    uni.showToast({ title: '帖子已删除', icon: 'success' })
    setTimeout(() => uni.navigateBack({ delta: 1 }), 500)
  } catch (error) {
    if (handleAuthError(error)) return
    console.error('删除帖子失败:', error)
    uni.showToast({ title: '删除失败，请重试', icon: 'none' })
  }
}

const replyComment = (item) => {
  replyTarget.value = {
    id: item.id,
    user: item.user,
    userId: item.userId
  }
  commentText.value = ''
}

const clearReplyTarget = () => {
  replyTarget.value = null
}

const sendComment = async () => {
  const text = commentText.value.trim()
  if (!text) {
    uni.showToast({ title: '请输入评论内容', icon: 'none' })
    return
  }

  try {
    const res = await apiRequest({
      url: `/api/community/post/${post.value.id}/comment`,
      method: 'POST',
      header: getAuthHeaders(),
      data: {
        content: text,
        parentId: replyTarget.value?.id || null
      }
    })

    const newComment = res?.comment
    if (newComment) {
      commentList.value.unshift({
        id: newComment.id,
        userId: newComment.userId,
        user: currentUser.value.name || `用户${newComment.userId}`,
        content: newComment.content,
        parentId: newComment.parentId ? Number(newComment.parentId) : null,
        time: newComment.createTime,
        likes: Number(newComment.likeCount || 0),
        liked: false,
        canDelete: true
      })
    }

    post.value.comments = Number(res?.commentCount ?? (post.value.comments + 1))
    commentText.value = ''
    clearReplyTarget()
    uni.showToast({ title: '评论成功', icon: 'success' })
  } catch (error) {
    if (handleAuthError(error)) return
    console.error('评论失败', error)
    uni.showToast({ title: '评论失败，请重试', icon: 'none' })
  }
}

const toggleLike = async () => {
  try {
    const res = await apiRequest({
      url: `/api/community/post/${post.value.id}/like`,
      method: 'POST',
      header: getAuthHeaders()
    })

    post.value.liked = Boolean(res?.liked)
    post.value.likes = Number(res?.likeCount ?? post.value.likes ?? 0)
    uni.showToast({ title: post.value.liked ? '已点赞' : '已取消点赞', icon: 'none' })
  } catch (error) {
    if (handleAuthError(error)) return
    console.error('点赞失败', error)
    uni.showToast({ title: '点赞失败，请重试', icon: 'none' })
  }
}

const toggleCommentLike = async (item) => {
  try {
    const res = await apiRequest({
      url: `/api/community/comment/${item.id}/like`,
      method: 'POST',
      header: getAuthHeaders()
    })
    const nextLiked = Boolean(res?.liked)
    const nextLikeCount = Number(res?.likeCount ?? item.likes ?? 0)
    commentList.value = (commentList.value || []).map(comment => {
      if (comment.id !== item.id) return comment
      return {
        ...comment,
        liked: nextLiked,
        likes: nextLikeCount
      }
    })
    uni.showToast({ title: nextLiked ? '评论已点赞' : '已取消评论点赞', icon: 'none' })
  } catch (error) {
    if (handleAuthError(error)) return
    console.error('评论点赞失败', error)
    uni.showToast({ title: '操作失败，请重试', icon: 'none' })
  }
}

const deleteComment = (item) => {
  uni.showModal({
    title: '删除评论',
    content: '确定删除这条评论吗？',
    success: async (res) => {
      if (!res.confirm) return
      try {
        const data = await apiRequest({
          url: `/api/community/comment/${item.id}`,
          method: 'DELETE',
          header: getAuthHeaders()
        })
        commentList.value = commentList.value.filter(comment => comment.id !== item.id)
        if (replyTarget.value?.id === item.id) {
          clearReplyTarget()
        }
        post.value.comments = Number(data?.commentCount ?? Math.max(0, Number(post.value.comments || 0) - 1))
        uni.showToast({ title: '评论已删除', icon: 'success' })
      } catch (error) {
        if (handleAuthError(error)) return
        console.error('删除评论失败', error)
        uni.showToast({ title: '删除失败，请重试', icon: 'none' })
      }
    }
  })
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

.replying-tip {
  margin-bottom: 10rpx;
  font-size: 22rpx;
  color: #5a7891;
  background: #f2f8ff;
  border-radius: 12rpx;
  padding: 8rpx 12rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cancel-reply {
  color: #e06666;
}

.comment-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.comment-actions {
  display: flex;
  align-items: center;
  gap: 10rpx;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.comment-like-btn {
  font-size: 21rpx;
  color: #4f8bc8;
  background: #eef7ff;
  border-radius: 16rpx;
  padding: 6rpx 12rpx;

  &.active {
    background: #ffebef;
    color: #e44b68;
  }
}

.reply-btn {
  font-size: 22rpx;
  color: $main-blue;
  background: #eef7ff;
  border-radius: 16rpx;
  padding: 6rpx 14rpx;
}

.comment-delete-btn {
  font-size: 22rpx;
  color: #dd4a4a;
  background: #fff2f2;
  border-radius: 16rpx;
  padding: 6rpx 12rpx;
}

.reply-list {
  margin-top: 10rpx;
  margin-left: 24rpx;
  border-left: 2rpx solid #eaf1f7;
  padding-left: 12rpx;
}

.reply-item {
  padding: 10rpx 0;
  border-bottom: 1rpx dashed #edf3f8;

  &:last-child {
    border-bottom: 0;
  }
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