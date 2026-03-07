<template>
	<view class="container">
		<!-- 统计卡片 -->
		<view class="stats-section">
			<view class="stat-card">
				<text class="stat-label">总记录天数</text>
				<text class="stat-value">{{ totalDays }}</text>
				<text class="stat-unit">天</text>
			</view>
			<view class="stat-card">
				<text class="stat-label">连续打卡</text>
				<text class="stat-value">{{ consecutiveDays }}</text>
				<text class="stat-unit">天</text>
			</view>
			<view class="stat-card">
				<text class="stat-label">数据条数</text>
				<text class="stat-value">{{ totalRecords }}</text>
				<text class="stat-unit">条</text>
			</view>
		</view>

		<!-- 数据统计 -->
		<view class="data-stats">
			<text class="section-title">数据统计</text>
			<view class="stat-item">
				<view class="stat-item-header">
					<text class="stat-item-label">🏃 跑步时长</text>
					<text class="stat-item-value">{{ totalRunHours }}h</text>
				</view>
				<view class="stat-bar">
					<view class="stat-bar-fill" :style="{ width: getBarWidth(totalRunHours, 60) }"></view>
				</view>
				<text class="stat-item-hint">累计 {{ totalRunMinutes }} 分钟</text>
			</view>

			<view class="stat-item">
				<view class="stat-item-header">
					<text class="stat-item-label">⏱ 专注时长</text>
					<text class="stat-item-value">{{ totalFocusHours }}h</text>
				</view>
				<view class="stat-bar">
					<view class="stat-bar-fill" :style="{ width: getBarWidth(totalFocusHours, 500) }"></view>
				</view>
				<text class="stat-item-hint">累计 {{ totalFocusHours }}小时</text>
			</view>

			<view class="stat-item">
				<view class="stat-item-header">
					<text class="stat-item-label">⚖️ 体重变化</text>
					<text class="stat-item-value" :style="{ color: getWeightColor() }">{{ weightChange }}</text>
				</view>
				<view class="stat-bar">
					<view class="stat-bar-fill" :style="{ backgroundColor: getWeightColor(), width: getBarWidth(Math.abs(weightChange), 10) }"></view>
				</view>
				<text class="stat-item-hint">{{ weightChangeText }}</text>
			</view>

			<view class="stat-item">
				<view class="stat-item-header">
					<text class="stat-item-label">💧 饮水量</text>
					<text class="stat-item-value">{{ totalWater }}L</text>
				</view>
				<view class="stat-bar">
					<view class="stat-bar-fill" :style="{ width: getBarWidth(totalWater, 50) }"></view>
				</view>
				<text class="stat-item-hint">共喝 {{ totalWater }}升水</text>
			</view>
		</view>

		<!-- 记录历史 -->
		<view class="records-section">
			<text class="section-title">记录历史</text>
			<view v-if="sortedRecords.length > 0">
				<view
					v-for="(record, index) in sortedRecords"
					:key="index"
					class="record-item"
				>
					<view class="record-date">{{ formatDate(record.date) }}</view>
					<view class="record-metrics">
						<view v-if="record.metrics.runMinutes" class="metric-badge">
							🏃 {{ record.metrics.runMinutes }}min
						</view>
						<view v-else-if="record.metrics.distance" class="metric-badge">
							🏃 {{ record.metrics.distance }}km
						</view>
						<view v-if="record.metrics.focus || record.metrics.fasting" class="metric-badge">
							⏱ {{ record.metrics.focus || record.metrics.fasting }}h
						</view>
						<view v-if="record.metrics.weight" class="metric-badge">
							⚖️ {{ record.metrics.weight }}kg
						</view>
						<view v-if="record.metrics.water" class="metric-badge">
							💧 {{ record.metrics.water }}L
						</view>
					</view>
				</view>
			</view>
			<view v-else class="empty-state">
				<text class="empty-icon">📭</text>
				<text class="empty-text">暂无数据记录</text>
			</view>
		</view>

		<!-- 添加记录弹窗 -->
		<view class="modal-overlay" v-if="showAddModal" @click.self="showAddModal = false">
			<view class="modal-content">
				<view class="modal-header">
					<text class="modal-title">添加数据</text>
					<text class="modal-close" @click="showAddModal = false">✕</text>
				</view>

				<view class="modal-body">
					<view class="form-group">
						<text class="form-label">日期</text>
						<input
							v-model="newRecord.date"
							type="date"
							class="form-input"
						/>
					</view>

					<view class="form-group">
						<text class="form-label">🏃 运动距离(km)</text>
						<input
							v-model.number="newRecord.distance"
							type="number"
							class="form-input"
							placeholder="0"
						/>
					</view>

					<view class="form-group">
						<text class="form-label">⏱ 专注时长(h)</text>
						<input
							v-model.number="newRecord.focus"
							type="number"
							class="form-input"
							placeholder="0"
						/>
					</view>

					<view class="form-group">
						<text class="form-label">⚖️ 体重(kg)</text>
						<input
							v-model.number="newRecord.weight"
							type="number"
							class="form-input"
							placeholder="0"
						/>
					</view>

					<view class="form-group">
						<text class="form-label">💧 饮水量(L)</text>
						<input
							v-model.number="newRecord.water"
							type="number"
							class="form-input"
							placeholder="0"
						/>
					</view>
				</view>

				<view class="modal-actions">
					<view class="modal-btn cancel" @click="showAddModal = false">取消</view>
					<view class="modal-btn confirm" @click="saveRecord">保存</view>
				</view>
			</view>
		</view>

		<view style="height: 60rpx;"></view>
	</view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { ref, computed } from 'vue'
