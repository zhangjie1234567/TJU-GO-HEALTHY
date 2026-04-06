<template>
	<view class="container">
		<!-- 年度报告卡片 -->
		<view class="report-card">
			<view class="report-header">
				<text class="report-title">🎉 成长报告</text>
			</view>

			<!-- 关键数据 -->
			<view class="key-stats">
				<view class="key-stat-item">
					<text class="key-stat-icon">📅</text>
					<view class="key-stat-content">
						<text class="key-stat-label">活跃天数</text>
						<text class="key-stat-value">{{ yearlyData.activeDays }}</text>
					</view>
				</view>
				<view class="key-stat-item">
					<text class="key-stat-icon">🎯</text>
					<view class="key-stat-content">
						<text class="key-stat-label">完成目标</text>
						<text class="key-stat-value">{{ yearlyData.goalsCompleted }}</text>
					</view>
				</view>
				<view class="key-stat-item">
					<text class="key-stat-icon">⭐</text>
					<view class="key-stat-content">
						<text class="key-stat-label">获得成就</text>
						<text class="key-stat-value">{{ yearlyData.achievements.length }}</text>
					</view>
				</view>
			</view>

			<!-- 成就徽章 -->
			<view class="achievements-section">
				<text class="section-subtitle">🏆 你的成就</text>
				<view v-if="yearlyData.achievements.length > 0" class="badge-grid">
					<view v-for="(achievement, index) in yearlyData.achievements" :key="index" class="badge">
						<text class="badge-emoji">{{ achievement.emoji }}</text>
						<text class="badge-name">{{ achievement.name }}</text>
					</view>
				</view>
				<view v-else class="empty-achievements">
					<text>开始记录数据，解锁更多成就吧！</text>
				</view>
			</view>

			<!-- 激励语 -->
			<view class="motivation-section">
				<text class="motivation-text">{{ motivationalQuote }}</text>
				<text class="motivation-source">— 轻跃助手</text>
			</view>

			<!-- 目标进度 -->
			<view class="goals-section">
				<text class="section-subtitle">🎯 你的目标</text>
				<view v-if="yearlyData.goals.length > 0">
					<view v-for="(goal, index) in yearlyData.goals" :key="index" class="goal-item">
						<!-- 体重管理特殊显示 -->
						<view v-if="goal.name === '体重管理'" class="weight-goal-card">
							<view class="weight-header">
								<text class="weight-title">{{ goal.name }}</text>
								<text class="weight-status">{{ weightTrend }}</text>
							</view>
							<view class="weight-stats">
								<view class="weight-stat">
									<text class="stat-label">初始体重</text>
									<text class="stat-value">{{ initialWeight || '-' }}</text>
								</view>
								<view class="weight-stat">
									<text class="stat-label">当前体重</text>
									<text class="stat-value">{{ currentWeight || '-' }}</text>
								</view>
								<view class="weight-stat">
									<text class="stat-label">数据记录</text>
									<text class="stat-value">{{ weightRecordCount }}</text>
								</view>
							</view>
							<view v-if="weightChart" class="weight-chart">{{ weightChart }}</view>
							<text class="weight-desc">{{ goal.desc }}</text>
						</view>

						<!-- 其他目标的进度条显示 -->
						<view v-else>
							<view class="goal-header">
								<text class="goal-name">{{ goal.name }}</text>
								<text class="goal-progress">{{ goal.progress }}%</text>
							</view>
							<view class="progress-bar">
								<view class="progress-fill" :style="{ width: goal.progress + '%' }"></view>
							</view>
							<text class="goal-desc">{{ goal.desc }}</text>
						</view>
					</view>
				</view>
				<view v-else class="empty-goals">
					<text class="add-goal-hint">设定新目标，开启年度挑战</text>
					<view class="add-goal-btn" @click="addNewGoal">+ 添加目标</view>
				</view>
			</view>

			<!-- 数据热力图（简化版） -->
			<view class="heatmap-section">
				<text class="section-subtitle">📊 年度活跃度</text>
				<view class="heatmap">
					<view v-for="(week, index) in heatmapData" :key="index" class="heatmap-week">
						<view
							v-for="(day, dayIndex) in week"
							:key="dayIndex"
							class="heatmap-day"
							:style="{ backgroundColor: getHeatmapColor(day.count) }"
							:title="day.label"
						>
							{{ day.char }}
						</view>
					</view>
				</view>
				<text class="heatmap-legend">颜色越深表示活跃度越高</text>
			</view>

			<!-- 精彩时刻 -->
			<view class="highlights-section">
				<text class="section-subtitle">✨ 精彩时刻</text>
				<view v-if="yearlyData.highlights.length > 0">
					<view v-for="(highlight, index) in yearlyData.highlights" :key="index" class="highlight-item">
						<text class="highlight-date">{{ highlight.date }}</text>
						<text class="highlight-text">{{ highlight.text }}</text>
					</view>
				</view>
				<view v-else class="empty-highlights">
					<text>记录更新精彩时刻，让故事更生动</text>
				</view>
			</view>

			<!-- 生成报告按钮 -->
			<view class="report-actions">
				<view class="action-btn regenerate" @click="regenerateReport">
					<text class="action-icon">🔄</text>
					<text class="action-text">刷新报告</text>
				</view>
				<view class="action-btn share" @click="shareReport">
					<text class="action-icon">🔗</text>
					<text class="action-text">分享报告</text>
				</view>
			</view>
		</view>

		<!-- 新增目标弹窗 -->
		<view class="modal-overlay" v-if="showGoalModal" @click.self="showGoalModal = false">
			<view class="modal-content">
				<view class="modal-header">
					<text class="modal-title">添加目标</text>
					<text class="modal-close" @click="showGoalModal = false">✕</text>
				</view>

				<view class="modal-body">
					<view class="form-group">
						<text class="form-label">目标名称</text>
						<input
							v-model="newGoal.name"
							type="text"
							class="form-input"
							placeholder="如：减脂10kg"
						/>
					</view>

					<view class="form-group">
						<text class="form-label">目标描述</text>
						<textarea
							v-model="newGoal.desc"
							class="form-textarea"
							placeholder="描述你的目标和计划"
						/>
					</view>

					<view class="form-group">
						<text class="form-label">初始进度(%)</text>
						<input
							v-model.number="newGoal.progress"
							type="number"
							class="form-input"
							placeholder="0"
							min="0"
							max="100"
						/>
					</view>
				</view>

				<view class="modal-actions">
					<view class="modal-btn cancel" @click="showGoalModal = false">取消</view>
					<view class="modal-btn confirm" @click="saveNewGoal">保存</view>
				</view>
			</view>
		</view>

		<view style="height: 60rpx;"></view>
	</view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { ref, computed } from 'vue'
