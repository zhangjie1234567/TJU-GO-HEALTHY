<template>
	<view class="container">
		<view v-if="questionnaire" class="report-content">
			<view class="section assessment-time">
				<text class="time-label">最后填写时间</text>
				<text class="time-value">{{ formatDate(questionnaire.createTime) }}</text>
			</view>

			<view class="section">
				<text class="section-title">基础信息</text>
				<view class="info-grid">
					<view class="info-item">
						<text class="info-label">性别</text>
						<text class="info-value">{{ questionnaire.gender || '-' }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">年龄</text>
						<text class="info-value">{{ questionnaire.age ? `${questionnaire.age}岁` : '-' }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">身高</text>
						<text class="info-value">{{ questionnaire.height ? `${questionnaire.height}cm` : '-' }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">体重</text>
						<text class="info-value">{{ questionnaire.weight ? `${questionnaire.weight}kg` : '-' }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">BMI</text>
						<text class="info-value">{{ bmi }}</text>
					</view>
					<view class="info-item">
						<text class="info-label">目标体重</text>
						<text class="info-value">{{ questionnaire.targetWeight ? `${questionnaire.targetWeight}kg` : '-' }}</text>
					</view>
				</view>
			</view>

			<view class="section">
				<text class="section-title">目标信息</text>
				<view class="line-item">
					<text class="line-label">健康目标</text>
					<text class="line-value">{{ questionnaire.target || '-' }}</text>
				</view>
				<view class="line-item">
					<text class="line-label">改善部位</text>
					<text class="line-value">{{ improvePartsText }}</text>
				</view>
			</view>

			<view class="section">
				<text class="section-title">运动习惯</text>
				<view class="line-item">
					<text class="line-label">每周运动次数</text>
					<text class="line-value">{{ exerciseFrequencyText }}</text>
				</view>
				<view class="line-item">
					<text class="line-label">运动类型</text>
					<text class="line-value">{{ exerciseTypesText }}</text>
				</view>
				<view class="line-item">
					<text class="line-label">单次时长</text>
					<text class="line-value">{{ exerciseDurationText }}</text>
				</view>
			</view>

			<view class="section">
				<text class="section-title">食物过敏与忌口</text>
				<text class="allergy-text">{{ allergyText }}</text>
			</view>

			<view class="section">
				<view class="reassess-btn" @click="goToQuestionnaire">
					<text>重新填写问卷</text>
				</view>
			</view>
		</view>

		<view v-else class="empty-state">
			<text class="empty-title">还没有问卷记录</text>
			<text class="empty-desc">请先完成问卷填写，再查看我的测评</text>
			<view class="back-to-login-btn" @click="goToQuestionnaire">
				<text>去填写问卷</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { getLatestQuestionnaire } from './my-store'

const questionnaire = ref(null)

const EXERCISE_FREQ_MAP = {
	'0': '0次',
	'1-2': '1-2次',
	'3-4': '3-4次',
	'5-6': '5-6次',
	'7+': '7次及以上'
}

const EXERCISE_TYPE_MAP = {
	low: '低强度（散步/慢跑/骑行等）',
	medium: '中强度（跑步/打球/舞蹈等）',
	high: '高强度（HIIT/拳击/力量等）',
	none: '无固定运动类型'
}

const EXERCISE_DURATION_MAP = {
	'<15': '15分钟以内',
	'15-30': '15-30分钟',
	'31-60': '31-60分钟',
	'61-90': '61-90分钟',
	'>90': '90分钟以上'
}

const FOOD_ALLERGY_MAP = {
	seafood: '海鲜类',
	dairy: '乳制品',
	wheat: '小麦类',
	fruit: '水果类',
	nuts: '坚果类',
	egg: '蛋类',
	soy: '大豆类',
	other: '其他',
	none: '无'
}

const bmi = computed(() => {
	if (!questionnaire.value?.height || !questionnaire.value?.weight) return '-'
	const height = Number(questionnaire.value.height) / 100
	const weight = Number(questionnaire.value.weight)
	if (!height || !weight) return '-'
	return (weight / (height * height)).toFixed(1)
})

const improvePartsText = computed(() => {
	const parts = questionnaire.value?.improveParts
	if (!Array.isArray(parts) || !parts.length) return '-'
	return parts.join('、')
})

const exerciseFrequencyText = computed(() => {
	const value = questionnaire.value?.exerciseFrequency
	if (!value) return '-'
	return EXERCISE_FREQ_MAP[value] || value
})

const exerciseTypesText = computed(() => {
	const list = questionnaire.value?.exerciseTypes
	if (!Array.isArray(list) || !list.length) {
		return questionnaire.value?.exerciseFrequency === '0' ? '无' : '-'
	}
	return list.map(item => EXERCISE_TYPE_MAP[item] || item).join('、')
})

const exerciseDurationText = computed(() => {
	if (questionnaire.value?.exerciseFrequency === '0') return '无'
	const value = questionnaire.value?.exerciseDuration
	if (!value) return '-'
	return EXERCISE_DURATION_MAP[value] || value
})

const allergyText = computed(() => {
	const allergies = questionnaire.value?.foodAllergies
	if (!allergies || typeof allergies !== 'object') return '-'
	const keys = Object.keys(allergies)
	if (!keys.length || keys.includes('none')) return '无'
	return keys.map(key => {
		const label = FOOD_ALLERGY_MAP[key] || key
		const detail = String(allergies[key] || '').trim()
		return detail ? `${label}：${detail}` : label
	}).join('；')
})

const formatDate = (value) => {
	if (!value) return '-'
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return '-'
	return date.toLocaleString('zh-CN', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit'
	})
}

const goToQuestionnaire = () => {
	uni.navigateTo({
		url: '/pages/questionnaire/questionnaire'
	})
}

const loadData = async () => {
	questionnaire.value = await getLatestQuestionnaire()
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

.section {
	background: white;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);
}

.assessment-time {
	display: flex;
	justify-content: space-between;
	align-items: center;
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

.section-title {
	font-size: 32rpx;
	font-weight: 700;
	color: $text-dark;
	margin-bottom: 16rpx;
	display: block;
}

.info-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16rpx;
}

.info-item {
	background: #F7FBFF;
	border-radius: 12rpx;
	padding: 18rpx;
	text-align: center;
}

.info-label {
	font-size: 24rpx;
	color: $text-light;
	display: block;
	margin-bottom: 6rpx;
}

.info-value {
	font-size: 30rpx;
	font-weight: 700;
	color: $main-blue;
	display: block;
}

.line-item {
	display: flex;
	justify-content: space-between;
	gap: 16rpx;
	padding: 14rpx 0;
	border-bottom: 1rpx solid #EEF3FA;

	&:last-child {
		border-bottom: none;
	}
}

.line-label {
	font-size: 26rpx;
	color: $text-light;
}

.line-value {
	font-size: 26rpx;
	font-weight: 600;
	color: $text-dark;
	text-align: right;
	flex: 1;
}

.allergy-text {
	font-size: 26rpx;
	color: $text-dark;
	line-height: 1.6;
}

.reassess-btn {
	background: linear-gradient(135deg, $main-blue 0%, #3B8CE8 100%);
	color: white;
	padding: 20rpx 24rpx;
	border-radius: 14rpx;
	text-align: center;
	font-size: 30rpx;
	font-weight: 600;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 24rpx;
	text-align: center;
	background: white;
	border-radius: 20rpx;
	margin: 60rpx 20rpx;
	box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.1);
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
}
</style>