import { getDailyData, recordDailyMetric, saveDailyData } from './my-store'

const dailyData = ref([])
const showAddModal = ref(false)

const newRecord = ref({
	date: new Date().toISOString().split('T')[0],
	distance: 0,
	focus: 0,
	weight: 0,
	water: 0
})

const sortedRecords = computed(() => {
	if (!dailyData.value) return []
	return [...dailyData.value].sort((a, b) => new Date(b.date) - new Date(a.date))
})

const totalDays = computed(() => dailyData.value.length)

const consecutiveDays = computed(() => {
	if (dailyData.value.length === 0) return 0
	
	const sorted = [...dailyData.value].sort((a, b) => new Date(b.date) - new Date(a.date))
	let count = 0
	const today = new Date()
	today.setHours(0, 0, 0, 0)

	for (let i = 0; i < sorted.length; i++) {
		const recordDate = new Date(sorted[i].date)
		recordDate.setHours(0, 0, 0, 0)
		const expectedDate = new Date(today)
		expectedDate.setDate(expectedDate.getDate() - i)

		if (recordDate.getTime() === expectedDate.getTime()) {
			count++
		} else {
			break
		}
	}

	return count
})

const totalRecords = computed(() => {
	return dailyData.value.reduce((sum, record) => {
		return sum + Object.keys(record.metrics || {}).length
	}, 0)
})

const totalDistance = computed(() => {
	return dailyData.value.reduce((sum, record) => {
		return sum + (Number(record.metrics?.distance) || 0)
	}, 0).toFixed(1)
})

const totalRunMinutes = computed(() => {
	return dailyData.value.reduce((sum, record) => {
		return sum + (Number(record.metrics?.runMinutes) || 0)
	}, 0)
})

const totalRunHours = computed(() => {
	return (totalRunMinutes.value / 60).toFixed(1)
})

const totalFocusHours = computed(() => {
	return dailyData.value.reduce((sum, record) => {
		return sum + (Number(record.metrics?.focus) || Number(record.metrics?.fasting) || 0)
	}, 0)
})

const totalWater = computed(() => {
	return dailyData.value.reduce((sum, record) => {
		return sum + (Number(record.metrics?.water) || 0)
	}, 0).toFixed(1)
})

const firstWeight = computed(() => {
	const sorted = [...dailyData.value].sort((a, b) => new Date(a.date) - new Date(b.date))
	return sorted.length > 0 ? Number(sorted[0].metrics?.weight) : 0
})