import { getYearlyReport, saveYearlyReport, getDailyData } from './my-store'

const currentYear = new Date().getFullYear()
const showGoalModal = ref(false)
const dailyData = ref([])

const newGoal = ref({
	name: '',
	desc: '',
	progress: 0
})

const yearlyData = ref({
	year: currentYear,
	activeDays: 0,
	goalsCompleted: 0,
	achievements: [],
	goals: [],
	highlights: []
})

const motivationalQuotes = [
	'每一天的坚持，都是通往成功的阶梯。',
	'你的努力，正在悄悄改变你的人生。',
	'一千次的努力，成就一次的突破。',
	'坚持就是胜利，加油，我的朋友！',
	'健康不是目标，而是一种生活方式。',
	'你值得拥有最好的自己。',
	'从现在开始，你就是最好的版本。',
	'每一次选择健康，都是爱自己的表现。'
]

const motivationalQuote = computed(() => {
	const index = Math.floor(Math.random() * motivationalQuotes.length)
	return motivationalQuotes[index]
})

// 生成热力图数据（基于真实日期数据）
const heatmapData = computed(() => {
	const result = []
	let week = []
	const dayChars = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
	
	// 创建每个日期的数据映射
	const dateCountMap = {}
	dailyData.value.forEach(record => {
		const dateStr = record.date
		dateCountMap[dateStr] = (dateCountMap[dateStr] || 0) + 1
	})

	for (let i = 52; i >= 0; i--) {
		const date = new Date()
		date.setDate(date.getDate() - i)
		const dayName = dayChars[date.getDay()]
		const dateStr = date.toISOString().split('T')[0]
		const count = dateCountMap[dateStr] || 0

		week.push({
			char: dayName.charAt(0),
			label: dateStr,
			count
		})

		if (week.length === 7) {
			result.push([...week])
			week = []
		}
	}

	if (week.length > 0) {
		while (week.length < 7) {
			week.push({ char: '-', label: '', count: 0 })
		}
		result.push(week)
	}

	return result
})

