<template>
	<view class="container">
		<view class="search-box">
			<view class="search-bar">
				<text class="search-icon">🔍</text>
				<input
					v-model="searchText"
					type="text"
					class="search-input"
					placeholder="搜索知识/动态关键词"
				/>
				<text v-if="searchText" class="clear-icon" @click="searchText = ''">✕</text>
			</view>
		</view>

		<view class="entry-row">
			<view class="entry-card" @click="goTo('/pages/communication/method_rank')">
				<text class="entry-icon">🏅</text>
				<text class="entry-title">减重方法评分榜</text>
			</view>
			<view class="entry-card" @click="goTo('/pages/communication/user_rank')">
				<text class="entry-icon">📊</text>
				<text class="entry-title">用户排行榜</text>
			</view>
		</view>

		<view class="quick-grid">
			<view class="quick-item" @click="goTo('/pages/communication/recruit')">
				<text class="quick-icon">🤝</text>
				<text class="quick-text">健康搭子招募</text>
			</view>
			<view class="quick-item" @click="goTo('/pages/communication/messages')">
				<text class="quick-icon">💬</text>
				<text class="quick-text">消息</text>
			</view>
			<view class="quick-item" @click="goTo('/pages/communication/publish')">
				<text class="quick-icon">✍️</text>
				<text class="quick-text">发布</text>
			</view>
		</view>

		<view class="tab-bar">
			<view class="tab-item" :class="{ active: currentTab === 'recommend' }" @click="currentTab = 'recommend'">推荐</view>
			<view class="tab-item" :class="{ active: currentTab === 'follow' }" @click="currentTab = 'follow'">关注</view>
		</view>

		<view v-if="filteredPosts.length === 0" class="empty-state">
			<text class="empty-icon">📭</text>
			<text class="empty-text">没有找到符合条件的动态</text>
		</view>

		<view v-for="item in filteredPosts" :key="item.id" class="post-card" @click="openDetail(item)">
			<view class="post-header">
				<view class="user-area">
					<view class="avatar">{{ item.avatar }}</view>
					<view class="user-meta">
						<text class="nickname">{{ item.user }}</text>
						<text class="post-tag">#{{ item.tag }}</text>
					</view>
				</view>
				<view class="header-right">
					<view v-if="canSeePost(item)" class="visibility-badge" :class="getVisibilityClass(item.visibility)">
						{{ getVisibilityLabel(item.visibility) }}
					</view>
					<!-- 如果是自己的帖子，显示删除按钮 -->
					<text v-if="isOwnPost(item)" class="delete-btn" @click.stop="showDeleteConfirm(item)">
						🗑️ 删除
					</text>
					<!-- 否则显示关注按钮 -->
					<text v-else class="follow-btn" :class="{ following: item.following }" @click.stop="toggleFollow(item.id)">
						{{ item.following ? '已关注' : '+关注' }}
					</text>
				</view>
			</view>

			<view class="post-content">
				<text class="post-title">{{ item.title }}</text>
				<text class="post-desc">{{ item.desc }}</text>
			</view>

			<view class="post-stats">
				<text class="stat">🔥 {{ item.likes }} 赞</text>
				<text class="stat">💬 {{ item.comments }} 评论</text>
			</view>

			<view class="post-actions">
				<text class="action-btn" :class="{ liked: item.liked }" @click.stop="toggleLike(item.id)">
					{{ item.liked ? '已点赞' : '点赞' }}
				</text>
				<text class="action-btn" @click.stop="sharePost(item)">分享</text>
				<text class="action-btn" @click.stop="privateChat(item)">私聊</text>
				<text class="action-btn" :class="{ collected: item.collected }" @click.stop="toggleCollect(item.id)">
					{{ item.collected ? '已收藏' : '收藏' }}
				</text>
			</view>
		</view>

		<view style="height: 120rpx;"></view>
	</view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { getPosts, savePosts } from './community-store'
import { getCollections, saveCollections } from '../my/my-store'

const searchText = ref('')
const currentTab = ref('recommend')
const currentUser = ref({ name: '未登录用户', studentId: '', avatar: '' })

const posts = ref([])

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

