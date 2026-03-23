<template>
	<view class="container">
		<!-- 分类标签栏 -->
		<view class="category-scroll">
			<scroll-view scroll-x="true" class="category-tabs">
				<view
					v-for="cat in categories"
					:key="cat.key"
					class="category-tab"
					:class="{ active: currentCategory === cat.key }"
					@click="currentCategory = cat.key"
				>
					<text class="cat-emoji">{{ cat.label.split(' ')[0] }}</text>
					<text class="cat-label">{{ cat.label.split(' ')[1] }}</text>
					<text class="cat-count">({{ getCollectionCount(cat.key) }})</text>
				</view>
			</scroll-view>
		</view>

		<!-- 收藏列表 -->
		<view class="collection-list">
			<view v-if="currentCollections.length > 0">
				<view
					v-for="(item, index) in currentCollections"
					:key="index"
					class="collection-card"
				>
					<view class="card-header">
						<text class="item-icon">{{ getItemIcon(item) }}</text>
						<view class="card-info">
							<text class="item-name">{{ item.name }}</text>
							<text class="item-time">{{ formatTime(item.savedAt) }}</text>
						</view>
					</view>

					<view v-if="item.desc" class="item-desc">{{ item.desc }}</view>

					<view class="item-actions">
						<text class="action-btn" @click="viewItem(item, index)">查看</text>
						<text class="action-btn danger" @click="removeCollection(index)">删除</text>
					</view>
				</view>
			</view>

			<view v-else class="empty-state">
				<text class="empty-icon">📭</text>
				<text class="empty-text">暂无{{ getCategoryLabel() }}收藏</text>
				<text class="empty-hint">浏览应用功能时点击"收藏"添加</text>
			</view>
		</view>

		<view style="height: 60rpx;"></view>
	</view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { ref, computed } from 'vue'
import { getCollections, removeCollection as removeCollectionApi } from './my-store'
import { getPosts, savePosts } from '../communication/community-store'

const currentCategory = ref('posts')
const collections = ref(null)

const categories = [
	{ key: 'restaurants', label: '🍽 餐厅' },
	{ key: 'recipes', label: '🍳 食谱' },
	{ key: 'drinks', label: '🥤 饮品' },
	{ key: 'courses', label: '📚 课程' },
	{ key: 'knowledge', label: '🧠 知识' },
	{ key: 'posts', label: '📰 动态' }
]

const currentCollections = computed(() => {
	if (!collections.value) return []
	return collections.value[currentCategory.value] || []
})

const loadData = async () => {
	collections.value = await getCollections()
}

const getCollectionCount = (key) => {
	if (!collections.value) return 0
	return (collections.value[key] || []).length
}

const getCategoryLabel = () => {
	const cat = categories.find(c => c.key === currentCategory.value)
	return cat ? cat.label.split(' ')[1] : '该分类的'
}

const getItemIcon = (item) => {
	if (item.icon) return item.icon
	return '📰'
}

const formatTime = (time) => {
	if (!time) return '最近'
	const date = new Date(time)
	const now = new Date()
	const diff = now - date

	if (diff < 3600000) {
		return Math.floor(diff / 60000) + '分钟前'
	} else if (diff < 86400000) {
		return Math.floor(diff / 3600000) + '小时前'
	} else if (diff < 604800000) {
		return Math.floor(diff / 86400000) + '天前'
	} else {
		return date.toLocaleDateString()
	}
}

const viewItem = (item, index) => {
	uni.showModal({
		title: item.name,
		content: item.desc || '暂无描述',
		confirmText: '确定',
		success() {
			//
		}
	})
}