// 计算体重数据统计
const weightData = computed(() => {
	const weights = dailyData.value
		.filter(d => d.metrics && d.metrics.weight > 0)
		.map(d => ({ date: d.date, weight: d.metrics.weight }))
		.sort((a, b) => new Date(a.date) - new Date(b.date))
	return weights
})

const initialWeight = computed(() => {
	const first = weightData.value[0]
	return first ? first.weight + ' kg' : '-'
})

const currentWeight = computed(() => {
	const last = weightData.value[weightData.value.length - 1]
	return last ? last.weight + ' kg' : '-'
})

const weightRecordCount = computed(() => {
	return weightData.value.length + ' 条'
})

const weightTrend = computed(() => {
	if (weightData.value.length < 2) return '暂无趋势'
	const first = weightData.value[0].weight
	const last = weightData.value[weightData.value.length - 1].weight
	const diff = last - first
	if (Math.abs(diff) < 0.5) {
		return '保持稳定 ➡️'
	} else if (diff < 0) {
		return `下降 ${Math.abs(diff).toFixed(1)}kg ⬇️`
	} else {
		return `上升 ${diff.toFixed(1)}kg ⬆️`
	}
})

const weightChart = computed(() => {
	if (weightData.value.length < 2) return ''
	
	const weights = weightData.value.map(d => d.weight)
	const minWeight = Math.min(...weights)
	const maxWeight = Math.max(...weights)
	const range = maxWeight - minWeight || 1
	
	// 生成简单的趋势符号
	let chart = ''
	for (let i = 1; i < weights.length; i++) {
		const prev = weights[i - 1]
		const curr = weights[i]
		const diff = curr - prev
		
		if (Math.abs(diff) < 0.3) {
			chart += '➡️'
		} else if (diff < 0) {
			chart += '📉'
		} else {
			chart += '📈'
		}
	}
	
	return chart
})

const loadData = async () => {
	// 加载每日数据
	dailyData.value = await getDailyData()
	
	// 计算真实统计数据
	calculateYearlyStats()
	
	// 尝试从后端加载已保存的报告
	const report = await getYearlyReport(currentYear)
	if (report) {
		yearlyData.value = {
			...yearlyData.value,
			...report,
			goals: report.goals?.length ? report.goals : generateGoals(),
			achievements: report.achievements?.length ? report.achievements : yearlyData.value.achievements,
			highlights: report.highlights?.length ? report.highlights : yearlyData.value.highlights
		}
	} else {
		yearlyData.value.goals = generateGoals()
	}
}

const calculateYearlyStats = () => {
	if (!dailyData.value || dailyData.value.length === 0) {
		yearlyData.value.activeDays = 0
		yearlyData.value.achievements = []
		return
	}
	
	// 计算活跃天数
	yearlyData.value.activeDays = dailyData.value.length
	
	// 基于真实数据计算成就
	yearlyData.value.achievements = calculateAchievements()
}

