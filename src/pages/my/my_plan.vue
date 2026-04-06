<template>
	<view class="container">
		<!-- 当前方案 -->
		<view class="current-section" v-if="currentPlan">
			<view class="plan-card current">
				<view class="plan-icon-large">{{ currentPlan.icon || '🎯' }}</view>
				<view class="plan-info-large">
					<text class="plan-name-large">{{ currentPlan.name }}</text>
					<text class="plan-desc-large">{{ currentPlan.desc }}</text>
					<text class="plan-badge">使用中</text>
				</view>
			</view>

			<!-- 今日任务 -->
			<view class="today-tasks" v-if="currentPlan.details">
				<view class="tasks-header">
					<text class="tasks-title">📋 今日任务</text>
					<text class="progress-text">{{ completedTasks }}/{{ todayTasks.length }} 完成</text>
				</view>
				<view class="task-list">
					<view v-for="(task, index) in todayTasks" :key="index" class="task-item" :class="{ completed: task.done }">
						<view class="task-checkbox" @click="toggleTask(index)">
							<text v-if="task.done">✓</text>
						</view>
						<view class="task-content">
							<text class="task-text">{{ task.text }}</text>
							<text v-if="task.tip" class="task-tip">{{ task.tip }}</text>
						</view>
						<text class="task-time">{{ task.time }}</text>
					</view>
				</view>
			</view>

			<!-- 本周计划 -->
			<view class="weekly-plan" v-if="currentPlan.details">
				<view class="section-header">
					<text class="section-label">本周计划</text>
					<text class="week-info">第 {{ currentWeek }} 周</text>
				</view>
				<view class="plan-content">
					<text class="plan-text">{{ getCurrentWeekPlan }}</text>
				</view>
			</view>

			<!-- 快捷操作 -->
			<view class="quick-actions">
				<view class="action-card reminder-card" @click="showReminderSetting">
					<text class="action-icon">🔔</text>
					<text class="action-text">设置提醒</text>
				</view>
				<view class="action-card progress-card" @click="showProgressModal = true">
					<text class="action-icon">📈</text>
					<text class="action-text">查看进度</text>
				</view>
				<view class="action-card switch-card" @click="switchPlan">
					<text class="action-icon">🔄</text>
					<text class="action-text">切换方案</text>
				</view>
			</view>
		</view>

		<!-- 其他方案网格 -->
		<view class="section" v-if="otherPlans.length > 0">
			<text class="section-label">其他方案</text>
			<view class="plans-grid">
				<view
					v-for="plan in otherPlans"
					:key="plan.id"
					class="plan-grid-card"
					@click="selectPlan(plan)"
				>
					<text class="grid-icon">{{ plan.icon || '📋' }}</text>
					<text class="grid-name">{{ plan.name }}</text>
					<text class="grid-desc">{{ plan.desc }}</text>
					<text class="select-btn-grid">选择</text>
				</view>
			</view>
		</view>

		<!-- 推荐方案网格 -->
		<view class="section">
			<view class="section-header">
				<text class="section-label">推荐方案</text>
				<text class="add-btn" @click="showAddModal = true">+ 创建</text>
			</view>
			<view class="plans-grid">
				<view
					v-for="template in planTemplates"
					:key="template.id"
					class="template-grid-card"
				@click="showPlanDetail(template)"
			>
				<text class="grid-icon">{{ template.icon }}</text>
				<text class="grid-name">{{ template.name }}</text>
				<text class="grid-desc">{{ template.desc }}</text>
				<text class="use-btn-grid">了解详情</text>
			</view>
		</view>
	</view>

	<!-- 方案详情弹窗 -->
	<view class="modal-overlay" v-if="showDetailModal" @click.self="showDetailModal = false">
		<view class="modal-content detail-modal">
			<view class="modal-header">
				<text class="modal-title">{{ selectedTemplate?.name }}</text>
				<text class="modal-close" @click="showDetailModal = false">✕</text>
			</view>

			<view class="modal-body" v-if="selectedTemplate">
				<view class="detail-section">
					<view class="detail-icon">{{ selectedTemplate.icon }}</view>
					<view class="detail-info">
						<view class="info-row">
							<text class="label">目标：</text>
							<text class="value">{{ selectedTemplate.target }}</text>
						</view>
						<view class="info-row">
							<text class="label">周期：</text>
							<text class="value">{{ selectedTemplate.duration }}天</text>
						</view>
					</view>
				</view>

				<view class="detail-text">
					<text class="detail-title">计划介绍</text>
					<text class="detail-content">{{ selectedTemplate.details.overview }}</text>
				</view>

				<view class="detail-features">
					<text class="detail-title">特色亮点</text>
					<view v-for="(feature, idx) in selectedTemplate.details.features" :key="idx" class="feature-tag">
						{{ feature }}
					</view>
				</view>

				<view class="detail-plan">
					<text class="detail-title">周期安排</text>
					<view v-for="(week, idx) in selectedTemplate.details.weeklyPlan" :key="idx" class="week-item">
						<text class="week-text">{{ week }}</text>
					</view>
				</view>

				<view class="detail-result">
					<text class="detail-title">预期效果</text>
					<text class="result-text">{{ selectedTemplate.details.expectedResult }}</text>
				</view>

				<view class="modal-actions">
					<view class="modal-btn cancel" @click="showDetailModal = false">关闭</view>
					<view class="modal-btn confirm" @click="usePlanTemplate(selectedTemplate)">使用此方案</view>
				</view>
			</view>
		</view>
	</view>

	<!-- 创建方案弹窗 -->
	<view class="modal-overlay" v-if="showAddModal" @click.self="showAddModal = false">
		<view class="modal-content">
			<view class="modal-header">
				<text class="modal-title">创建新方案</text>
				<text class="modal-close" @click="showAddModal = false">✕</text>
			</view>

			<view class="modal-body">
				<view class="form-group">
					<text class="form-label">方案名称</text>
					<input
						v-model="newPlan.name"
						type="text"
						class="form-input"
						placeholder="如：快速减脂方案"
						maxlength="20"
					/>
				</view>

				<view class="form-group">
					<text class="form-label">方案描述</text>
					<textarea
						v-model="newPlan.desc"
						class="form-textarea"
						placeholder="描述这个方案的目标和特点"
						maxlength="100"
					/>
				</view>

				<view class="form-group">
					<text class="form-label">选择图标</text>
					<view class="icon-grid">
						<view
							v-for="icon in iconList"
							:key="icon"
							class="icon-item"
							:class="{ selected: newPlan.icon === icon }"
							@click="newPlan.icon = icon"
						>
							{{ icon }}
						</view>
					</view>
				</view>

				<view class="form-group">
					<text class="form-label">目标</text>
					<input
						v-model="newPlan.target"
						type="text"
						class="form-input"
						placeholder="如：减脂10kg"
					/>
				</view>

				<view class="form-group">
					<text class="form-label">预期周期（天）</text>
					<input
						v-model="newPlan.duration"
						type="number"
						class="form-input"
						placeholder="30"
					/>
				</view>
			</view>

			<view class="modal-actions">
				<view class="modal-btn cancel" @click="showAddModal = false">取消</view>
				<view class="modal-btn confirm" @click="savePlan">创建</view>
			</view>
		</view>
	</view>

	<view style="height: 60rpx;"></view>

	<!-- 进度查看模态框 -->
	<view class="modal-overlay" v-if="showProgressModal" @click.self="showProgressModal = false">
		<view class="modal-content">
			<view class="modal-header">
				<text class="modal-title">📊 方案进度</text>
				<text class="modal-close" @click="showProgressModal = false">✕</text>
			</view>

			<view class="modal-body" v-if="currentPlan">
				<!-- 进度概览 -->
				<view class="progress-overview">
					<view class="progress-card-item">
						<text class="progress-label">目标</text>
						<text class="progress-value">{{ currentPlan.target }}</text>
					</view>
					<view class="progress-card-item">
						<text class="progress-label">总周期</text>
						<text class="progress-value">{{ currentPlan.duration }}天</text>
					</view>
				</view>

				<!-- 进度条 -->
				<view class="progress-section">
					<view class="section-title">总体进度</view>
					<view class="progress-bar">
						<view class="progress-fill" :style="{ width: planProgress + '%' }"></view>
					</view>
					<view class="progress-text">
						已完成 {{ planDaysElapsed }} / {{ currentPlan.duration }} 天 ({{ planProgress }}%)
					</view>
				</view>

				<!-- 当前周信息 -->
				<view class="week-section">
					<view class="section-title">第 {{ currentWeek }} 周进度</view>
					<view class="week-info">
						<text class="week-desc">{{ getCurrentWeekPlan }}</text>
					</view>
					<view class="week-days">
						<view v-for="day in 7" :key="day" class="day-item" :class="{ done: day <= weekDayProgress }">
							{{ day }}
						</view>
					</view>
				</view>

				<!-- 今日完成情况 -->
				<view class="today-section">
					<view class="section-title">今日完成情况</view>
					<view class="completion-rate">
						<view class="rate-circle" :style="{ borderColor: getCompletionColor() }">
							<text class="rate-text">{{ completedTasks }}/{{ todayTasks.length }}</text>
						</view>
						<text class="rate-label">个任务已完成</text>
					</view>
				</view>

				<!-- 激励文案 -->
				<view class="motivation-box">
					<text class="motivation-text">{{ getMotivationText }}</text>
				</view>

				<view class="modal-actions">
					<view class="modal-btn confirm" @click="showProgressModal = false">返回</view>
				</view>
			</view>
		</view>
	</view>
