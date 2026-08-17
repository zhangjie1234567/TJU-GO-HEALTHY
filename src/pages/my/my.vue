<template>
	<view class="container">
		<view class="user-header" @click="goToPage('account')">
			<view class="user-card">
				<view class="user-badge">{{ loginBadge }}</view>
				<view class="user-info">
					<text class="user-name">{{ loginLabel }}</text>
					<text class="user-id">{{ loginHint }}</text>
				</view>
				<text class="user-arrow">→</text>
			</view>
		</view>

		<view class="section-card" @click="goToPage('my_plan')">
			<view class="section-header">
				<text class="section-icon">🎯</text>
				<text class="section-title">我的方案</text>
				<text class="section-desc">{{ currentPlan?.name || '暂未选择' }}</text>
			</view>
			<text class="section-arrow">→</text>
		</view>

		<view class="section-card" @click="goToPage('my_collection')">
			<view class="section-header">
				<text class="section-icon">⭐</text>
				<text class="section-title">我的收藏</text>
				<text class="section-desc">{{ totalCollections }}项收藏</text>
			</view>
			<text class="section-arrow">→</text>
		</view>

		<view class="section-card" @click="goToPage('data_summary')">
			<view class="section-header">
				<text class="section-icon">📈</text>
				<text class="section-title">数据小结</text>
				<text class="section-desc">{{ totalDataPoints }}天记录</text>
			</view>
			<text class="section-arrow">→</text>
		</view>

		<view class="section-card" @click="goToPage('my_assessment')">
			<view class="section-header">
				<text class="section-icon">📋</text>
				<text class="section-title">我的测评</text>
				<text class="section-desc">查看测评报告</text>
			</view>
			<text class="section-arrow">→</text>
		</view>

		<view style="height: 120rpx;"></view>
	</view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { ref, computed } from 'vue'
import { BASE_URL } from '@/config.js'
import {
	getCurrentPlan,
	getCollections
} from './my-store'
import { getUserProgressData } from '../home/userProgressService'

const loginBadge = ref('未登录')
const loginLabel = ref('微信授权登录')
const loginHint = ref('当前不显示姓名、学号、头像或昵称')
const currentPlan = ref(null)
const collections = ref({ foods: [], recipes: [], dishes: [] })
const progressData = ref({ recordDays: 0 })

const totalCollections = computed(() => {
	if (!collections.value) return 0
	return Object.values(collections.value).reduce((sum, list) => {
		return sum + (Array.isArray(list) ? list.length : 0)
	}, 0)
})

const totalDataPoints = computed(() => Number(progressData.value?.recordDays) || 0)

const loadRecordDaysAligned = async () => {
	const baseProgress = getUserProgressData()
	let recordDays = Number(baseProgress?.recordDays) || 0
	const token = uni.getStorageSync('token') || ''

	if (!token) {
		progressData.value = { recordDays }
		return
	}

	await new Promise((resolve) => {
		uni.request({
			url: `${BASE_URL}/api/weight/list`,
			method: 'GET',
			header: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			success(res) {
				if (res.statusCode === 200 && res.data?.code === 200) {
					const records = Array.isArray(res.data?.data?.records) ? res.data.data.records : []
					const uniqueWeightDays = new Set(
						records
							.map(item => String(item?.date || '').slice(0, 10))
							.filter(Boolean)
					).size
					recordDays = Math.max(recordDays, uniqueWeightDays)
				}
				resolve()
			},
			fail() {
				resolve()
			}
		})
	})

	progressData.value = { recordDays }
}

const loadData = async () => {
	try {
		const [plan, collectionData] = await Promise.all([
			getCurrentPlan(),
			getCollections()
		])
		currentPlan.value = plan || null
		collections.value = collectionData || { foods: [], recipes: [], dishes: [] }
		await loadRecordDaysAligned()
	} catch (e) {
		// 不阻塞页面渲染
	}
}

const goToPage = (page) => {
	const routes = {
		account: '/pages/my/account',
		my_plan: '/pages/my/my_plan',
		my_collection: '/pages/my/my_collection',
		data_summary: '/pages/my/data_summary',
		my_assessment: '/pages/my/my_assessment'
	}

	if (!routes[page]) return

	const token = uni.getStorageSync('token') || uni.getStorageSync('auth_token') || uni.getStorageSync('access_token')
	if (!token) {
		uni.showModal({
			title: '需要登录',
			content: '该功能需要登录后使用，请先完成授权登录。',
			confirmText: '去登录',
			cancelText: '稍后再说',
			success: (res) => {
				if (res.confirm) {
					uni.navigateTo({ url: '/pages/login/login' })
				}
			}
		})
		return
	}

	uni.navigateTo({ url: routes[page] })
}
onShow(() => {
	const token = uni.getStorageSync('token') || uni.getStorageSync('auth_token') || uni.getStorageSync('access_token')
	if (token) {
			loginBadge.value = '微信已登录'
		loginLabel.value = '微信已登录'
		loginHint.value = '仅保留匿名标识与健康数据'
	} else {
			loginBadge.value = '未登录'
		loginLabel.value = '未登录'
		loginHint.value = '点击进入登录页'
	}
	loadData()
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

.user-badge {
	font-size: 24rpx;
	padding: 10rpx 16rpx;
	border-radius: 999rpx;
	background: rgba(79, 161, 242, 0.12);
	color: $main-blue;
	white-space: nowrap;
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
	font-size: 24rpx;
	color: $text-light;
}

.user-arrow {
	font-size: 28rpx;	color: $main-blue;
}

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