const loadPosts = () => {
	const list = getPosts()
	posts.value = list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

onShow(() => {
	loadCurrentUser()
	loadPosts()
})

// 检查当前用户是否能看到该帖子
const canSeePost = (post) => {
	const visibility = post.visibility || '所有人可见'
	const isOwnPost = post.user === currentUser.value.name
	
	switch (visibility) {
		case '所有人可见':
			return true
		case '部分可见':
			// 发布者、关注者能看到
			return isOwnPost || post.following
		case '部分不可见':
			// 只有发布者能看到
			return isOwnPost
		case '私密':
			// 只有发布者能看到
			return isOwnPost
		default:
			return true
	}
}

// 获取可见范围的显示标签
const getVisibilityLabel = (visibility) => {
	const labels = {
		'所有人可见': '🌐 公开',
		'部分可见': '👥 部分可见',
		'部分不可见': '🔒 仅自己',
		'私密': '🔐 私密'
	}
	return labels[visibility] || '公开'
}

// 获取可见范围的样式类
const getVisibilityClass = (visibility) => {
	const classMap = {
		'所有人可见': 'visibility-public',
		'部分可见': 'visibility-partial',
		'部分不可见': 'visibility-private',
		'私密': 'visibility-secret'
	}
	return classMap[visibility] || 'visibility-public'
}

const filteredPosts = computed(() => {
	let result = posts.value
		.filter(item => item.type === currentTab.value)
		.filter(item => canSeePost(item))
	
	const keyword = searchText.value.trim()
	if (!keyword) return result

	result = result.filter(item =>
		item.title.includes(keyword) || item.desc.includes(keyword) || item.tag.includes(keyword)
	)
	return result
})

const goTo = (url) => {
	uni.navigateTo({ url })
}

const toggleFollow = (id) => {
	const target = posts.value.find(item => item.id === id)
	if (!target) return
	target.following = !target.following
	savePosts(posts.value)
	uni.showToast({
		title: target.following ? '已关注' : '已取消关注',
		icon: 'none'
	})
}

const toggleCollect = (id) => {
	const target = posts.value.find(item => item.id === id)
	if (!target) return
	
	// 更新该帖子的 collected 状态
	target.collected = !target.collected
	savePosts(posts.value)

	// 同时更新"我的收藏"中的数据
	const collections = getCollections()
	
	if (target.collected) {
		// 添加到收藏 - 添加到"动态"分类
		const postItem = {
			id: target.id,
			name: target.title,
			desc: target.desc,
			tag: target.tag,
			user: target.user,
			avatar: target.avatar,
			savedAt: Date.now()
		}
		
		// 如果动态分类不存在，则创建
		if (!collections.posts) {
			collections.posts = []
		}
		
		// 检查是否已经存在，避免重复
		if (!collections.posts.find(item => item.id === postItem.id)) {
			collections.posts.unshift(postItem)
		}
	} else {
		// 从收藏中删除 - 从"动态"分类中删除
		if (collections.posts) {
			collections.posts = collections.posts.filter(item => item.id !== id)
		}
	}
	
	saveCollections(collections)
	
	uni.showToast({
		title: target.collected ? '已收藏' : '已取消收藏',
		icon: 'none'
	})
}

const toggleLike = (id) => {
	const target = posts.value.find(item => item.id === id)
	if (!target) return

	const liked = Boolean(target.liked)
	target.liked = !liked
	target.likes = Math.max(0, Number(target.likes || 0) + (target.liked ? 1 : -1))
	savePosts(posts.value)
	uni.showToast({
		title: target.liked ? '已点赞' : '已取消点赞',
		icon: 'none'
	})
}

const sharePost = () => {
	uni.showToast({ title: '已触发分享', icon: 'none' })
}

const privateChat = (item) => {
	uni.navigateTo({
		url: `/pages/communication/chat_detail?name=${encodeURIComponent(item.user)}&avatar=${encodeURIComponent(item.avatar || '🙂')}`
	})
}

// 检查是否是自己的帖子
const isOwnPost = (item) => {
	return item.user === currentUser.value.name
}

// 显示删除确认
const showDeleteConfirm = (item) => {
	uni.showModal({
		title: '删除帖子',
		content: '确定要删除这篇帖子吗？删除后将不可恢复。',
		confirmText: '删除',
		cancelText: '取消',
		success: (res) => {
			if (res.confirm) {
				deleteListPost(item.id)
			}
		}
	})
}

// 删除列表中的帖子
const deleteListPost = (id) => {
	try {
		posts.value = posts.value.filter(item => item.id !== id)
		savePosts(posts.value)
		// 同时删除评论数据
		uni.removeStorageSync(`community_comments_${id}`)
		uni.showToast({
			title: '帖子已删除',
			icon: 'success'
		})
	} catch (error) {
		console.error('删除失败:', error)
		uni.showToast({
			title: '删除失败，请重试',
			icon: 'none'
		})
	}
}

const openDetail = (item) => {
	uni.navigateTo({
		url: `/pages/communication/post_detail?id=${item.id}`
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

.search-box {
	margin-bottom: 20rpx;

	.search-bar {
		height: 80rpx;
		border-radius: 50rpx;
		background: #fff;
		display: flex;
		align-items: center;
		gap: 12rpx;
		padding: 0 24rpx;
		box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.15);

		.search-icon {
			font-size: 30rpx;
		}

		.search-input {
			flex: 1;
			font-size: 28rpx;
		}

		.clear-icon {
			color: #999;
			font-size: 26rpx;
		}
	}
}

.entry-row {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16rpx;
	margin-bottom: 16rpx;

	.entry-card {
		background: #fff;
		border-radius: 20rpx;
		padding: 20rpx;
		box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);

		.entry-icon {
			font-size: 34rpx;
			display: block;
			margin-bottom: 8rpx;
		}

		.entry-title {
			font-size: 26rpx;
			color: #333;
			font-weight: 600;
		}
	}
}

.quick-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 12rpx;
	margin-bottom: 20rpx;

	.quick-item {
		background: rgba(255, 255, 255, 0.95);
		border-radius: 16rpx;
		padding: 16rpx 8rpx;
		text-align: center;
		border: 1rpx solid rgba(79, 161, 242, 0.15);

		.quick-icon {
			font-size: 30rpx;
			display: block;
			margin-bottom: 6rpx;
		}

		.quick-text {
			font-size: 22rpx;
			color: #2b5f91;
			font-weight: 500;
		}
	}
}

.tab-bar {
	display: flex;
	gap: 14rpx;
	margin-bottom: 16rpx;

	.tab-item {
		flex: 1;
		text-align: center;
		padding: 14rpx 0;
		font-size: 26rpx;
		color: #5f7f9b;
		background: #fff;
		border-radius: 14rpx;

		&.active {
			color: #fff;
			background: $main-blue;
			font-weight: 600;
		}
	}
}

.post-card {
	background: #fff;
	border-radius: 20rpx;
	padding: 18rpx;
	margin-bottom: 16rpx;
	box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);
}