</view>
</template>

<script setup>
import { onShow } from '@dcloudio/uni-app'
import { ref, computed } from 'vue'
import {
	getCurrentPlan,
	setCurrentPlan,
	getUserPlans,
	createUserPlan,
	updateUserPlan
} from './my-store'

const plans = ref([])
const currentPlan = ref(null)
const showAddModal = ref(false)
const showDetailModal = ref(false)
const showProgressModal = ref(false)
const selectedTemplate = ref(null)

const newPlan = ref({
	name: '',
	desc: '',
	icon: '🎯',
	target: '',
	duration: 30
})

const iconList = ['🎯', '💪', '🏃', '🚴', '🤸', '⚽', '🏊', '🧘', '🥗', '📈']

const planTemplates = [
	{
		id: 1,
		name: '速效减脂方案',
		desc: '8周快速塑形，高强度训练',
		icon: '⚡',
		target: '减脂8kg',
		duration: 56,
		details: {
			overview: '这是一个密集型的减脂方案，通过高强度训练和合理饮食控制，在8周内快速减脂。',
			features: ['高强度间隔训练', '热量赤字控制', '高蛋白饮食', '每周6次训练'],
			weeklyPlan: [
				'第1-2周：适应期，建立训练习惯，控制饮食热量',
				'第3-4周：强化期，增加训练强度和运动时间',
				'第5-6周：突破期，加入力量训练，加快代谢',
				'第7-8周：冲刺期，最后冲刺，稳定成果'
			],
			expectedResult: '预期减脂8kg，腰围减少8-10cm，体脂率下降3-5%'
		}
	},
	{
		id: 2,
		name: '科学慢减方案',
		desc: '12周均衡减脂，养成习惯',
		icon: '📊',
		target: '减脂6kg',
		duration: 84,
		details: {
			overview: '这是一个科学的渐进式减脂方案，注重养成健康习惯而不是快速减脂。',
			features: ['中等强度训练', '均衡营养饮食', '循序渐进', '可持续性强'],
			weeklyPlan: [
				'第1-3周：基础期，建立运动和饮食习惯',
				'第4-6周：进阶期，逐步增加训练强度',
				'第7-9周：稳定期，保持训练，感受身体变化',
				'第10-12周：维持期，巩固成果，规划后续'
			],
			expectedResult: '预期减脂6kg，腰围减少6-8cm，健康指标改善'
		}
	},
	{
		id: 3,
		name: '健身增肌方案',
		desc: '增强体质，练出肌肉线条',
		icon: '💪',
		target: '增肌3kg',
		duration: 90,
		details: {
			overview: '这是一个专业的增肌方案，通过系统的力量训练和营养补充，打造理想身材。',
			features: ['力量训练为主', '高蛋白饮食', '充足休息恢复', '科学补剂指导'],
			weeklyPlan: [
				'第1-4周：打基础，掌握正确的训练技术',
				'第5-8周：增量期，逐步增加重量和体积训练',
				'第9-10周：冲刺期，高强度训练，最大肌肥大',
				'第11-12周：修整期，雕刻线条，展示肌肉'
			],
			expectedResult: '预期增肌3kg，肌肉线条清晰，力量提升30-40%'
		}
	},
	{
		id: 4,
		name: '瑜伽冥想方案',
		desc: '放松身心，提升柔韧性',
		icon: '🧘',
		target: '提升柔韧度',
		duration: 60,
		details: {
			overview: '这是一个身心平衡的方案，通过瑜伽和冥想改善身体柔韧性和心理状态。',
			features: ['柔和的瑜伽序列', '每日冥想练习', '压力释放', '身心平衡'],
			weeklyPlan: [
				'第1-2周：基础瑜伽，了解身体，每周3-4次',
				'第3-4周：流瑜伽提升，增加难度，体验呼吸',
				'第5-6周：深度练习，冥想时间延长至15分钟',
				'第7-8周：综合提升，达到身心平衡'
			],
			expectedResult: '柔韧性显著提升，压力缓解，睡眠质量改善，心情舒畅'
		}
	}
]

