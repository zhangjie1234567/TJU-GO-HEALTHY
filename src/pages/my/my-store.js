/**
 * 我的模块数据存储
 */

// ==================== 用户基本信息 ====================
export function getCurrentUser() {
	try {
		const user = uni.getStorageSync('current_user_profile') || uni.getStorageSync('my_user_profile') || uni.getStorageSync('userInfo')
		return user ? JSON.parse(typeof user === 'string' ? user : JSON.stringify(user)) : null
	} catch (e) {
		return null
	}
}

export function updateUserProfile(profile) {
	try {
		const payload = JSON.stringify(profile)
		uni.setStorageSync('my_user_profile', payload)
		uni.setStorageSync('current_user_profile', payload)
		uni.setStorageSync('userInfo', payload)
		return true
	} catch (e) {
		return false
	}
}

export function getUserProfile() {
	try {
		const profile = uni.getStorageSync('my_user_profile')
		return profile ? JSON.parse(typeof profile === 'string' ? profile : JSON.stringify(profile)) : null
	} catch (e) {
		return null
	}
}

// ==================== 用户方案 ====================
export function getUserPlans() {
	try {
		const plans = uni.getStorageSync('my_user_plans') || '[]'
		return JSON.parse(typeof plans === 'string' ? plans : JSON.stringify(plans))
	} catch (e) {
		return []
	}
}

export function saveUserPlans(plans) {
	try {
		uni.setStorageSync('my_user_plans', JSON.stringify(plans))
		return true
	} catch (e) {
		return false
	}
}

export function getCurrentPlan() {
	try {
		const plan = uni.getStorageSync('my_current_plan')
		return plan ? JSON.parse(typeof plan === 'string' ? plan : JSON.stringify(plan)) : null
	} catch (e) {
		return null
	}
}

export function setCurrentPlan(plan) {
	try {
		uni.setStorageSync('my_current_plan', JSON.stringify(plan))
		return true
	} catch (e) {
		return false
	}
}

// ==================== 我的收藏 ====================
export function getCollections() {
	try {
		const collections = uni.getStorageSync('my_collections') || '{}'
		const data = JSON.parse(typeof collections === 'string' ? collections : JSON.stringify(collections))
		return {
			restaurants: data.restaurants || [],
			recipes: data.recipes || [],
			drinks: data.drinks || [],
			courses: data.courses || [],
			knowledge: data.knowledge || [],
			posts: data.posts || []
		}
	} catch (e) {
		return {
			restaurants: [],
			recipes: [],
			drinks: [],
			courses: [],
			knowledge: [],
			posts: []
		}
	}
}

export function saveCollections(collections) {
	try {
		uni.setStorageSync('my_collections', JSON.stringify(collections))
		return true
	} catch (e) {
		return false
	}
}

// ==================== 数据小结 ====================
export function getDailyData() {
	try {
		const data = uni.getStorageSync('my_daily_data') || '[]'
		return JSON.parse(typeof data === 'string' ? data : JSON.stringify(data))
	} catch (e) {
		return []
	}
}

export function saveDailyData(data) {
	try {
		uni.setStorageSync('my_daily_data', JSON.stringify(data))
		return true
	} catch (e) {
		return false
	}
}

export function recordDailyMetric(metric) {
	const data = getDailyData()
	const today = new Date().toISOString().split('T')[0]
	
	// 找到今天的记录
	let todayRecord = data.find(d => d.date === today)
	if (!todayRecord) {
		todayRecord = { date: today, metrics: {} }
		data.push(todayRecord)
	}
	
	todayRecord.metrics[metric.type] = metric.value
	saveDailyData(data)
	return todayRecord
}

// ==================== 年度报告 ====================
export function getYearlyReport() {
	try {
		const report = uni.getStorageSync('my_yearly_report') || '{}'
		return JSON.parse(typeof report === 'string' ? report : JSON.stringify(report))
	} catch (e) {
		return {
			year: new Date().getFullYear(),
			totalDays: 0,
			totalPoints: 0,
			achievements: [],
			highlights: [],
			goals: {}
		}
	}
}

export function saveYearlyReport(report) {
	try {
		uni.setStorageSync('my_yearly_report', JSON.stringify(report))
		return true
	} catch (e) {
		return false
	}
}

// ==================== 帮助与反馈 ====================
export function getFeedbackList() {
	try {
		const list = uni.getStorageSync('my_feedback_list') || '[]'
		return JSON.parse(typeof list === 'string' ? list : JSON.stringify(list))
	} catch (e) {
		return []
	}
}

export function saveFeedback(feedback) {
	try {
		const list = getFeedbackList()
		const newFeedback = {
			id: Date.now().toString(),
			type: feedback.type, // 'feedback', 'bug', 'suggestion'
			content: feedback.content,
			targetAI: feedback.targetAI || false,
			createdAt: new Date().toISOString(),
			status: 'pending'
		}
		list.unshift(newFeedback)
		uni.setStorageSync('my_feedback_list', JSON.stringify(list))
		return newFeedback
	} catch (e) {
		return null
	}
}

// ==================== 测评报告 ====================
export function getAssessmentReport() {
	try {
		const report = uni.getStorageSync('my_assessment_report') || '{}'
		return JSON.parse(typeof report === 'string' ? report : JSON.stringify(report))
	} catch (e) {
		return null
	}
}

export function saveAssessmentReport(report) {
	try {
		uni.setStorageSync('my_assessment_report', JSON.stringify(report))
		return true
	} catch (e) {
		return false
	}
}

// ==================== 帮助内容 ====================
export function getHelpContent() {
	return [
		{
			id: 1,
			title: '日程表使用指南',
			icon: '📅',
			desc: '学习如何规划每日课程和饮食计划'
		},
		{
			id: 2,
			title: '社区功能介绍',
			icon: '👥',
			desc: '了解如何发布、评论和互动'
		},
		{
			id: 3,
			title: '数据记录教程',
			icon: '📊',
			desc: '掌握各项数据的记录方法'
		},
		{
			id: 4,
			title: '排行榜说明',
			icon: '🏅',
			desc: '了解排行榜的计算规则'
		},
		{
			id: 5,
			title: '常见问题',
			icon: '❓',
			desc: '查看常见问题的解答'
		}
	]
}
