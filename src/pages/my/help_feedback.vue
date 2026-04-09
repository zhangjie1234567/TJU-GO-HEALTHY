<template>
	<view class="container">
		<view class="tab-content">
			<view class="feedback-intro">
				<text class="intro-text">我们希望听到你的意见，帮助我们做得更好</text>
			</view>

			<view class="feedback-form">
				<view class="form-group">
					<text class="form-label">反馈类型</text>
					<view class="feedback-type-buttons">
						<view
							v-for="type in feedbackTypes"
							:key="type.key"
							class="type-btn"
							:class="{ active: feedbackForm.type === type.key }"
							@click="feedbackForm.type = type.key"
						>
							{{ type.icon }} {{ type.label }}
						</view>
					</view>
				</view>

				<view class="form-group">
					<text class="form-label">反馈内容</text>
					<textarea
						v-model.trim="feedbackForm.content"
						class="feedback-textarea"
						placeholder="请详细描述你的意见或建议（必填）"
						maxlength="500"
						:show-confirm-bar="false"
						:auto-height="true"
					/>
					<text class="char-count">{{ feedbackForm.content.length }}/500</text>
				</view>

				<view class="form-group">
					<view class="feedback-checkbox" @click="feedbackForm.targetAI = !feedbackForm.targetAI">
						<view class="checkbox" :class="{ checked: feedbackForm.targetAI }">
							<text v-if="feedbackForm.targetAI">✓</text>
						</view>
						<text class="checkbox-label">反馈给AI，帮助改进推荐算法</text>
					</view>
				</view>

				<view class="form-group">
					<text class="form-label">你的邮箱（可选）</text>
					<input
						v-model.trim="feedbackForm.email"
						type="text"
						class="form-input"
						placeholder="用于接收反馈回复"
						confirm-type="done"
					/>
				</view>

				<view class="form-actions">
					<view class="submit-btn" @click="submitFeedback">
						<text class="submit-icon">📤</text>
						<text>提交反馈</text>
					</view>
				</view>
			</view>

			<view class="my-feedback-section">
				<text class="section-title">我的反馈</text>
				<view v-if="feedbackList.length > 0">
					<view
						v-for="feedback in feedbackList"
						:key="feedback.id || feedback.createdAt"
						class="feedback-item"
					>
						<view class="feedback-item-header">
							<view class="feedback-meta">
								<text class="feedback-type-badge">{{ getFeedbackTypeLabel(feedback.type) }}</text>
								<text class="feedback-status" :class="feedback.status">{{ getFeedbackStatusLabel(feedback.status) }}</text>
							</view>
							<text class="feedback-time">{{ formatTime(feedback.createdAt) }}</text>
						</view>
						<text class="feedback-content">{{ feedback.content }}</text>
					</view>
				</view>
				<view v-else class="empty-state">
					<text class="empty-icon">📭</text>
					<text class="empty-text">暂无反馈记录</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { getFeedbackList, saveFeedback } from './my-store'

const feedbackForm = ref({
	type: 'suggestion',
	content: '',
	targetAI: false,
	email: ''
})
const feedbackList = ref([])

const feedbackTypes = [
	{ key: 'suggestion', label: '建议', icon: '💡' },
	{ key: 'bug', label: 'Bug报告', icon: '🐛' },
	{ key: 'feedback', label: '意见', icon: '📝' }
]

const loadData = async () => {
	feedbackList.value = await getFeedbackList()
}

const getFeedbackTypeLabel = (type) => {
	const typeMap = {
		suggestion: '建议',
		bug: 'Bug',
		feedback: '意见'
	}
	return typeMap[type] || type
}

const getFeedbackStatusLabel = (status) => {
	const statusMap = {
		pending: '待处理',
		reviewing: '处理中',
		done: '已完成'
	}
	return statusMap[status] || status
}

const isValidEmail = (email) => {
	if (!email) return true
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const submitFeedback = async () => {
	if (!feedbackForm.value.content) {
		uni.showToast({
			title: '请输入反馈内容',
			icon: 'none'
		})
		return
	}

	if (!isValidEmail(feedbackForm.value.email)) {
		uni.showToast({
			title: '邮箱格式不正确',
			icon: 'none'
		})
		return
	}

	const feedback = await saveFeedback({
		type: feedbackForm.value.type,
		content: feedbackForm.value.content,
		targetAI: feedbackForm.value.targetAI,
		email: feedbackForm.value.email
	})

	if (feedback) {
		feedbackList.value.unshift(feedback)
		feedbackForm.value = {
			type: 'suggestion',
			content: '',
			targetAI: false,
			email: ''
		}

		uni.showToast({
			title: '感谢你的反馈！',
			icon: 'none'
		})
	}
}

const formatTime = (time) => {
	const date = new Date(time)
	if (Number.isNaN(date.getTime())) return '-'
	const now = new Date()
	const diff = now - date

	if (diff < 3600000) {
		return `${Math.max(1, Math.floor(diff / 60000))}分钟前`
	}
	if (diff < 86400000) {
		return `${Math.floor(diff / 3600000)}小时前`
	}
	if (diff < 604800000) {
		return `${Math.floor(diff / 86400000)}天前`
	}
	return date.toLocaleDateString()
}

onShow(() => {
	loadData()
})
</script>

<style scoped lang="scss">
$main-blue: #4FA1F2;
$bg-blue: #E3F2FD;
$text-dark: #333;
$text-light: #888;

.container {
	min-height: 100vh;
	background: linear-gradient(135deg, $bg-blue 0%, #F0F9FF 100%);
	padding: 20rpx;
}

.tab-content {
	padding-bottom: 60rpx;
}

.feedback-intro {
	text-align: center;
	padding: 28rpx 24rpx;
	background: white;
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);
	border-left: 4rpx solid $main-blue;
}

.intro-text {
	font-size: 28rpx;
	color: $text-dark;
	font-weight: 600;
}

.feedback-form {
	background: white;
	border-radius: 16rpx;
	padding: 28rpx 24rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);
}