const otherPlans = computed(() => {
	return plans.value.filter(p => p.id !== (currentPlan.value?.id))
})

const safeParseJSON = (value, fallback) => {
	if (!value) return fallback
	if (typeof value === 'object') return value
	try {
		return JSON.parse(value)
	} catch (error) {
		return fallback
	}
}

const loadData = async () => {
	try {
		const [planList, current] = await Promise.all([
			getUserPlans(),
			getCurrentPlan()
		])
		plans.value = planList || []
		currentPlan.value = current || null
	} catch (error) {
		plans.value = []
		currentPlan.value = null
	}
}

const selectPlan = (plan) => {
	uni.showModal({
		title: '切换方案',
		content: `确定切换到"${plan.name}"吗？`,
		async success(res) {
			if (res.confirm) {
				const ok = await setCurrentPlan(plan)
				if (!ok) return
				await loadData()
				// setCurrentPlan 已写缓存，但 loadData 可能再次覆盖，确保缓存与当前一致
				if (currentPlan.value?.id) {
					uni.setStorageSync('current_plan_cache', JSON.stringify(currentPlan.value))
				}
				generateTodayTasks()
				uni.showToast({
					title: '方案已切换',
					icon: 'none'
				})
			}
		}
	})
}

const savePlan = async () => {
	if (!newPlan.value.name) {
		uni.showToast({
			title: '请输入方案名称',
			icon: 'none'
		})
		return
	}

	if (!uni.getStorageSync('auth_token')) {
		uni.showToast({
			title: '请先登录后再创建方案',
			icon: 'none'
		})
		return
	}

	const plan = await createUserPlan(newPlan.value)
	if (!plan) return

	await setCurrentPlan(plan)
	await loadData()
	generateTodayTasks()

	showAddModal.value = false
	newPlan.value = {
		name: '',
		desc: '',
		icon: '🎯',
		target: '',
		duration: 30
	}

	uni.showToast({
		title: '方案已创建',
		icon: 'none'
	})
}

