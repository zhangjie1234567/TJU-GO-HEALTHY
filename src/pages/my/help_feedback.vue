<template>
	<view class="container">
		<view class="tab-bar">
			<view
				class="tab-item"
				:class="{ active: currentTab === 'help' }"
				@click="currentTab = 'help'"
			>
				📚 帮助
			</view>
			<view
				class="tab-item"
				:class="{ active: currentTab === 'feedback' }"
				@click="currentTab = 'feedback'"
			>
				💬 反馈
			</view>
		</view>

		<!-- 帮助内容 -->
		<view v-if="currentTab === 'help'" class="tab-content">
			<view class="help-intro">
				<text class="intro-text">这里是轻跃APP所有功能的讲解和使用指南</text>
			</view>

			<view class="help-search">
				<text class="search-icon">🔍</text>
				<input
					v-model="helpSearch"
					type="text"
					class="search-input"
					placeholder="搜索帮助内容"
				/>
				<text v-if="helpSearch" class="clear-icon" @click="helpSearch = ''">✕</text>
			</view>

			<view class="help-items">
				<view
					v-for="item in filteredHelpItems"
					:key="item.id"
					class="help-item"
					@click="showHelpDetail(item)"
				>
					<text class="help-icon">{{ item.icon }}</text>
					<view class="help-info">
						<text class="help-title">{{ item.title }}</text>
						<text class="help-desc">{{ item.desc }}</text>
					</view>
					<text class="help-arrow">→</text>
				</view>
			</view>
		</view>

		<!-- 反馈内容 -->
		<view v-if="currentTab === 'feedback'" class="tab-content">
			<view class="feedback-intro">
				<text class="intro-text">我们希望听到你的意见，帮助我们做得更好</text>
			</view>

			<!-- 反馈内容表单 -->
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
						v-model="feedbackForm.content"
						class="feedback-textarea"
						placeholder="请详细描述你的意见或建议（必填）"
						maxlength="500"
					/>
					<text class="char-count">{{ feedbackForm.content.length }}/500</text>
				</view>

				<view class="form-group">
					<view class="feedback-checkbox">
						<view
							class="checkbox"
							:class="{ checked: feedbackForm.targetAI }"
							@click="feedbackForm.targetAI = !feedbackForm.targetAI"
						>
							<text v-if="feedbackForm.targetAI">✓</text>
						</view>
						<text class="checkbox-label">反馈给AI，帮助改进推荐算法</text>
					</view>
				</view>

				<view class="form-group">
					<text class="form-label">你的邮箱（可选）</text>
					<input
						v-model="feedbackForm.email"
						type="email"
						class="form-input"
						placeholder="用于接收反馈回复"
					/>
				</view>

				<view class="form-actions">
					<view class="submit-btn" @click="submitFeedback">
						<text class="submit-icon">📤</text>
						<text>提交反馈</text>
					</view>
				</view>
			</view>

			<!-- 我的反馈列表 -->
			<view class="my-feedback-section">
				<text class="section-title">📋 我的反馈</text>
				<view v-if="feedbackList.length > 0">
					<view
						v-for="(feedback, index) in feedbackList"
						:key="index"
						class="feedback-item"
					>
						<view class="feedback-item-header">
							<view class="feedback-meta">
								<text class="feedback-type-badge">{{ getFeedbackTypeLabel(feedback.type) }}</text>
								<text class="feedback-status" :class="feedback.status">{{ feedback.status }}</text>
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

		<view style="height: 60rpx;"></view>
	</view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { ref, computed } from 'vue'
import { getFeedbackList, saveFeedback, getHelpContent } from './my-store'

const currentTab = ref('help')
const helpSearch = ref('')
const feedbackForm = ref({
	type: 'suggestion',
	content: '',
	targetAI: false,
	email: ''
})
const feedbackList = ref([])

const helpItems = ref([])

const feedbackTypes = [
	{ key: 'suggestion', label: '建议', icon: '💡' },
	{ key: 'bug', label: 'Bug报告', icon: '🐛' },
	{ key: 'feedback', label: '意见', icon: '📝' }
]

const filteredHelpItems = computed(() => {
	if (!helpSearch.value) return helpItems.value
	
	const search = helpSearch.value.toLowerCase()
	return helpItems.value.filter(item =>
		item.title.toLowerCase().includes(search) ||
		item.desc.toLowerCase().includes(search)
	)
})

const loadData = () => {
	helpItems.value = getHelpContent()
	feedbackList.value = getFeedbackList()
}