const removeCollection = (index) => {
	const item = currentCollections.value[index]
	
	uni.showModal({
		title: '删除收藏',
		content: '确定要删除此项收藏吗？',
		async success(res) {
			if (res.confirm) {
				const deleted = await removeCollectionApi(currentCategory.value, item.itemId || item.id, item.collectionId)
				if (!deleted) return

				// 直接操作 collections.value（原始 ref），而不是 computed 值
				const list = collections.value[currentCategory.value]
				if (Array.isArray(list)) {
					list.splice(index, 1)
				}

				// 如果是删除的是动态收藏，同时更新社区中该帖子的 collected 状态
				if (currentCategory.value === 'posts' && item.id) {
					const posts = getPosts()
					const targetPost = posts.find(p => p.id === item.id)
					if (targetPost) {
						targetPost.collected = false
						savePosts(posts)
					}
				}
				
				uni.showToast({
					title: '已删除',
					icon: 'none'
				})
			}
		}
	})
}

onShow(() => {
	loadData()
})
</script>

<style scoped lang="scss">
$main-blue: #4FA1F2;
$bg-blue: #E3F2FD;
$light-gray: #f8f8f8;
$text-dark: #333;
$text-light: #888;
$danger-red: #ff6b6b;

.container {
	min-height: 100vh;
	background: linear-gradient(135deg, $bg-blue 0%, #F0F9FF 100%);
	padding: 0;
}

.category-scroll {
	background: white;
	padding: 12rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.category-tabs {
	display: flex;
	gap: 12rpx;
	padding: 0 16rpx;
	white-space: nowrap;
}

.category-tab {
	padding: 10rpx 20rpx;
	border-radius: 24rpx;
	background: #f0f0f0;
	color: $text-light;
	font-size: 26rpx;
	white-space: nowrap;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	gap: 6rpx;

	.cat-emoji {
		font-size: 28rpx;
		display: block;
	}

	.cat-label {
		font-weight: 600;
	}

	.cat-count {
		font-size: 24rpx;
		opacity: 0.7;
	}

	&.active {
		background: $main-blue;
		color: white;

		.cat-count {
			color: white;
		}
	}
}

.collection-list {
	padding: 20rpx;
}

.collection-card {
	background: white;
	border-radius: 16rpx;
	padding: 20rpx;
	margin-bottom: 16rpx;
	transition: all 0.2s;
	box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);

	&:active {
		transform: scale(0.98);
		box-shadow: 0 2rpx 8rpx rgba(79, 161, 242, 0.12);
	}
}

.card-header {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 12rpx;
}

.card-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.item-icon {
	font-size: 40rpx;
	min-width: 40rpx;
	height: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.item-name {
	font-size: 30rpx;
	font-weight: 700;
	color: $text-dark;
}

.item-time {
	font-size: 24rpx;
	color: $text-light;
}

.item-desc {
	font-size: 24rpx;
	color: $text-light;
	margin: 12rpx 0 16rpx;
	line-height: 1.5;
	padding: 12rpx 0;
	border-top: 1rpx solid #f0f0f0;
	border-bottom: 1rpx solid #f0f0f0;
}

.item-actions {
	display: flex;
	gap: 12rpx;
	padding-top: 0;
	margin-top: 16rpx;
}

.action-btn {
	flex: 1;
	text-align: center;
	padding: 10rpx 12rpx;
	border-radius: 10rpx;
	background: rgba(79, 161, 242, 0.1);
	color: $main-blue;
	font-size: 24rpx;
	font-weight: 600;
	transition: all 0.2s;

	&:active {
		background: rgba(79, 161, 242, 0.2);
	}

	&.danger {
		background: rgba(255, 107, 107, 0.1);
		color: $danger-red;

		&:active {
			background: rgba(255, 107, 107, 0.2);
		}
	}
}

.empty-state {
	text-align: center;
	padding: 100rpx 24rpx;
	display: flex;
	flex-direction: column;
	gap: 16rpx;
	background: white;
	border-radius: 16rpx;
	margin: 40rpx 20rpx;
	box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);
}

.empty-icon {
	font-size: 80rpx;
	display: block;
	margin-bottom: 8rpx;
}

.empty-text {
	font-size: 32rpx;
	color: $text-dark;
	font-weight: 700;
}

.empty-hint {
	font-size: 26rpx;
	color: $text-light;
	line-height: 1.5;
}
</style>