const usePlanTemplate = (template) => {
	uni.showModal({
		title: '使用模板',
		content: `确定使用"${template.name}"吗？\n\n目标: ${template.target}\n周期: ${template.duration}天`,
		async success(res) {
			if (res.confirm) {
				// 拿到已有方案 id（来自当前状态或缓存），避免依赖后端 POST/PUT 成功
				let existingId = currentPlan.value?.id
				if (!existingId) {
					try {
						const raw = uni.getStorageSync('current_plan_cache')
						const cached = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : null
						if (cached?.id) existingId = cached.id
					} catch (e) {}
				}

				// 立即构建富方案对象并写入缓存，让用户立刻看到切换效果
				const richPlan = {
					id: existingId || 0,
					name: template.name,
					desc: template.desc,
					description: template.desc,
					type: template.target,
					icon: template.icon,
					target: template.target,
					duration: template.duration,
					details: template.details,
					isTemplate: true
				}
				currentPlan.value = richPlan
				uni.setStorageSync('current_plan_cache', JSON.stringify(richPlan))
				generateTodayTasks()

				showDetailModal.value = false
				selectedTemplate.value = null

				uni.showToast({ title: '已使用模板，开始你的健身之旅！', icon: 'success' })

				// 后台异步同步到服务器（不阻塞 UI，失败不影响本地显示）
				;(async () => {
					try {
						let syncedId = existingId
						if (syncedId) {
							// 有已知 id：先尝试 PUT 更新方案内容
							const updated = await updateUserPlan(syncedId, richPlan)
							if (updated?.id) syncedId = updated.id
						} else {
							// 无 id：尝试 POST 创建
							const created = await createUserPlan(richPlan)
							if (created?.id) syncedId = created.id
						}
						if (syncedId) {
							await setCurrentPlan({ id: syncedId })
							// 服务端有效 id 写回缓存
							const finalPlan = { ...richPlan, id: syncedId }
							currentPlan.value = finalPlan
							uni.setStorageSync('current_plan_cache', JSON.stringify(finalPlan))
						}
					} catch (e) { /* 后台同步失败不影响本地 */ }
					// 后台刷新方案列表
					loadData().then(() => {
						// loadData 后用本地模板数据修复可能被覆盖的 currentPlan
						if (currentPlan.value) {
							const merged = {
								...currentPlan.value,
								name: richPlan.name,
								icon: richPlan.icon,
								details: richPlan.details,
								target: richPlan.target,
								isTemplate: true
							}
							currentPlan.value = merged
							uni.setStorageSync('current_plan_cache', JSON.stringify(merged))
						}
					})
				})()
			}
		}
	})
}

const showPlanDetail = (template) => {
	selectedTemplate.value = template
	showDetailModal.value = true
}

// 日常任务相关
const todayTasks = ref([])
const currentWeek = ref(1)
const completedTasks = computed(() => {
	return todayTasks.value.filter(t => t.done).length
})

// 根据当前计划生成今日任务
const generateTodayTasks = () => {
	if (!currentPlan.value || !currentPlan.value.details) {
		todayTasks.value = []
		return
	}

	// 计算已经过去的天数
	const planStartDateStr = uni.getStorageSync(`plan_${currentPlan.value.id}_start_date`)
	const planStartDate = planStartDateStr ? new Date(planStartDateStr) : new Date()
	
	if (!planStartDateStr) {
		uni.setStorageSync(`plan_${currentPlan.value.id}_start_date`, planStartDate.toISOString())
	}

	const today = new Date()
	const daysElapsed = Math.floor((today - planStartDate) / (1000 * 60 * 60 * 24))
	const currentDay = (daysElapsed % 7) + 1
	const weekIndex = Math.floor(daysElapsed / 7)

	currentWeek.value = weekIndex + 1

	// 根据方案类型生成不同的日常任务
	const planName = currentPlan.value.name
	let dailyTasks = []

	if (planName.includes('减脂')) {
		const dayTasks = [
			{ text: '晨间有氧运动', time: '06:00-07:00', tip: '30分钟慢跑或骑车' },
			{ text: '力量训练', time: '18:00-19:30', tip: '腹部+腿部训练' },
			{ text: '晚间散步', time: '20:00-20:30', tip: '促进消化' },
			{ text: '控制热量摄入', time: '全天', tip: '不超过1800大卡' },
			{ text: '补充蛋白质', time: '三餐', tip: '每餐25-30g蛋白质' },
			{ text: '记录体重', time: '07:00', tip: '早晨空腹测量' },
			{ text: '喝水8杯', time: '全天', tip: '每杯250ml，加速代谢' }
		]
		dailyTasks = dayTasks
	} else if (planName.includes('增肌')) {
		const dayTasks = [
			{ text: '力量训练95分钟', time: '18:00-19:35', tip: '今日练习: 胸背日' },
			{ text: '有氧热身', time: '17:45-18:00', tip: '15分钟热身' },
			{ text: '蛋白质摄入', time: '三餐+加餐', tip: '2g/kg体重' },
			{ text: '休息恢复', time: '22:00-06:00', tip: '8小时睡眠' },
			{ text: '记录训练', time: '19:45', tip: '重量、组数、次数' },
			{ text: '肌肉拉伸', time: '19:40-19:55', tip: '10-15分钟放松' },
			{ text: '补充水分', time: '全天', tip: '3-4升水' }
		]
		dailyTasks = dayTasks
	} else if (planName.includes('瑜伽')) {
		const dayTasks = [
			{ text: '晨间瑜伽', time: '06:30-07:15', tip: '流瑜伽 45分钟' },
			{ text: '冥想练习', time: '20:00-20:15', tip: '深呼吸冥想15分钟' },
			{ text: '柔韧性训练', time: '18:00-18:30', tip: '拉伸主要肌群' },
			{ text: '瑜伽体式练习', time: '19:00-20:00', tip: '倒立体式+站立体式' },
			{ text: '冥想日记', time: '20:30', tip: '记录今日感受' },
			{ text: '充足睡眠', time: '23:00-07:00', tip: '8小时高质睡眠' },
			{ text: '健康饮食', time: '三餐', tip: '清淡营养为宜' }
		]
		dailyTasks = dayTasks
	} else {
		// 默认任务
		const dayTasks = [
			{ text: '早晨锻炼', time: '07:00', tip: '30分钟运动' },
			{ text: '健康早餐', time: '08:00', tip: '蛋白质+碳水' },
			{ text: '工作/学习中拉伸', time: '12:00', tip: '5分钟办公室拉伸' },
			{ text: '午间食事', time: '12:30', tip: '均衡营养' },
			{ text: '下午有氧运动', time: '17:00', tip: '30-45分钟' },
			{ text: '晚餐', time: '18:30', tip: '清淡易消化' },
			{ text: '睡前放松', time: '21:30', tip: '冥想或拉伸' }
		]
		dailyTasks = dayTasks
	}

	// 加载已完成状态
	const tasksStateStr = uni.getStorageSync(`tasks_${new Date().toDateString()}`)
	const tasksState = safeParseJSON(tasksStateStr, {})

	todayTasks.value = dailyTasks.map((task, index) => ({
		...task,
		done: tasksState[index] || false
	}))
}