const calculateAchievements = () => {
	const achievements = []
	
	if (!dailyData.value || dailyData.value.length === 0) {
		return achievements
	}
	
	// 检查是否有运动数据
	const hasDistance = dailyData.value.some(d => d.metrics && d.metrics.distance > 0)
	if (hasDistance) {
		achievements.push({ emoji: '💪', name: '运动达人' })
	}
	
	// 检查是否有专注数据
	const hasFocus = dailyData.value.some(d => d.metrics && ((d.metrics.focus || 0) > 0 || (d.metrics.fasting || 0) > 0))
	if (hasFocus) {
		achievements.push({ emoji: '⏱️', name: '专注小能手' })
	}
	
	// 检查是否有体重数据
	const weightData = dailyData.value.filter(d => d.metrics && d.metrics.weight > 0)
	if (weightData.length > 0) {
		achievements.push({ emoji: '⚖️', name: '数据记录官' })
	}
	
	// 检查连续打卡（最少3天）
	if (dailyData.value.length >= 3) {
		achievements.push({ emoji: '🔥', name: '连续坚持' })
	}
	
	// 检查是否记录了足量的日期
	if (dailyData.value.length >= 7) {
		achievements.push({ emoji: '⭐', name: '一周挑战' })
	}
	
	// 检查是否有补水数据
	const hasWater = dailyData.value.some(d => d.metrics && ((d.metrics.waterIntake || 0) > 0 || (d.metrics.water || 0) > 0))
	if (hasWater) {
		achievements.push({ emoji: '💧', name: '补水小卫士' })
	}
	
	return achievements
}

const generateGoals = () => {
	// 基于真实数据计算目标进度
	const distanceData = dailyData.value.filter(d => d.metrics && d.metrics.distance > 0)
	const focusData = dailyData.value.filter(d => d.metrics && ((d.metrics.focus || 0) > 0 || (d.metrics.fasting || 0) > 0))
	const weightData = dailyData.value.filter(d => d.metrics && d.metrics.weight > 0)
	
	// 计算运动目标进度（基于记录的天数）
	const exerciseProgress = Math.min(100, Math.floor((distanceData.length / 30) * 100))
	
	// 计算专注目标进度
	const focusProgress = Math.min(100, Math.floor((focusData.length / 30) * 100))
	
	// 计算体重管理进度
	const weightProgress = weightData.length > 0 ? Math.min(100, Math.floor((weightData.length / 30) * 100)) : 0
	
	return [
		{
			name: '每日运动',
			desc: '坚持每天运动至少30分钟',
			progress: exerciseProgress
		},
		{
			name: '专注计划',
			desc: '保持专注与休息节奏',
			progress: focusProgress
		},
		{
			name: '体重管理',
			desc: '定期记录体重数据',
			progress: weightProgress
		}
	]
}

const getHeatmapColor = (count) => {
	if (count === 0) return '#eee'
	if (count <= 2) return '#dbeafe'
	if (count <= 4) return '#7dd3fc'
	if (count <= 6) return '#0ea5e9'
	if (count <= 8) return '#0369a1'
	return '#003d82'
}

const regenerateReport = async () => {
	await loadData()
	uni.showToast({
		title: '报告已刷新',
		icon: 'none'
	})
}

const shareReport = () => {
	const text = `
我的 ${currentYear} 年度成长报告：
活跃天数：${yearlyData.value.activeDays} 天
完成目标：${yearlyData.value.goalsCompleted} 个
获得成就：${yearlyData.value.achievements.length} 个
${motivationalQuote.value}

来轻跃APP，开启你的健康之旅！
	`.trim()

	uni.setClipboardData({
		data: text,
		success() {
			uni.showToast({
				title: '已复制到剪贴板',
				icon: 'none'
			})
		}
	})
}

const addNewGoal = () => {
	showGoalModal.value = true
}