.form-group {
	margin-bottom: 24rpx;

	&:last-child {
		margin-bottom: 0;
	}
}

.form-label {
	font-size: 28rpx;
	font-weight: 600;
	color: $text-dark;
	display: block;
	margin-bottom: 14rpx;
}

.feedback-type-buttons {
	display: flex;
	gap: 12rpx;
	flex-wrap: wrap;
}

.type-btn {
	flex: 1;
	min-width: calc(50% - 6rpx);
	padding: 16rpx;
	border: 1rpx solid #ddd;
	border-radius: 12rpx;
	text-align: center;
	font-size: 26rpx;
	background: white;
	color: $text-dark;

	&.active {
		background: $main-blue;
		border-color: $main-blue;
		color: white;
	}
}

.feedback-textarea {
	width: 100%;
	border: 1rpx solid #E0E6F2;
	border-radius: 12rpx;
	padding: 16rpx 18rpx;
	font-size: 28rpx;
	line-height: 1.6;
	min-height: 180rpx;
	box-sizing: border-box;
	background: white;
	color: #333;
}

.char-count {
	font-size: 22rpx;
	color: $text-light;
	text-align: right;
	display: block;
	margin-top: 8rpx;
}

.form-input {
	width: 100%;
	border: 1rpx solid #E0E6F2;
	border-radius: 12rpx;
	padding: 14rpx 18rpx;
	font-size: 28rpx;
	height: 72rpx;
	box-sizing: border-box;
	background: white;
	color: #333;
}

.feedback-checkbox {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.checkbox {
	width: 28rpx;
	height: 28rpx;
	border: 1rpx solid #ddd;
	border-radius: 6rpx;
	display: flex;
	align-items: center;
	justify-content: center;

	&.checked {
		background: $main-blue;
		border-color: $main-blue;
		color: white;
	}
}

.checkbox-label {
	font-size: 24rpx;
	color: $text-dark;
}

.form-actions {
	margin-top: 24rpx;
}

.submit-btn {
	background: linear-gradient(135deg, $main-blue 0%, #3B8CE8 100%);
	color: white;
	border-radius: 16rpx;
	padding: 20rpx 32rpx;
	text-align: center;
	font-size: 30rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
}

.submit-icon {
	font-size: 28rpx;
}

.my-feedback-section {
	margin-top: 32rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: $text-dark;
	margin-bottom: 20rpx;
	display: block;
}

.feedback-item {
	background: white;
	border-radius: 16rpx;
	padding: 20rpx 24rpx;
	margin-bottom: 16rpx;
	border-left: 4rpx solid $main-blue;
	box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);
}

.feedback-item-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12rpx;
	gap: 10rpx;
}

.feedback-meta {
	display: flex;
	gap: 12rpx;
}

.feedback-type-badge {
	background: $bg-blue;
	color: $main-blue;
	padding: 6rpx 12rpx;
	border-radius: 8rpx;
	font-size: 22rpx;
	font-weight: 600;
}

.feedback-status {
	padding: 6rpx 12rpx;
	border-radius: 8rpx;
	font-size: 22rpx;
	font-weight: 600;

	&.pending {
		background: #fff3cd;
		color: #856404;
	}

	&.reviewing {
		background: #cfe2ff;
		color: #084298;
	}

	&.done {
		background: #d1e7dd;
		color: #0f5132;
	}
}

.feedback-time {
	font-size: 22rpx;
	color: $text-light;
	white-space: nowrap;
}

.feedback-content {
	font-size: 26rpx;
	color: $text-dark;
	line-height: 1.6;
	display: block;
}

.empty-state {
	text-align: center;
	padding: 80rpx 24rpx;
	background: white;
	border-radius: 16rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);
}

.empty-icon {
	font-size: 80rpx;
	display: block;
	margin-bottom: 20rpx;
	opacity: 0.6;
}

.empty-text {
	font-size: 28rpx;
	color: $text-light;
}
</style>