const toggleTask = (index) => {
	todayTasks.value[index].done = !todayTasks.value[index].done
	
	// 保存到本地存储
	const tasksState = {}
	todayTasks.value.forEach((task, idx) => {
		tasksState[idx] = task.done
	})
	uni.setStorageSync(`tasks_${new Date().toDateString()}`, JSON.stringify(tasksState))

	// 显示完成提示
	if (todayTasks.value[index].done) {
		uni.showToast({
			title: '太棒了！继续加油！',
			icon: 'success',
			duration: 1000
		})
	}
}

const showReminderSetting = () => {
	uni.showToast({
		title: '提醒功能开发中',
		icon: 'none'
	})
}

// 计算计划进度
const planDaysElapsed = computed(() => {
	if (!currentPlan.value) return 0
	const planStartDateStr = uni.getStorageSync(`plan_${currentPlan.value.id}_start_date`)
	if (!planStartDateStr) return 0
	const planStartDate = new Date(planStartDateStr)
	const today = new Date()
	const daysElapsed = Math.floor((today - planStartDate) / (1000 * 60 * 60 * 24))
	return Math.max(0, daysElapsed + 1)
})

const planProgress = computed(() => {
	if (!currentPlan.value) return 0
	const elapsed = planDaysElapsed.value
	const total = currentPlan.value.duration
	return Math.min(100, Math.round((elapsed / total) * 100))
})

const weekDayProgress = computed(() => {
	const weekIndex = currentWeek.value - 1
	const daysElapsed = planDaysElapsed.value
	const daysPerWeek = 7
	const weekStartDay = weekIndex * daysPerWeek + 1
	const currentDayInWeek = daysElapsed - weekStartDay + 1
	return Math.max(0, Math.min(7, currentDayInWeek))
})

const getCompletionColor = () => {
	const rate = completedTasks.value / (todayTasks.value.length || 1)
	if (rate >= 0.8) return '#4CAF50'
	if (rate >= 0.5) return '#FF9800'
	return '#F44336'
}

const getMotivationText = computed(() => {
	const rate = completedTasks.value / (todayTasks.value.length || 1)
	const progress = planProgress.value
	
	if (progress === 100) {
		return '🎉 太棒了！你已经完成了整个计划！坚持就是胜利！'
	}
	
	if (rate === 1) {
		return '💪 今天的任务全部完成！你最棒了！'
	}
	
	if (rate >= 0.8) {
		return '🌟 差不多了，再加把劲就能完成今日目标！'
	}
	
	if (rate >= 0.5) {
		return '✨ 已完成一半了，再接再厉！'
	}
	
	if (rate > 0) {
		return '🚀 已经开始了，相信自己能坚持！'
	}
	
	return '💡 今天的任务已为你准备好，现在就开始吧！'
})

const switchPlan = () => {
	// 滚动到其他方案网格
	uni.pageScrollTo({
		selector: '.plans-grid',
		duration: 300
	})
}

const getCurrentWeekPlan = computed(() => {
	if (!currentPlan.value?.details?.weeklyPlan) return ''
	const weekIndex = currentWeek.value - 1
	const maxWeeks = currentPlan.value.details.weeklyPlan.length
	if (weekIndex >= maxWeeks) {
		return currentPlan.value.details.weeklyPlan[maxWeeks - 1]
	}
	return currentPlan.value.details.weeklyPlan[weekIndex] || ''
})

