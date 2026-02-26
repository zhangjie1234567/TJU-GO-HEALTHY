<template>
	<view class="container">
		<!-- 用户头部信息卡片 -->
		<view class="user-header" @click="goToPage('account')">
			<view class="user-card">
				<view class="user-avatar">{{ currentUser?.avatar || '😊' }}</view>
				<view class="user-info">
					<text class="user-name">{{ currentUser?.name || '未登录' }}</text>
					<text class="user-id">{{ currentUser?.studentId || '点击登录' }}</text>
				</view>
				<text class="user-arrow">→</text>
			</view>
		</view>

		<!-- 我的方案 -->
		<view class="section-card" @click="goToPage('my_plan')">
			<view class="section-header">
				<text class="section-icon">🎯</text>
				<text class="section-title">我的方案</text>
				<text class="section-desc">{{ currentPlan?.name || '暂未选择' }}</text>
			</view>
			<text class="section-arrow">→</text>
		</view>

		<!-- 我的收藏 -->
		<view class="section-card" @click="goToPage('my_collection')">
			<view class="section-header">
				<text class="section-icon">⭐</text>
				<text class="section-title">我的收藏</text>
				<text class="section-desc">{{ totalCollections }}项收藏</text>
			</view>
			<text class="section-arrow">→</text>
		</view>

		<!-- 数据小结 -->
		<view class="section-card" @click="goToPage('data_summary')">
			<view class="section-header">
				<text class="section-icon">📈</text>
				<text class="section-title">数据小结</text>
				<text class="section-desc">{{ totalDataPoints }}条记录</text>
			</view>
			<text class="section-arrow">→</text>
		</view>

		<!-- 使用小结（年度报告） -->
		<view class="section-card" @click="goToPage('yearly_summary')">
			<view class="section-header">
				<text class="section-icon">🎉</text>
				<text class="section-title">使用小结</text>
				<text class="section-desc">查看你的年度成就</text>
			</view>
			<text class="section-arrow">→</text>
		</view>

		<!-- 我的测评 -->
		<view class="section-card" @click="goToPage('my_assessment')">
			<view class="section-header">
				<text class="section-icon">📋</text>
				<text class="section-title">我的测评</text>
				<text class="section-desc">查看测评报告</text>
			</view>
			<text class="section-arrow">→</text>
		</view>

		<!-- 帮助与反馈 -->
		<view class="section-card" @click="goToPage('help_feedback')">
			<view class="section-header">
				<text class="section-icon">💬</text>
				<text class="section-title">帮助与反馈</text>
				<text class="section-desc">获取帮助或提交建议</text>
			</view>
			<text class="section-arrow">→</text>
		</view>

		<view style="height: 120rpx;"></view>
	</view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { ref, computed } from 'vue'
import {
	getCurrentUser,
	getCurrentPlan,
	getCollections,
	getDailyData,
	getYearlyReport
} from './my-store'

const currentUser = ref({
	name: '未登录',
	studentId: '点击登录',
	avatar: '😊'
})
const currentPlan = ref(null)
const collections = ref({
	restaurants: [],
	recipes: [],
	drinks: [],
	courses: [],
	knowledge: [],
	posts: []
})
const dailyData = ref([])

const totalCollections = computed(() => {
	if (!collections.value) return 0
	return Object.values(collections.value).reduce((sum, arr) => sum + arr.length, 0)
})

const totalDataPoints = computed(() => dailyData.value.length)

const goToPage = (page) => {
	const routes = {
		account: '/pages/my/account',
		my_plan: '/pages/my/my_plan',
		my_collection: '/pages/my/my_collection',
		data_summary: '/pages/my/data_summary',
		yearly_summary: '/pages/my/yearly_summary',
		my_assessment: '/pages/my/my_assessment',
		help_feedback: '/pages/my/help_feedback'
	}
	
	if (routes[page]) {
		uni.navigateTo({
			url: routes[page]
		})
	}
}

onShow(() => {
	currentUser.value = getCurrentUser()
	currentPlan.value = getCurrentPlan()
	collections.value = getCollections()
	dailyData.value = getDailyData()
})
</script>

<style scoped lang="scss">
$main-blue: #4FA1F2;
$bg-blue: #E3F2FD;
$light-gray: #f8f8f8;
$text-dark: #333;
$text-light: #888;

.container {
	min-height: 100vh;
	background: linear-gradient(135deg, $bg-blue 0%, #F0F9FF 100%);
	padding: 20rpx;
}

/* 用户头部卡片 */
.user-header {
	margin-bottom: 24rpx;
}

.user-card {
	background: white;
	border-radius: 16rpx;
	padding: 24rpx;
	display: flex;
	align-items: center;
	gap: 16rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
	transition: transform 0.2s;

	&:active {
		transform: scale(0.98);
	}
}

.user-avatar {
	font-size: 64rpx;
	min-width: 64rpx;
	height: 64rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 12rpx;
	background: $bg-blue;
}

.user-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.user-name {
	font-size: 32rpx;
	font-weight: 600;
	color: $text-dark;
}

.user-id {
	font-size: 26rpx;
	color: $text-light;
}

.user-arrow {
	font-size: 28rpx;
	color: $main-blue;
}

/* 功能卡片 */
.section-card {
	background: white;
	border-radius: 16rpx;
	padding: 20rpx 24rpx;
	margin-bottom: 16rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
	transition: transform 0.2s;

	&:active {
		transform: scale(0.98);
	}
}

.section-header {
	flex: 1;
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.section-icon {
	font-size: 40rpx;
	min-width: 40rpx;
}

.section-title {
	font-size: 30rpx;
	font-weight: 600;
	color: $text-dark;
}

.section-desc {
	margin-left: auto;
	font-size: 24rpx;
	color: $text-light;
}

.section-arrow {
	font-size: 28rpx;
	color: $main-blue;
	margin-left: 12rpx;
}
</style>