const lastWeight = computed(() => {
	const sorted = [...dailyData.value].sort((a, b) => new Date(a.date) - new Date(b.date))
	return sorted.length > 0 ? Number(sorted[sorted.length - 1].metrics?.weight) : 0
})

const weightChange = computed(() => {
	const change = lastWeight.value - firstWeight.value
	return change === 0 ? '→' : (change > 0 ? '+' : '') + change.toFixed(1)
})

const weightChangeText = computed(() => {
	const change = lastWeight.value - firstWeight.value
	if (change > 0) {
		return '体重增加 ' + change.toFixed(1) + 'kg'
	} else if (change < 0) {
		return '体重降低 ' + Math.abs(change).toFixed(1) + 'kg'
	} else {
		return '体重保持稳定'
	}
})

const loadData = () => {
	dailyData.value = getDailyData()
}

const getBarWidth = (value, max) => {
	const percentage = Math.min((value / max) * 100, 100)
	return percentage + '%'
}

const getWeightColor = () => {
	const change = lastWeight.value - firstWeight.value
	if (change > 0) return '#ff6b6b'
	if (change < 0) return '#4FA1F2'
	return '#888'
}

const formatDate = (dateStr) => {
	const date = new Date(dateStr)
	const today = new Date()
	today.setHours(0, 0, 0, 0)

	const recordDate = new Date(dateStr)
	recordDate.setHours(0, 0, 0, 0)

	if (recordDate.getTime() === today.getTime()) {
		return '今天'
	}

	const yesterday = new Date(today)
	yesterday.setDate(yesterday.getDate() - 1)
	if (recordDate.getTime() === yesterday.getTime()) {
		return '昨天'
	}

	return date.toLocaleDateString('zh-CN', {
		month: '2-digit',
		day: '2-digit'
	})
}