const saveNewGoal = async () => {
	if (!newGoal.value.name) {
		uni.showToast({
			title: '请输入目标名称',
			icon: 'none'
		})
		return
	}

	yearlyData.value.goals.push({
		name: newGoal.value.name,
		desc: newGoal.value.desc,
		progress: newGoal.value.progress
	})

	await saveYearlyReport(yearlyData.value)
	showGoalModal.value = false
	newGoal.value = { name: '', desc: '', progress: 0 }

	uni.showToast({
		title: '目标已添加',
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
	background: linear-gradient(135deg, #E3F2FD 0%, #F0F9FF 100%);
	padding: 20rpx;
}

.report-card {
	background: white;
	border-radius: 20rpx;
	padding: 32rpx 28rpx;
	box-shadow: 0 4rpx 16rpx rgba(79, 161, 242, 0.1);
	margin-bottom: 20rpx;
}

.report-header {
	text-align: center;
	margin-bottom: 32rpx;
	padding-bottom: 0;
	border-bottom: none;
}

.report-title {
	font-size: 48rpx;
	font-weight: 700;
	color: $main-blue;
	display: block;
	letter-spacing: 2rpx;
}

.key-stats {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	gap: 16rpx;
	margin-bottom: 32rpx;
	padding: 0 0 24rpx 0;
	border-bottom: 1rpx solid #F0F4FA;
}

.key-stat-item {
	background: linear-gradient(135deg, #F0F7FF 0%, #E8F4FE 100%);
	border-radius: 16rpx;
	border: 1rpx solid rgba(79, 161, 242, 0.1);
	padding: 20rpx 16rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10rpx;
	box-shadow: 0 2rpx 8rpx rgba(79, 161, 242, 0.06);
}

.key-stat-icon {
	font-size: 44rpx;
}

.key-stat-content {
	text-align: center;
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.key-stat-label {
	font-size: 22rpx;
	color: $text-light;
	font-weight: 500;
}

.key-stat-value {
	font-size: 36rpx;
	font-weight: 700;
	color: $main-blue;
}

.section-subtitle {
	font-size: 32rpx;
	font-weight: 700;
	color: $text-dark;
	display: block;
	margin-bottom: 20rpx;
	padding-bottom: 16rpx;
	border-bottom: 1rpx solid #F0F4FA;
	letter-spacing: 0.5rpx;
}

.achievements-section {
	margin-bottom: 32rpx;
}

.badge-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 14rpx;
	margin-bottom: 20rpx;
}

.badge {
	background: linear-gradient(135deg, #F0F7FF 0%, #E8F4FE 100%);
	border: 1rpx solid rgba(79, 161, 242, 0.1);
	border-radius: 16rpx;
	padding: 16rpx 12rpx;
	text-align: center;
	display: flex;
	flex-direction: column;
	gap: 6rpx;
	align-items: center;
	box-shadow: 0 2rpx 8rpx rgba(79, 161, 242, 0.06);
}

.badge-emoji {
	font-size: 40rpx;
}

.badge-name {
	font-size: 20rpx;
	color: #333;
	font-weight: 600;
	line-height: 1.3;
}

.empty-achievements,
.empty-goals,
.empty-highlights {
	text-align: center;
	padding: 32rpx 20rpx;
	color: $text-light;
	font-size: 26rpx;
	background: #F5F8FD;
	border-radius: 12rpx;
	margin-bottom: 24rpx;
	border: 1rpx dashed rgba(79, 161, 242, 0.2);
}

.motivation-section {
	background: linear-gradient(135deg, #F0F7FF 0%, #E8F4FE 100%);
	border: 1rpx solid rgba(79, 161, 242, 0.15);
	border-radius: 16rpx;
	padding: 28rpx 24rpx;
	margin-bottom: 32rpx;
	text-align: center;
	box-shadow: 0 2rpx 8rpx rgba(79, 161, 242, 0.06);
}

.motivation-text {
	font-size: 30rpx;
	color: #333;
	font-weight: 600;
	display: block;
	line-height: 1.8;
	margin-bottom: 12rpx;
	letter-spacing: 0.5rpx;
}

.motivation-source {
	font-size: 24rpx;
	color: $main-blue;
	display: block;
	font-weight: 500;
}

.goals-section {
	margin-bottom: 32rpx;
	padding: 24rpx;
	background: white;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 8rpx rgba(79, 161, 242, 0.06);
}

.goal-item {
	margin-bottom: 20rpx;
	padding-bottom: 20rpx;
	border-bottom: 1rpx solid #F0F4FA;

	&:last-child {
		border-bottom: none;
		margin-bottom: 0;
		padding-bottom: 0;
	}
}

.goal-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10rpx;
}

.goal-name {
	font-size: 28rpx;
	font-weight: 600;
	color: $text-dark;
}

.goal-progress {
	font-size: 26rpx;
	font-weight: 700;
	color: $main-blue;
}

.progress-bar {
	background: #EEF2F9;
	height: 12rpx;
	border-radius: 6rpx;
	overflow: hidden;
	margin: 10rpx 0;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, $main-blue, #2196f3);
	border-radius: 6rpx;
	transition: width 0.3s ease;
}

.goal-desc {
	font-size: 24rpx;
	color: $text-light;
	line-height: 1.4;
}

/* 体重管理卡片 */
.weight-goal-card {
	padding: 16rpx 0;
}

.weight-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12rpx;
}

.weight-title {
	font-size: 28rpx;
	font-weight: 600;
	color: $text-dark;
}

.weight-status {
	font-size: 24rpx;
	color: $main-blue;
	font-weight: 600;
}

.weight-stats {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 12rpx;
	margin: 12rpx 0 16rpx 0;
	padding: 12rpx;
	background: linear-gradient(135deg, #F0F7FF 0%, #E8F4FE 100%);
	border-radius: 12rpx;
}

.weight-stat {
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 8rpx;
	border-radius: 8rpx;
	background: white;
	box-shadow: 0 1rpx 3rpx rgba(79, 161, 242, 0.08);
}

.stat-label {
	font-size: 22rpx;
	color: $text-light;
	display: block;
	margin-bottom: 6rpx;
}

.stat-value {
	font-size: 26rpx;
	font-weight: 700;
	color: $main-blue;
	display: block;
}

.weight-chart {
	font-size: 24rpx;
	letter-spacing: 4rpx;
	margin: 12rpx 0;
	padding: 12rpx;
	background: #F5F8FD;
	border-radius: 8rpx;
	text-align: center;
	line-height: 1.6;
	color: $text-dark;
}

.weight-desc {
	font-size: 24rpx;
	color: $text-light;
	line-height: 1.4;
	margin-top: 12rpx;
}

.add-goal-hint {
	display: block;
	margin-bottom: 12rpx;
}

.add-goal-btn {
	background: linear-gradient(135deg, $main-blue 0%, #3B8CE8 100%);
	color: white;
	border-radius: 12rpx;
	padding: 12rpx 24rpx;
	font-size: 26rpx;
	text-align: center;
	font-weight: 600;
	display: inline-block;
	box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.2);
}

.heatmap-section {
	margin-bottom: 32rpx;
	padding: 24rpx;
	background: white;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 8rpx rgba(79, 161, 242, 0.06);
}

.heatmap {
	display: flex;
	flex-direction: column;
	gap: 6rpx;
	margin: 20rpx 0;
	padding: 20rpx;
	background: #F5F8FD;
	border-radius: 12rpx;
	overflow-x: auto;
}

.heatmap-week {
	display: flex;
	gap: 4rpx;
}

.heatmap-day {
	width: 18rpx;
	height: 18rpx;
	border-radius: 3rpx;
	font-size: 10rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	color: transparent;
	flex-shrink: 0;
	transition: all 0.2s;

	&:hover {
		transform: scale(1.1);
	}
}

.heatmap-legend {
	font-size: 24rpx;
	color: $text-light;
	text-align: center;
	display: block;
	margin-top: 12rpx;
}

.highlights-section {
	margin-bottom: 32rpx;
	padding: 24rpx;
	background: white;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 8rpx rgba(79, 161, 242, 0.06);
}

.highlight-item {
	padding: 16rpx 0;
	border-bottom: 1rpx solid #F0F4FA;

	&:last-child {
		border-bottom: none;
	}
}

.highlight-date {
	font-size: 24rpx;
	color: $text-light;
	display: block;
	margin-bottom: 6rpx;
}

.highlight-text {
	font-size: 26rpx;
	color: $text-dark;
	font-weight: 500;
	line-height: 1.5;
}

.report-actions {
	display: flex;
	gap: 16rpx;
	margin-top: 28rpx;
	padding-top: 24rpx;
	border-top: 1rpx solid #F0F4FA;
}

.action-btn {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	padding: 18rpx;
	border-radius: 16rpx;
	transition: all 0.3s;
	font-weight: 600;

	&:active {
		transform: scale(0.96);
	}

	&.regenerate {
		background: linear-gradient(135deg, #F0F7FF 0%, #E8F4FE 100%);
		color: $main-blue;
		border: 1rpx solid rgba(79, 161, 242, 0.15);
	}

	&.share {
		background: linear-gradient(135deg, $main-blue 0%, #3B8CE8 100%);
		color: white;
		box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.24);
	}
}

.action-icon {
	font-size: 32rpx;
}

.action-text {
	font-size: 26rpx;
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
	max-height: 80vh;
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
	margin-bottom: 24rpx;
	padding-bottom: 20rpx;
	border-bottom: 1rpx solid #F0F4FA;
}

.modal-title {
	font-size: 34rpx;
	font-weight: 700;
	color: $text-dark;
}

.modal-close {
	font-size: 32rpx;
	color: $text-light;
	cursor: pointer;
	transition: all 0.2s;

	&:active {
		transform: scale(0.9);
	}
}

.modal-body {
	margin: 24rpx 0;
}

.form-group {
	margin-bottom: 24rpx;
}

.form-label {
	font-size: 28rpx;
	font-weight: 600;
	color: $text-dark;
	display: block;
	margin-bottom: 12rpx;
}

.form-input,
.form-textarea {
	width: 100%;
	border: 1rpx solid #E0E6F2;
	border-radius: 12rpx;
	padding: 16rpx 18rpx;
	font-size: 28rpx;
	box-sizing: border-box;
	font-family: inherit;
	background: white;
	color: #333;
	transition: border-color 0.2s, box-shadow 0.2s;
	outline: none;
	-webkit-appearance: none;
	appearance: none;
}

.form-input {
	height: 64rpx;
	line-height: 1;
	padding: 14rpx 18rpx;
}

.form-textarea {
	min-height: 160rpx;
	line-height: 1.6;
	resize: none;
}

.form-input::placeholder,
.form-textarea::placeholder {
	color: #ccc;
	font-size: 28rpx;
}

.form-input:focus,
.form-textarea:focus {
	border-color: $main-blue;
	box-shadow: 0 0 0 2rpx rgba(79, 161, 242, 0.1);
}

.modal-actions {
	display: flex;
	gap: 16rpx;
	margin-top: 28rpx;
	padding-top: 20rpx;
	border-top: 1rpx solid #F0F4FA;
}

.modal-btn {
	flex: 1;
	padding: 16rpx 20rpx;
	border-radius: 12rpx;
	font-size: 28rpx;
	text-align: center;
	font-weight: 600;
	transition: all 0.3s;

	&:active {
		transform: scale(0.96);
	}

	&.cancel {
		background: #F5F8FD;
		color: $text-light;
		border: 1rpx solid #E0E6F2;
	}

	&.confirm {
		background: linear-gradient(135deg, $main-blue 0%, #3B8CE8 100%);
		color: white;
		box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.24);
	}
}
</style>