onShow(() => {
	// 先读缓存立即渲染，不阻塞页面显示
	try {
		const cachedPlan = uni.getStorageSync('current_plan_cache')
		if (cachedPlan) {
			const p = typeof cachedPlan === 'string' ? JSON.parse(cachedPlan) : cachedPlan
			if (p?.id) {
				currentPlan.value = p
				generateTodayTasks()
			}
		}
	} catch (e) {}
	// 后台异步刷新
	loadData().then(() => generateTodayTasks())
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
	padding: 24rpx;
}

.current-section {
	margin-bottom: 60rpx;
}

.section {
	margin-bottom: 60rpx;
}

.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24rpx;
}

.section-label {
	font-size: 32rpx;
	font-weight: 700;
	color: $text-dark;
}

.plan-card {
	background: linear-gradient(135deg, white 0%, #F8FBFF 100%);
	border-radius: 28rpx;
	padding: 40rpx 28rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 18rpx;
	transition: all 0.2s;
	box-shadow: 0 12rpx 32rpx rgba(79, 161, 242, 0.15);
	border: 1rpx solid rgba(79, 161, 242, 0.1);

	&.current {
		box-shadow: 0 16rpx 48rpx rgba(79, 161, 242, 0.25);
		border: 1rpx solid rgba(79, 161, 242, 0.2);
	}

	&:active {
		transform: scale(0.98);
	}
}

.plan-icon-large {
	font-size: 72rpx;
	margin-bottom: 12rpx;
}

.plan-info-large {
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
}

.plan-name-large {
	font-size: 40rpx;
	font-weight: 700;
	color: $text-dark;
	margin-bottom: 12rpx;
}

.plan-desc-large {
	font-size: 28rpx;
	color: $text-light;
	margin-bottom: 20rpx;
}

.plan-name {
	font-size: 28rpx;
	font-weight: 600;
	color: $text-dark;
}

.plan-desc {
	font-size: 24rpx;
	color: $text-light;
}

.plan-badge {
	background: linear-gradient(135deg, #4FA1F2 0%, #357ABD 100%);
	color: white;
	padding: 8rpx 18rpx;
	border-radius: 20rpx;
	font-size: 24rpx;
	font-weight: 700;
	margin-top: 8rpx;
	box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.3);
	letter-spacing: 0.5rpx;
}

/* 今日任务样式 */
.today-tasks {
	background: white;
	border-radius: 18rpx;
	padding: 26rpx;
	margin-bottom: 32rpx;
	box-shadow: 0 6rpx 16rpx rgba(79, 161, 242, 0.1);
	border: 1rpx solid rgba(79, 161, 242, 0.08);
}

.tasks-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 18rpx;
	padding-bottom: 14rpx;
	border-bottom: 1rpx solid #eee;
}

.tasks-title {
	font-size: 28rpx;
	font-weight: 600;
	color: $text-dark;
}

.progress-text {
	font-size: 22rpx;
	color: $main-blue;
	font-weight: 600;
}

.task-list {
	display: flex;
	flex-direction: column;
	gap: 14rpx;
}