const saveRecord = () => {
	const date = newRecord.value.date

	if (!date) {
		uni.showToast({
			title: '请选择日期',
			icon: 'none'
		})
		return
	}

	const existingIndex = dailyData.value.findIndex(d => d.date === date)
	
	const metrics = {}
	if (newRecord.value.distance) metrics.distance = Number(newRecord.value.distance)
	if (newRecord.value.focus) metrics.focus = Number(newRecord.value.focus)
	if (newRecord.value.weight) metrics.weight = Number(newRecord.value.weight)
	if (newRecord.value.water) metrics.water = Number(newRecord.value.water)

	if (Object.keys(metrics).length === 0) {
		uni.showToast({
			title: '请至少输入一项数据',
			icon: 'none'
		})
		return
	}

	if (existingIndex !== -1) {
		// 更新现有记录
		dailyData.value[existingIndex].metrics = {
			...dailyData.value[existingIndex].metrics,
			...metrics
		}
	} else {
		// 创建新记录
		dailyData.value.push({
			date,
			metrics
		})
	}

	saveDailyData(dailyData.value)
	showAddModal.value = false
	newRecord.value = {
		date: new Date().toISOString().split('T')[0],
		distance: 0,
		focus: 0,
		weight: 0,
		water: 0
	}

	uni.showToast({
		title: '数据已保存',
		icon: 'none'
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

.container {
	min-height: 100vh;
	background: $light-gray;
	padding: 0;
}

.top-bar {
	background: white;
	grid-template-columns: repeat(3, 1fr);
	gap: 12rpx;
	padding: 16rpx;
}

.stat-card {
	background: white;
	border-radius: 12rpx;
	padding: 20rpx 16rpx;
	text-align: center;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.stat-label {
	font-size: 20rpx;
	color: $text-light;
}

.stat-value {
	font-size: 44rpx;
	font-weight: 700;
	color: $main-blue;
}

.stat-unit {
	font-size: 20rpx;
	color: $text-light;
}

.data-stats {
	background: white;
	margin: 12rpx 16rpx;
	border-radius: 12rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
}

.section-title {
	font-size: 28rpx;
	font-weight: 600;
	color: $text-dark;
	margin-bottom: 16rpx;
	display: block;
}

.stat-item {
	margin-bottom: 24rpx;
	padding-bottom: 20rpx;
	border-bottom: 1rpx solid #eee;

	&:last-child {
		border-bottom: none;
		margin-bottom: 0;
		padding-bottom: 0;
	}
}

.stat-item-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8rpx;
}

.stat-item-label {
	font-size: 26rpx;
	font-weight: 600;
	color: $text-dark;
}

.stat-item-value {
	font-size: 28rpx;
	font-weight: 700;
	color: $main-blue;
}

.stat-bar {
	background: #eee;
	height: 8rpx;
	border-radius: 4rpx;
	overflow: hidden;
	margin: 8rpx 0;
}

.stat-bar-fill {
	height: 100%;
	background: $main-blue;
	border-radius: 4rpx;
	transition: width 0.3s ease;
}

.stat-item-hint {
	font-size: 22rpx;
	color: $text-light;
}

.records-section {
	background: white;
	margin: 12rpx 16rpx;
	border-radius: 12rpx;
	padding: 20rpx;
	margin-bottom: 20rpx;
}

.record-item {
	padding: 16rpx 0;
	border-bottom: 1rpx solid #eee;

	&:last-child {
		border-bottom: none;
	}
}

.record-date {
	font-size: 24rpx;
	font-weight: 600;
	color: $text-dark;
	margin-bottom: 8rpx;
}

.record-metrics {
	display: flex;
	flex-wrap: wrap;
	gap: 8rpx;
}

.metric-badge {
	background: $bg-blue;
	color: $main-blue;
	padding: 4rpx 12rpx;
	border-radius: 20rpx;
	font-size: 22rpx;
	font-weight: 600;
}

.empty-state {
	text-align: center;
	padding: 40rpx 24rpx;
	color: $text-light;
	font-size: 26rpx;
}

.empty-icon {
	font-size: 60rpx;
	display: block;
	margin-bottom: 12rpx;
}

.empty-text {
	font-size: 26rpx;
	color: $text-dark;
	font-weight: 600;
}

/* 模态框 */
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: flex-end;
	z-index: 100;
}

.modal-content {
	background: white;
	width: 100%;
	border-radius: 24rpx 24rpx 0 0;
	padding: 24rpx;
	max-height: 85vh;
	overflow-y: auto;
	animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
	from {
		transform: translateY(100%);
	}
	to {
		transform: translateY(0);
	}
}

.modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
	padding-bottom: 16rpx;
	border-bottom: 1rpx solid #eee;
}

.modal-title {
	font-size: 32rpx;
	font-weight: 600;
	color: $text-dark;
}

.modal-close {
	font-size: 32rpx;
	color: $text-light;
}

.modal-body {
	margin: 20rpx 0;
}

.form-group {
	margin-bottom: 20rpx;
}

.form-label {
	font-size: 26rpx;
	font-weight: 600;
	color: $text-dark;
	display: block;
	margin-bottom: 8rpx;
}

.form-input {
	width: 100%;
	border: 1rpx solid #E0E6F2;
	border-radius: 12rpx;
	padding: 14rpx 18rpx;
	font-size: 28rpx;
	height: 64rpx;
	line-height: 1;
	box-sizing: border-box;
	font-family: inherit;
	background: white;
	color: #333;
	transition: border-color 0.2s, box-shadow 0.2s;
	outline: none;
	-webkit-appearance: none;
	appearance: none;
	display: flex;
	align-items: center;
}

.form-input::placeholder {
	color: #ccc;
	font-size: 28rpx;
}

.form-input:focus {
	border-color: $main-blue;
	box-shadow: 0 0 0 2rpx rgba(79, 161, 242, 0.1);
}

.modal-actions {
	display: flex;
	gap: 12rpx;
	margin-top: 24rpx;
}

.modal-btn {
	flex: 1;
	padding: 14rpx;
	border-radius: 8rpx;
	font-size: 28rpx;
	text-align: center;
	font-weight: 600;

	&.cancel {
		background: #eee;
		color: $text-light;
	}

	&.confirm {
		background: $main-blue;
		color: white;
	}
}
</style>