const showHelpDetail = (item) => {
	const detailContent = {
		1: '日程表帮助：点击"每日打卡"添加任务，记录每天完成情况；跑步模块支持计时并自动匹配配乐。',
		2: '社区帮助：在社区页面可以发布动态、评论，关注其他用户和加入讨论，还可以参加健康搭子招募。',
		3: '数据帮助：定期记录跑步时长、专注时长、体重和饮水量，系统会自动汇总生成数据报告。',
		4: '社区榜单帮助：可以查看大家的互动热度、方法分享和用户排名。',
		5: '常见问题：如何修改账号信息？在"我的"页面-"账号与安全"可修改昵称、头像等信息。'
	}

	uni.showModal({
		title: item.title,
		content: detailContent[item.id] || '此功能正在完善中...',
		confirmText: '了解',
		success() {
			//
		}
	})
}

const getFeedbackTypeLabel = (type) => {
	const typeMap = {
		suggestion: '💡 建议',
		bug: '🐛 Bug',
		feedback: '📝 意见'
	}
	return typeMap[type] || type
}

const submitFeedback = () => {
	if (!feedbackForm.value.content.trim()) {
		uni.showToast({
			title: '请输入反馈内容',
			icon: 'none'
		})
		return
	}

	const feedback = saveFeedback({
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
	padding: 0;
}

.tab-bar {
	background: white;
	display: flex;
	align-items: center;
	box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.1);
}

.tab-item {
	flex: 1;
	text-align: center;
	padding: 20rpx;
	font-size: 30rpx;
	font-weight: 600;
	color: $text-light;
	border-bottom: 3rpx solid transparent;
	transition: all 0.2s;

	&.active {
		color: $main-blue;
		border-bottom-color: $main-blue;
	}
}

.tab-content {
	padding: 20rpx;
}

.help-intro,
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
	display: block;
	font-weight: 600;
}

.help-search {
	display: flex;
	align-items: center;
	background: white;
	border-radius: 24rpx;
	padding: 10rpx 16rpx;
	margin-bottom: 16rpx;
	border: 1rpx solid #ddd;
}

.search-icon {
	font-size: 24rpx;
	margin-right: 8rpx;
}

.search-input {
	flex: 1;
	border: none;
	font-size: 26rpx;
	outline: none;
	padding: 0;
}

.clear-icon {
	font-size: 26rpx;
	color: $text-light;
	cursor: pointer;
}

.help-items {
	background: white;
	border-radius: 16rpx;
	padding: 0;
	overflow: hidden;
	box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);
}

.help-item {
	display: flex;
	align-items: center;
	padding: 20rpx 24rpx;
	border-bottom: 1rpx solid #F0F4FA;
	gap: 12rpx;
	transition: all 0.2s;

	&:last-child {
		border-bottom: none;
	}

	&:active {
		background: rgba(79, 161, 242, 0.04);
	}
}

.help-icon {
	font-size: 36rpx;
	min-width: 36rpx;
	height: 36rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.help-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.help-title {
	font-size: 28rpx;
	font-weight: 600;
	color: $text-dark;
}

.help-desc {
	font-size: 24rpx;
	color: $text-light;
}

.help-arrow {
	font-size: 28rpx;
	color: $main-blue;
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
	transition: all 0.2s;
	background: white;
	color: $text-dark;
	font-weight: 500;

	&.active {
		background: $main-blue;
		border-color: $main-blue;
		color: white;
		font-weight: 600;
		box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.2);
	}
}

.feedback-textarea {
	width: 100%;
	border: 1rpx solid #E0E6F2;
	border-radius: 12rpx;
	padding: 16rpx 18rpx;
	font-size: 28rpx;
	line-height: 1.6;
	min-height: 160rpx;
	resize: none;
	box-sizing: border-box;
	font-family: inherit;
	margin-bottom: 8rpx;
	background: white;
	color: #333;
	transition: border-color 0.2s, box-shadow 0.2s;
	outline: none;
	-webkit-appearance: none;
	appearance: none;
}

.feedback-textarea::placeholder {
	color: #ccc;
	font-size: 28rpx;
}

.feedback-textarea:focus {
	border-color: $main-blue;
	box-shadow: 0 0 0 2rpx rgba(79, 161, 242, 0.1);
}

.char-count {
	font-size: 22rpx;
	color: $text-light;
	text-align: right;
	display: block;
}

.form-input {
	width: 100%;
	border: 1rpx solid #E0E6F2;
	border-radius: 12rpx;
	padding: 14rpx 18rpx;
	font-size: 28rpx;
	line-height: 1;
	height: 64rpx;
	box-sizing: border-box;
	background: white;
	color: #333;
	font-family: inherit;
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

.feedback-checkbox {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.checkbox {
	width: 24rpx;
	height: 24rpx;
	border: 1rpx solid #ddd;
	border-radius: 4rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s;

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
	box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.24);
	transition: all 0.3s;

	&:active {
		transform: scale(0.98);
		box-shadow: 0 2rpx 8rpx rgba(79, 161, 242, 0.16);
	}
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
	text-transform: capitalize;

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