.task-item {
	display: flex;
	align-items: center;
	gap: 14rpx;
	padding: 14rpx 16rpx;
	background: linear-gradient(135deg, #F5F8FB 0%, #FAFBFF 100%);
	border-radius: 12rpx;
	transition: all 0.2s;
	border: 1rpx solid rgba(79, 161, 242, 0.08);

	&.completed {
		background: linear-gradient(135deg, #E8F5E9 0%, #F1F8F6 100%);
		border-color: rgba(76, 175, 80, 0.15);

		.task-text {
			color: #999;
			text-decoration: line-through;
		}

		.task-checkbox {
			background: #4CAF50;
			border-color: #4CAF50;
		}
	}
}

.task-checkbox {
	width: 32rpx;
	height: 32rpx;
	border: 2rpx solid #CFE9FF;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	color: white;
	font-size: 18rpx;
	font-weight: bold;
	transition: all 0.3s;
	background: transparent;
}

.task-content {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.task-text {
	font-size: 26rpx;
	color: $text-dark;
	font-weight: 500;
}

.task-tip {
	font-size: 20rpx;
	color: $text-light;
}

.task-time {
	font-size: 20rpx;
	color: #999;
	white-space: nowrap;
}

/* 本周计划样式 */
.weekly-plan {
	background: white;
	border-radius: 18rpx;
	padding: 26rpx;
	margin-bottom: 32rpx;
	box-shadow: 0 6rpx 16rpx rgba(79, 161, 242, 0.1);
	border: 1rpx solid rgba(79, 161, 242, 0.08);
}

.plan-content {
	margin-top: 16rpx;
}

.plan-text {
	font-size: 24rpx;
	color: $text-dark;
	line-height: 1.6;
	display: block;
}

/* 快捷操作样式 */
.quick-actions {
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	gap: 16rpx;
	margin-bottom: 48rpx;
}

.action-card {
	border-radius: 16rpx;
	padding: 24rpx 18rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12rpx;
	transition: all 0.3s;
	border: none;

	&:active {
		transform: scale(0.95);
	}

	&.reminder-card {
		background: linear-gradient(135deg, #FFB3B3 0%, #FFA0A0 100%);
		box-shadow: 0 8rpx 24rpx rgba(255, 107, 107, 0.2);

		&:active {
			box-shadow: 0 4rpx 16rpx rgba(255, 107, 107, 0.12);
		}
	}

	&.progress-card {
		background: linear-gradient(135deg, #90CAF9 0%, #64B5F6 100%);
		box-shadow: 0 8rpx 24rpx rgba(79, 161, 242, 0.2);

		&:active {
			box-shadow: 0 4rpx 16rpx rgba(79, 161, 242, 0.12);
		}
	}

	&.switch-card {
		background: linear-gradient(135deg, #CE93D8 0%, #BA68C8 100%);
		box-shadow: 0 8rpx 24rpx rgba(156, 39, 176, 0.2);

		&:active {
			box-shadow: 0 4rpx 16rpx rgba(156, 39, 176, 0.12);
		}
	}
}

.action-icon {
	font-size: 40rpx;
	filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.1));
}

.action-text {
	font-size: 24rpx;
	color: white;
	text-align: center;
	font-weight: 600;
	letter-spacing: 0.5rpx;
}

.plans-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 18rpx;
}

.plan-grid-card,
.template-grid-card {
	background: linear-gradient(135deg, white 0%, #FAFBFF 100%);
	border-radius: 18rpx;
	padding: 26rpx 20rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	box-shadow: 0 6rpx 16rpx rgba(79, 161, 242, 0.12);
	transition: all 0.3s;
	border: 1rpx solid rgba(79, 161, 242, 0.08);

	&:active {
		transform: scale(0.96);
		box-shadow: 0 8rpx 24rpx rgba(79, 161, 242, 0.15);
	}
}

.grid-icon {
	font-size: 48rpx;
	margin-bottom: 14rpx;
	display: block;
}

.grid-name {
	font-size: 28rpx;
	font-weight: 600;
	color: $text-dark;
	margin-bottom: 10rpx;
	display: block;
}

.grid-desc {
	font-size: 22rpx;
	color: $text-light;
	margin-bottom: 14rpx;
	display: block;
	min-height: 44rpx;
}

.add-btn {
	color: $main-blue;
	font-size: 26rpx;
	font-weight: 700;
	padding: 10rpx 18rpx;
	background: linear-gradient(135deg, rgba(79, 161, 242, 0.1) 0%, rgba(79, 161, 242, 0.05) 100%);
	border-radius: 22rpx;
	transition: all 0.2s;
	border: 1rpx solid rgba(79, 161, 242, 0.2);

	&:active {
		background: rgba(79, 161, 242, 0.15);
	}
}

.select-btn,
.select-btn-grid,
.use-btn,
.use-btn-grid {
	color: white;
	background: linear-gradient(135deg, #4FA1F2 0%, #357ABD 100%);
	padding: 10rpx 18rpx;
	border-radius: 18rpx;
	font-size: 24rpx;
	font-weight: 600;
	display: block;
	margin-top: 8rpx;
	box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.3);
	transition: all 0.2s;

	&:active {
		transform: scale(0.95);
		box-shadow: 0 2rpx 8rpx rgba(79, 161, 242, 0.2);
	}
}

/* 模态框 */
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.45);
	display: flex;
	align-items: flex-end;
	z-index: 100;
}

.modal-content {
	background: white;
	width: 100%;
	border-radius: 28rpx 28rpx 0 0;
	padding: 28rpx;
	max-height: 90vh;
	overflow-y: auto;
	animation: slideUp 0.3s ease-out;
	box-shadow: 0 -8rpx 24rpx rgba(0, 0, 0, 0.08);
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
	cursor: pointer;
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

.icon-grid {
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	gap: 12rpx;
}

.icon-item {
	font-size: 36rpx;
	width: 100%;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: $bg-blue;
	border-radius: 8rpx;
	border: 2rpx solid transparent;
	cursor: pointer;
	transition: all 0.2s;

	&.selected {
		border-color: $main-blue;
		background: rgba(79, 161, 242, 0.2);
	}

	&:active {
		transform: scale(0.95);
	}
}

.detail-modal {
	max-height: 75vh;
	overflow-y: auto;
}

.detail-section {
	display: flex;
	align-items: center;
	gap: 18rpx;
	padding: 24rpx;
	background: linear-gradient(135deg, #E8F4FF 0%, #F0F9FF 100%);
	border-radius: 16rpx;
	margin-bottom: 24rpx;
	border: 1rpx solid rgba(79, 161, 242, 0.15);

	.detail-icon {
		font-size: 52rpx;
	}

	.detail-info {
		flex: 1;
	}

	.info-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 8rpx;

		.label {
			color: $text-light;
			font-size: 24rpx;
		}

		.value {
			color: $text-dark;
			font-size: 26rpx;
			font-weight: 600;
		}
	}
}

.detail-text {
	margin-bottom: 28rpx;

	.detail-title {
		font-size: 30rpx;
		font-weight: 700;
		color: $text-dark;
		margin-bottom: 14rpx;
		display: block;
	}

	.detail-content {
		font-size: 24rpx;
		color: $text-dark;
		line-height: 1.7;
	}
}

.detail-features {
	margin-bottom: 28rpx;
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;

	.detail-title {
		font-size: 30rpx;
		font-weight: 700;
		color: $text-dark;
		margin-bottom: 14rpx;
		display: block;
		width: 100%;
	}

	.feature-tag {
		background: linear-gradient(135deg, #4FA1F2 0%, #357ABD 100%);
		color: white;
		padding: 10rpx 16rpx;
		border-radius: 18rpx;
		font-size: 24rpx;
		font-weight: 600;
		box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.2);
	}
}

.detail-plan {
	margin-bottom: 28rpx;

	.detail-title {
		font-size: 30rpx;
		font-weight: 700;
		color: $text-dark;
		margin-bottom: 14rpx;
		display: block;
	}

	.week-item {
		background: linear-gradient(135deg, #F5F8FC 0%, #FAFBFF 100%);
		padding: 14rpx 16rpx;
		border-left: 4rpx solid $main-blue;
		margin-bottom: 12rpx;
		border-radius: 8rpx;
		border: 1rpx solid rgba(79, 161, 242, 0.1);

		.week-text {
			font-size: 24rpx;
			color: $text-dark;
			line-height: 1.6;
			font-weight: 500;
		}
	}
}

.detail-result {
	margin-bottom: 28rpx;

	.detail-title {
		font-size: 30rpx;
		font-weight: 700;
		color: $text-dark;
		margin-bottom: 14rpx;
		display: block;
	}

	.result-text {
		font-size: 24rpx;
		color: $text-dark;
		line-height: 1.7;
		padding: 18rpx;
		background: linear-gradient(135deg, #FFF8F0 0%, #FFFBF5 100%);
		border-radius: 12rpx;
		border-left: 4rpx solid #FF9500;
		border: 1rpx solid rgba(255, 149, 0, 0.1);
	}
}

.modal-actions {
	display: flex;
	gap: 14rpx;
	margin-top: 28rpx;
}

.modal-btn {
	flex: 1;
	padding: 16rpx;
	border-radius: 14rpx;
	font-size: 28rpx;
	text-align: center;
	font-weight: 700;
	transition: all 0.3s;
	border: none;

	&:active {
		transform: scale(0.96);
	}

	&.cancel {
		background: linear-gradient(135deg, #F5F5F5 0%, #EEEEEE 100%);
		color: #666;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	}

	&.confirm {
		background: linear-gradient(135deg, #4FA1F2 0%, #357ABD 100%);
		color: white;
		box-shadow: 0 8rpx 24rpx rgba(79, 161, 242, 0.3);
	}
}

/* 进度模态框样式 */
.progress-overview {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16rpx;
	margin-bottom: 28rpx;
}

.progress-card-item {
	background: linear-gradient(135deg, #E8F4FF 0%, #F0F9FF 100%);
	border-radius: 14rpx;
	padding: 18rpx;
	text-align: center;
	border: 1rpx solid rgba(79, 161, 242, 0.15);

	.progress-label {
		font-size: 22rpx;
		color: $text-light;
		display: block;
		margin-bottom: 8rpx;
	}

	.progress-value {
		font-size: 28rpx;
		font-weight: 700;
		color: #4FA1F2;
		display: block;
	}
}

.progress-section,
.week-section,
.today-section {
	margin-bottom: 28rpx;
}

.section-title {
	font-size: 28rpx;
	font-weight: 700;
	color: $text-dark;
	margin-bottom: 16rpx;
	display: block;
}

.progress-bar {
	width: 100%;
	height: 12rpx;
	background: #E0E0E0;
	border-radius: 6rpx;
	overflow: hidden;
	margin-bottom: 12rpx;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #4FA1F2 0%, #357ABD 100%);
	border-radius: 6rpx;
	transition: width 0.5s ease-out;
}

.progress-text {
	font-size: 22rpx;
	color: $text-light;
	text-align: center;
	display: block;
}

.week-info {
	background: white;
	border-radius: 14rpx;
	padding: 16rpx;
	margin-bottom: 16rpx;
	border: 1rpx solid rgba(79, 161, 242, 0.1);

	.week-desc {
		font-size: 24rpx;
		color: $text-dark;
		line-height: 1.6;
		display: block;
	}
}

.week-days {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: 8rpx;
}

.day-item {
	background: #F5F5F5;
	border-radius: 8rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 22rpx;
	font-weight: 600;
	color: #999;
	border: 2rpx solid transparent;
	transition: all 0.2s;

	&.done {
		background: linear-gradient(135deg, #4FA1F2 0%, #357ABD 100%);
		color: white;
		border-color: #357ABD;
	}
}

.completion-rate {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12rpx;
}

.rate-circle {
	width: 100rpx;
	height: 100rpx;
	border-radius: 50%;
	border: 4rpx solid #4FA1F2;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, rgba(79, 161, 242, 0.05) 0%, rgba(79, 161, 242, 0.02) 100%);
}

.rate-text {
	font-size: 32rpx;
	font-weight: 700;
	color: #4FA1F2;
}

.rate-label {
	font-size: 24rpx;
	color: $text-dark;
	font-weight: 600;
}

.motivation-box {
	background: linear-gradient(135deg, #FFF8E1 0%, #FFFDE7 100%);
	border-radius: 14rpx;
	padding: 20rpx;
	border-left: 4rpx solid #FFB74D;
	margin-bottom: 24rpx;
	border: 1rpx solid rgba(255, 183, 77, 0.2);

	.motivation-text {
		font-size: 26rpx;
		color: #F57C00;
		line-height: 1.6;
		font-weight: 500;
		display: block;
	}
}
</style>