.post-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12rpx;
	gap: 12rpx;
}

.user-area {
	display: flex;
	align-items: center;
	gap: 12rpx;
	flex: 1;
	min-width: 0;
}

.header-right {
	display: flex;
	align-items: center;
	gap: 8rpx;
	flex-shrink: 0;
}

.visibility-badge {
	font-size: 20rpx;
	padding: 4rpx 10rpx;
	border-radius: 12rpx;
	white-space: nowrap;
	font-weight: 500;

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

.avatar {
	width: 58rpx;
	height: 58rpx;
	border-radius: 50%;
	background: #EAF5FF;
	text-align: center;
	line-height: 58rpx;
	font-size: 30rpx;
}

.user-meta {
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.nickname {
	font-size: 26rpx;
	color: #333;
	font-weight: 600;
}

.post-tag {
	font-size: 20rpx;
	color: #4f8bc8;
}

.follow-btn {
	padding: 8rpx 16rpx;
	background: #e9f4ff;
	border-radius: 20rpx;
	color: #3c7fb8;
	font-size: 22rpx;

	&.following {
		background: #f0f0f0;
		color: #888;
	}
}

.delete-btn {
	padding: 8rpx 16rpx;
	background: #ffe9e9;
	border-radius: 20rpx;
	color: #c85252;
	font-size: 22rpx;
	font-weight: 600;
	transition: all 0.2s;

	&:active {
		background: #ffd4d4;
		transform: scale(0.95);
	}
}

.post-content {
	display: flex;
	flex-direction: column;
	gap: 8rpx;
	margin-bottom: 12rpx;
}

.post-title {
	font-size: 28rpx;
	font-weight: 700;
	color: #2f2f2f;
}

.post-desc {
	font-size: 24rpx;
	color: #666;
	line-height: 1.5;
}

.post-stats {
	display: flex;
	gap: 20rpx;
	margin-bottom: 12rpx;

	.stat {
		font-size: 22rpx;
		color: #7b8a98;
	}
}

.post-actions {
	display: flex;
	justify-content: space-between;

	.action-btn {
		flex: 1;
		text-align: center;
		font-size: 24rpx;
		color: #4f8bc8;
		padding: 10rpx 0;
		border-radius: 12rpx;
		background: #f6fbff;
		margin-right: 10rpx;

		&:last-child {
			margin-right: 0;
		}

		&.collected {
			color: #fff;
			background: #4FA1F2;
		}

		&.liked {
			color: #fff;
			background: #ff6b81;
		}
	}
}

.empty-state {
	background: #fff;
	border-radius: 20rpx;
	padding: 40rpx 20rpx;
	text-align: center;

	.empty-icon {
		font-size: 52rpx;
		display: block;
		margin-bottom: 10rpx;
	}

	.empty-text {
		font-size: 24rpx;
		color: #8f99a2;
	}
}
</style>
