<template>
	<view class="container">
		<view v-if="assessmentReport" class="report-content">
			<!-- 测评时间 -->
			<view class="assessment-time">
				<text class="time-label">最后测评:</text>
				<text class="time-value">{{ formatDate(assessmentReport.createdAt) }}</text>
			</view>

			<!-- 基本信息 -->
			<view class="section">
				<text class="section-title">📋 基本信息</text>
				<view class="info-grid">
					<view class="info-item">
						<text class="info-label">年龄</text>
						<text class="info-value">{{ assessmentReport.age ? assessmentReport.age + '岁' : '-' }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">身高</text>
						<text class="info-value">{{ assessmentReport.height ? assessmentReport.height + 'cm' : '-' }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">体重</text>
						<text class="info-value">{{ assessmentReport.weight ? assessmentReport.weight + 'kg' : '-' }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">BMI</text>
						<text class="info-value">{{ bmi === 'NaN' ? '-' : bmi }}</text>
					</view>
				</view>
			</view>

			<!-- 健康评分 -->
			<view class="section">
				<text class="section-title">⭐ 健康评分</text>
				<view class="score-card">
					<view class="score-circle">
						<text class="score-value">{{ assessmentReport.healthScore }}</text>
						<text class="score-unit">分</text>
					</view>
					<text class="score-desc">{{ getHealthScoreDescription() }}</text>
				</view>
			</view>

			<!-- 运动情况 -->
			<view class="section">
				<text class="section-title">🏃 运动习惯</text>
				<view class="habit-item">
					<text class="habit-icon">🏋️</text>
					<view class="habit-info">
						<text class="habit-name">运动频率</text>
						<text class="habit-value">{{ assessmentReport.exerciseFrequency }}</text>
					</view>
				</view>
				<view class="habit-item">
					<text class="habit-icon">⏱️</text>
					<view class="habit-info">
						<text class="habit-name">每次运动时长</text>
						<text class="habit-value">{{ assessmentReport.exerciseDuration }}</text>
					</view>
				</view>
				<view class="habit-item">
					<text class="habit-icon">💪</text>
					<view class="habit-info">
						<text class="habit-name">喜好的运动类型</text>
						<text class="habit-value">{{ assessmentReport.exerciseType }}</text>
					</view>
				</view>
			</view>

			<!-- 饮食习惯 -->
			<view class="section">
				<text class="section-title">🍽️ 饮食习惯</text>
				<view class="habit-item">
					<text class="habit-icon">🚫</text>
					<view class="habit-info">
						<text class="habit-name">饮食限制</text>
						<text class="habit-value">{{ assessmentReport.dietRestrictions || '无' }}</text>
					</view>
				</view>
				<view class="habit-item">
					<text class="habit-icon">🥗</text>
					<view class="habit-info">
						<text class="habit-name">饮食偏好</text>
						<text class="habit-value">{{ assessmentReport.dietPreference }}</text>
					</view>
				</view>
				<view class="habit-item">
					<text class="habit-icon">⏳</text>
					<view class="habit-info">
						<text class="habit-name">专注计划接受度</text>
						<text class="habit-value">{{ assessmentReport.fastingAcceptance }}</text>
					</view>
				</view>
			</view>

			<!-- 目标 -->
			<view class="section">
				<text class="section-title">🎯 你的目标</text>
				<view class="goals-display">
					<view v-for="(goal, index) in assessmentReport.goals" :key="index" class="goal-tag">
						{{ goal }}
					</view>
				</view>
			</view>

			<!-- 建议 -->
			<view class="section">
				<text class="section-title">💡 个性化建议</text>
				<view class="suggestions">
					<view v-for="(suggestion, index) in assessmentReport.suggestions" :key="index" class="suggestion-item">
						<text class="suggestion-icon">✓</text>
						<text class="suggestion-text">{{ suggestion }}</text>
					</view>
				</view>
			</view>

			<!-- 重新测评按钮 -->
			<view class="section">
				<view class="reassess-btn" @click="reassessQuestion">
					<text class="reassess-icon">🔄</text>
					<text class="reassess-text">重新测评</text>
				</view>
			</view>
		</view>

		<view v-else class="empty-state">
			<text class="empty-icon">📋</text>
			<text class="empty-title">还没有测评报告</text>
			<text class="empty-desc">请返回登录页重新填写问卷</text>
			<view class="back-to-login-btn" @click="goToLogin">
				<text>返回登录</text>
			</view>
		</view>

		<view style="height: 60rpx;"></view>
	</view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { ref, computed } from 'vue'
import { getAssessmentReport, deleteAssessmentReport } from './my-store'

const assessmentReport = ref(null)

const bmi = computed(() => {
	if (!assessmentReport.value) return '-'
	const height = assessmentReport.value.height / 100
	const weight = assessmentReport.value.weight
	const bmiValue = (weight / (height * height)).toFixed(1)
	return bmiValue
})

const goToLogin = () => {
	uni.navigateTo({
		url: '/pages/login/login'
	})
}

const loadData = async () => {
	assessmentReport.value = await getAssessmentReport()
}

const getHealthScoreDescription = () => {
	const score = assessmentReport.value?.healthScore || 0
	if (score >= 80) return '非常优秀！保持现有习惯'
	if (score >= 60) return '良好！还有提升空间'
	if (score >= 40) return '一般，建议进行改善'
	return '需要加强，制定计划改善'
}

const formatDate = (dateStr) => {
	if (!dateStr) return '-'
	const date = new Date(dateStr)
	return date.toLocaleDateString('zh-CN', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	})
}

const reassessQuestion = () => {
	uni.showModal({
		title: '重新测评',
		content: '这将清空原有测评，并返回登录页重新填写问卷',
		confirmText: '确定',
		cancelText: '取消',
		async success(res) {
			if (res.confirm) {
				const deleted = await deleteAssessmentReport()
				if (!deleted) return
				uni.navigateTo({
					url: '/pages/login/login'
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

.container {
	min-height: 100vh;
	background: linear-gradient(135deg, $bg-blue 0%, #F0F9FF 100%);
	padding: 20rpx;
}

.report-content {
	padding: 0;
}

.time-label {
	font-size: 26rpx;
	color: $text-dark;
	font-weight: 600;
}

.time-value {
	font-size: 26rpx;
	color: $main-blue;
	font-weight: 600;
}

.section {
	background: white;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);
}

.section-title {
	font-size: 32rpx;
	font-weight: 700;
	color: $text-dark;
	margin-bottom: 20rpx;
	display: block;
	padding-bottom: 0;
	border-bottom: none;
}

.info-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16rpx;
}

.info-item {
	background: white;
	border-radius: 12rpx;
	padding: 20rpx;
	text-align: center;
	box-shadow: 0 2rpx 8rpx rgba(79, 161, 242, 0.08);
}

.info-label {
	font-size: 24rpx;
	color: $text-light;
	display: block;
	margin-bottom: 8rpx;
	font-weight: 600;
}

.info-value {
	font-size: 36rpx;
	font-weight: 700;
	color: $main-blue;
	display: block;
}

.score-card {
	display: flex;
	align-items: center;
	gap: 24rpx;
	padding: 20rpx;
	background: linear-gradient(135deg, rgba(79, 161, 242, 0.1), rgba(79, 161, 242, 0.05));
	border-radius: 12rpx;
}

.score-circle {
	width: 120rpx;
	height: 120rpx;
	border-radius: 50%;
	background: $main-blue;
	color: white;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.3);
}

.score-value {
	font-size: 48rpx;
	font-weight: 700;
}

.score-unit {
	font-size: 22rpx;
}

.score-desc {
	font-size: 26rpx;
	color: $text-dark;
	flex: 1;
	line-height: 1.5;
}

.habit-item {
	display: flex;
	align-items: center;
	gap: 12rpx;
	padding: 12rpx 0;
	border-bottom: 1rpx solid #eee;

	&:last-child {
		border-bottom: none;
	}
}

.habit-icon {
	font-size: 32rpx;
	min-width: 32rpx;
}

.habit-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.habit-name {
	font-size: 24rpx;
	color: $text-light;
}

.habit-value {
	font-size: 26rpx;
	font-weight: 600;
	color: $text-dark;
}

.goals-display {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
}

.goal-tag {
	background: linear-gradient(135deg, rgba(79, 161, 242, 0.15), rgba(79, 161, 242, 0.08));
	color: $main-blue;
	padding: 10rpx 16rpx;
	border-radius: 24rpx;
	font-size: 26rpx;
	font-weight: 600;
	border: 1rpx solid rgba(79, 161, 242, 0.2);
}

.suggestions {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.suggestion-item {
	display: flex;
	gap: 12rpx;
	align-items: flex-start;
	padding: 12rpx;
	background: rgba(79, 161, 242, 0.05);
	border-radius: 10rpx;
	border-left: 3rpx solid $main-blue;
}

.suggestion-icon {
	color: $main-blue;
	font-size: 28rpx;
	font-weight: 700;
	min-width: 28rpx;
}

.suggestion-text {
	font-size: 26rpx;
	color: $text-dark;
	line-height: 1.6;
	flex: 1;
}

.reassess-btn {
	background: linear-gradient(135deg, $main-blue 0%, #3B8CE8 100%);
	color: white;
	padding: 20rpx 32rpx;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	font-size: 30rpx;
	font-weight: 600;
	box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.24);
	transition: all 0.3s;

	&:active {
		transform: scale(0.98);
		box-shadow: 0 2rpx 8rpx rgba(79, 161, 242, 0.16);
	}
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 24rpx;
	text-align: center;
	background: white;
	border-radius: 20rpx;
	margin: 60rpx 20rpx;
	box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.1);
}

.empty-icon {
	font-size: 100rpx;
	margin-bottom: 24rpx;
}

.empty-title {
	font-size: 36rpx;
	font-weight: 700;
	color: $text-dark;
	margin-bottom: 12rpx;
}

.empty-desc {
	font-size: 26rpx;
	color: $text-light;
	margin-bottom: 32rpx;
	line-height: 1.5;
}

.back-to-login-btn {
	background: $main-blue;
	color: white;
	padding: 16rpx 36rpx;
	border-radius: 16rpx;
	font-size: 28rpx;
	font-weight: 600;
	transition: all 0.2s;

	&:active {
		transform: scale(0.98);
	}
}
</style>
