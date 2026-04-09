const API_BASE_URL = (() => {
	if (typeof window !== 'undefined' && window.location?.port === '5173') {
		// H5 开发环境：使用 Vite dev server 内置代理，无需 CORS 处理
		// vite.config.js 已配置 /api -> http://localhost:8080
		return ''
	}
	return 'http://localhost:8080'
})()
const TOKEN_KEYS = ['auth_token', 'token', 'access_token', 'my_token']
let authWarningShown = false
let lastToastMessage = ''
let lastToastAt = 0

const HELP_CONTENT = [
	{
		id: 1,
		title: '日程表使用指南',
		icon: '📅',
		desc: '学习每日打卡、跑步计时和专注计划'
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
		desc: '了解社区榜单与互动热度规则'
	},
	{
		id: 5,
		title: '常见问题',
		icon: '❓',
		desc: '查看常见问题的解答'
	}
]

function getStoredToken() {
	for (const key of TOKEN_KEYS) {
		const token = uni.getStorageSync(key)
		if (token) return token
	}

	// H5 兼容：兜底从 localStorage 读取，支持 uni_ 前缀键名
	if (typeof window !== 'undefined' && window.localStorage) {
		for (const key of TOKEN_KEYS) {
			const raw = window.localStorage.getItem(key) || window.localStorage.getItem(`uni_${key}`)
			if (raw) return raw
		}
	}
	return ''
}

function setStoredToken(token) {
	if (!token) return
	TOKEN_KEYS.forEach(key => uni.setStorageSync(key, token))
	if (typeof window !== 'undefined' && window.localStorage) {
		TOKEN_KEYS.forEach(key => {
			window.localStorage.setItem(key, token)
			window.localStorage.setItem(`uni_${key}`, token)
		})
	}
	authWarningShown = false
}

function clearStoredToken() {
	TOKEN_KEYS.forEach(key => uni.removeStorageSync(key))
	if (typeof window !== 'undefined' && window.localStorage) {
		TOKEN_KEYS.forEach(key => {
			window.localStorage.removeItem(key)
			window.localStorage.removeItem(`uni_${key}`)
		})
	}
}

function isAuthErrorMessage(message = '') {
	return /未登录|token|401|unauthorized/i.test(String(message))
}

function normalizeResult(result) {
	const response = result?.data || {}
	if (response.code === 200) {
		return response.data
	}

	const message = response.message || '请求失败'
	if (response.code === 401) {
		clearStoredToken()
	}
	throw new Error(message)
}

function showRequestError(error, fallbackMessage = '请求失败') {
	const rawTitle = error?.message || fallbackMessage
	const title = String(rawTitle)

	if (isAuthErrorMessage(title)) {
		if (authWarningShown) return
		authWarningShown = true
		uni.showToast({
			title: '请先登录',
			icon: 'none'
		})
		return
	}

	const now = Date.now()
	if (title === lastToastMessage && now - lastToastAt < 1500) {
		return
	}
	lastToastMessage = title
	lastToastAt = now

	uni.showToast({
		title,
		icon: 'none'
	})
}

function request(url, options = {}) {
	const token = getStoredToken()
	return new Promise((resolve, reject) => {
		uni.request({
			url: `${API_BASE_URL}${url}`,
			method: options.method || 'GET',
			data: options.data,
			timeout: 5000,
			header: {
				'Content-Type': 'application/json',
				...(token ? { Authorization: `Bearer ${token}` } : {}),
				...(options.header || {})
			},
			success: resolve,
			fail: (error) => reject(new Error(error?.errMsg || '网络请求失败'))
		})
	}).then(normalizeResult)
}

function tryParseJSON(value, fallback) {
	if (!value) return fallback
	if (Array.isArray(value) || typeof value === 'object') return value
	try {
		return JSON.parse(value)
	} catch (e) {
		return fallback
	}
}

function formatDateTime(value) {
	if (!value) return ''
	if (typeof value !== 'string') return value
	return value.replace('T', ' ')
}

function adaptUserFromServer(user) {
	if (!user) return null
	return {
		id: user.id,
		name: user.name || '',
		studentId: user.studentId || '',
		avatar: user.avatar || '😊',
		height: Number(user.height) || 170,
		weight: Number(user.weight) || 70,
		targetWeight: Number(user.targetWeight) || 60,
		age: Number(user.age) || 20
	}
}

function upsertTodayWeightRecord(weightValue) {
	const weight = Number(weightValue)
	if (!Number.isFinite(weight) || weight <= 0) return

	const today = new Date().toISOString().split('T')[0]
	let list = []
	try {
		const raw = uni.getStorageSync('weightList')
		list = tryParseJSON(raw, []) || []
		if (!Array.isArray(list)) list = []
	} catch (e) {
		list = []
	}

	const index = list.findIndex(item => item?.date === today)
	if (index >= 0) {
		list[index] = { ...list[index], weight }
	} else {
		list.unshift({ date: today, weight })
	}

	uni.setStorageSync('weightList', JSON.stringify(list))
	uni.setStorageSync('todayWeight', { date: today, weight })
}

function syncUserRelatedCaches(user) {
	if (!user) return
	const normalized = {
		id: user.id,
		name: user.name || '',
		studentId: user.studentId || '',
		avatar: user.avatar || '😊',
		height: Number(user.height) || 170,
		weight: Number(user.weight) || 70,
		targetWeight: Number(user.targetWeight) || 60,
		age: Number(user.age) || 20
	}

	uni.setStorageSync('current_user_profile', JSON.stringify(normalized))
	uni.setStorageSync('my_user_profile', JSON.stringify(normalized))
	uni.setStorageSync('userInfo', normalized)
	uni.setStorageSync('current_user_id', Number(normalized.id || 0))
	uni.setStorageSync('questionnaireBaseInfo', JSON.stringify({
		height: normalized.height,
		weight: normalized.weight
	}))
	uni.setStorageSync('targetWeight', String(normalized.targetWeight))
	upsertTodayWeightRecord(normalized.weight)

	try {
		const rawQuestionnaire = uni.getStorageSync('questionnaireData')
		const questionnaire = tryParseJSON(rawQuestionnaire, null)
		if (questionnaire && typeof questionnaire === 'object') {
			const updated = {
				...questionnaire,
				height: normalized.height,
				weight: normalized.weight,
				age: normalized.age,
				targetWeight: normalized.targetWeight
			}
			uni.setStorageSync('questionnaireData', updated)
		}
	} catch (e) {
		// ignore cache sync failure
	}
}

function guessPlanIcon(plan) {
	const text = `${plan?.name || ''}${plan?.type || ''}${plan?.description || ''}`
	if (text.includes('减脂')) return '⚡'
	if (text.includes('增肌')) return '💪'
	if (text.includes('瑜伽')) return '🧘'
	if (text.includes('跑')) return '🏃'
	if (text.includes('骑')) return '🚴'
	return '🎯'
}

function buildPlanTarget(plan) {
	if (plan?.target) return plan.target
	if (plan?.type) return `${plan.type}计划`
	return '健康提升'
}

function buildPlanDetails(plan) {
    const description = plan?.description || '按照当前方案持续执行，保持稳定节奏。'
    // 限制 duration 最大 365 天，防止异常大值导致循环 OOM
    const rawDuration = Number(plan?.duration)
    const duration = (rawDuration > 0 && rawDuration <= 365) ? rawDuration : 30
    const weeks = Math.min(Math.max(1, Math.ceil(duration / 7)), 52)
    const weeklyPlan = []
    for (let index = 0; index < weeks; index++) {
        weeklyPlan.push(`第${index + 1}周：${description}`)
    }
    return {
        overview: description,
        features: [plan?.type || '健康管理', '循序渐进', '持续记录'],
        weeklyPlan,
        expectedResult: `${duration}天内持续完成 ${plan?.name || '健康计划'}。`
    }
}


function adaptPlanFromServer(plan) {
	if (!plan) return null
	const desc = plan.description || ''
	return {
		id: plan.id,
		name: plan.name,
		desc,
		description: desc,
		type: plan.type || '其他',
		icon: guessPlanIcon(plan),
		target: buildPlanTarget(plan),
		duration: Number(plan.duration) || 30,
		isCurrent: plan.isCurrent,
		createdAt: formatDateTime(plan.createdAt),
		details: buildPlanDetails(plan)
	}
}

function adaptCollectionItem(item) {
	const fallbackName = item.itemTitle || item.name || item.title || item.itemName || item.dishName || item.foodName || item.postTitle || item.recipeName
	const normalizedType = TYPE_MAP[(item.itemType || '').toLowerCase()] || item.itemType
	return {
		id: item.itemId || item.id,
		collectionId: item.id,
		itemId: item.itemId || item.id,
		itemType: normalizedType,
		name: fallbackName || '未命名收藏',
		desc: item.itemDesc || item.desc || '',
		icon: item.itemCover || item.icon || '⭐',
		savedAt: formatDateTime(item.createdAt),
		createdAt: formatDateTime(item.createdAt)
	}
}

// itemType 后端可能用大写或不同单词，做归一化映射
const TYPE_MAP = {
	food: 'foods', foods: 'foods',
	restaurant: 'foods', restaurants: 'foods',
	drink: 'foods', drinks: 'foods',
	dish: 'dishes', dishes: 'dishes',
	recipe: 'recipes', recipes: 'recipes',
	post: 'posts', posts: 'posts', dynamic: 'posts'
}

function adaptCollectionsFromServer(collections) {
	const result = {
		foods: [],
		recipes: [],
		dishes: [],
		posts: []
	}

	if (!collections) return result

	// 后端返回平铺数组: [{itemType, itemId, itemTitle, ...}]
	if (Array.isArray(collections)) {
		collections.forEach(item => {
			const typeKey = TYPE_MAP[(item.itemType || '').toLowerCase()]
			if (typeKey) result[typeKey].push(adaptCollectionItem(item))
		})
		return result
	}

	// 后端返回分组对象: {posts: [...], dishes: [...]} 
	Object.keys(result).forEach(key => {
		result[key] = (collections[key] || []).map(adaptCollectionItem)
	})

	return result
}

function adaptDailyRecordFromServer(record) {
	return {
		id: record.id,
		date: record.recordDate,
		metrics: {
			distance: Number(record.distance) || 0,
			runMinutes: Number(record.runMinutes) || 0,
			focus: Number(record.focus) || 0,
			weight: Number(record.weight) || 0,
			water: Number(record.water) || 0
		},
		createdAt: formatDateTime(record.createdAt),
		updatedAt: formatDateTime(record.updatedAt)
	}
}

function normalizeDateKey(value) {
	if (!value) return ''
	const text = String(value)
	if (text.includes('T')) return text.split('T')[0]
	return text.slice(0, 10)
}

function dedupeDailyRecordsByDate(list) {
	const dateMap = new Map()
	for (const item of list || []) {
		const key = normalizeDateKey(item?.date)
		if (!key) continue
		const normalized = {
			...item,
			date: key,
			metrics: {
				distance: Number(item?.metrics?.distance) || 0,
				runMinutes: Number(item?.metrics?.runMinutes) || 0,
				focus: Number(item?.metrics?.focus) || 0,
				weight: Number(item?.metrics?.weight) || 0,
				water: Number(item?.metrics?.water) || 0
			}
		}
		dateMap.set(key, normalized)
	}

	return [...dateMap.values()].sort((a, b) => new Date(b.date) - new Date(a.date))
}

function adaptDailyRecordToServer(record) {
	return {
		date: record.date,
		distance: Number(record.metrics?.distance || record.distance || 0) || 0,
		runMinutes: Number(record.metrics?.runMinutes || record.runMinutes || 0) || 0,
		focus: Number(record.metrics?.focus || record.focus || 0) || 0,
		weight: Number(record.metrics?.weight || record.weight || 0) || 0,
		water: Number(record.metrics?.water || record.water || 0) || 0
	}
}

function adaptAnnualReportFromServer(report) {
	if (!report) return null
	const extraData = tryParseJSON(report.extraData, {})
	return {
		id: report.id,
		year: report.year,
		activeDays: Number(report.activeDays) || 0,
		goalsCompleted: Number(report.goalsCompleted) || 0,
		totalRunMinutes: Number(report.totalRunMinutes) || 0,
		totalDistance: Number(report.totalDistance) || 0,
		totalSteps: Number(report.totalSteps) || 0,
		weightChange: Number(report.weightChange) || 0,
		streakDays: Number(report.streakDays) || 0,
		achievementsCount: Number(report.achievementsCount) || 0,
		achievements: extraData.achievements || [],
		goals: extraData.goals || [],
		highlights: extraData.highlights || [],
		extraData,
		createdAt: formatDateTime(report.createdAt),
		updatedAt: formatDateTime(report.updatedAt)
	}
}

function adaptAnnualReportToServer(report) {
	return {
		id: report.id,
		year: report.year,
		activeDays: Number(report.activeDays) || 0,
		goalsCompleted: Number(report.goalsCompleted) || 0,
		totalRunMinutes: Number(report.totalRunMinutes) || 0,
		totalDistance: Number(report.totalDistance) || 0,
		totalSteps: Number(report.totalSteps) || 0,
		weightChange: Number(report.weightChange) || 0,
		streakDays: Number(report.streakDays) || 0,
		achievementsCount: Number(report.achievements?.length || report.achievementsCount || 0),
		extraData: JSON.stringify({
			achievements: report.achievements || [],
			goals: report.goals || [],
			highlights: report.highlights || []
		})
	}
}

function pickHabitValue(habits, keywords, fallback = '-') {
	if (!Array.isArray(habits)) return fallback
	const item = habits.find(entry => {
		const text = `${entry?.name || ''}${entry?.type || ''}${entry?.value || ''}`.toLowerCase()
		return keywords.some(keyword => text.includes(keyword))
	})
	return item?.value || item?.name || fallback
}

function adaptAssessmentFromServer(report) {
	if (!report || !report.id) return null
	const sportsHabits = tryParseJSON(report.sportsHabits, [])
	const dietHabits = tryParseJSON(report.dietHabits, [])
	const goals = tryParseJSON(report.goals, [])
	const suggestions = tryParseJSON(report.suggestions, [])

	return {
		...report,
		sportsHabits,
		dietHabits,
		goals,
		suggestions,
		exerciseFrequency: pickHabitValue(sportsHabits, ['frequency', '频率', '每周', '次数']),
		exerciseDuration: pickHabitValue(sportsHabits, ['duration', '时长', '分钟', '小时']),
		exerciseType: pickHabitValue(sportsHabits, ['type', '运动', '跑步', '瑜伽', '力量'], sportsHabits[0]?.name || '-'),
		dietRestrictions: pickHabitValue(dietHabits, ['限制', '禁忌', 'restriction']),
		dietPreference: pickHabitValue(dietHabits, ['偏好', '饮食', 'preference'], dietHabits[0]?.value || '-'),
		fastingAcceptance: pickHabitValue(dietHabits, ['专注', '轻断食', 'fast', 'accept'], '-')
	}
}

function adaptFeedbackFromServer(item) {
	const typeMap = {
		1: 'feedback',
		2: 'bug',
		3: 'report',
		4: 'suggestion'
	}
	const statusMap = {
		0: 'pending',
		1: 'reviewing',
		2: 'done'
	}
	return {
		...item,
		type: typeMap[item.type] || 'feedback',
		status: statusMap[item.status] || 'pending',
		createdAt: formatDateTime(item.createdAt),
		updatedAt: formatDateTime(item.updatedAt)
	}
}

function readLocalJSON(key, fallback) {
	try {
		const raw = uni.getStorageSync(key)
		return raw ? JSON.parse(typeof raw === 'string' ? raw : JSON.stringify(raw)) : fallback
	} catch (e) {
		return fallback
	}
}

export async function login(studentId, name) {
	const data = await request('/api/auth/login', {
		method: 'POST',
		data: { studentId, name }
	})
	if (data?.token) {
		setStoredToken(data.token)
	}
	const user = adaptUserFromServer(data?.user)
	if (user) {
		syncUserRelatedCaches(user)
	}
	return data
}

export async function register(payload) {
	return request('/api/auth/register', {
		method: 'POST',
		data: payload
	})
}

export async function getCurrentUser() {
	try {
		const user = adaptUserFromServer(await request('/api/user/profile'))
		syncUserRelatedCaches(user)
		return user
	} catch (error) {
		return readLocalJSON('current_user_profile', readLocalJSON('my_user_profile', null))
	}
}

export async function updateUserProfile(profile) {
	try {
		await request('/api/user/profile', {
			method: 'PUT',
			data: {
				name: profile.name,
				avatar: profile.avatar,
				height: Number(profile.height) || 0,
				weight: Number(profile.weight) || 0,
				targetWeight: Number(profile.targetWeight) || 0,
				age: Number(profile.age) || 0
			}
		})
		const latest = adaptUserFromServer(await request('/api/user/profile'))
		syncUserRelatedCaches(latest)
		return true
	} catch (error) {
		showRequestError(error, '资料更新失败')
		return false
	}
}

export async function changeUserPassword(oldPassword, newPassword) {
	try {
		await request('/api/user/password', {
			method: 'PUT',
			data: { oldPassword, newPassword }
		})
		return true
	} catch (error) {
		showRequestError(error, '密码修改失败')
		return false
	}
}

export async function getUserProfile() {
	return getCurrentUser()
}

export async function getUserPlans() {
	try {
		const list = await request('/api/plan/list')
		return (list || []).map(adaptPlanFromServer).filter(Boolean)
	} catch (error) {
		showRequestError(error, '获取方案失败')
		return []
	}
}

export async function saveUserPlans(plans) {
	return plans
}

export async function updateUserPlan(planId, plan) {
	const fallbackText = plan?.details?.overview || plan?.desc || plan?.description || ''
	const payload = {
		name: plan.name,
		description: plan.desc || plan.description || '',
		type: plan.type || plan.target || '其他',
		duration: Number(plan.duration) || 30,
		dietContent: plan?.diet || fallbackText,
		exerciseContent: plan?.exercise || fallbackText
	}
	try {
		const updated = await request(`/api/plan/${planId}`, {
			method: 'PUT',
			data: payload
		})
		return adaptPlanFromServer(updated || { id: planId, ...payload })
	} catch (error) {
		showRequestError(error, '更新方案失败')
		return null
	}
}

export async function createUserPlan(plan) {
	const fallbackText = plan?.details?.overview || plan?.desc || plan?.description || ''
    const payload = {
        name: plan.name,
        description: plan.desc || plan.description || '',
        type: plan.type || plan.target || '其他',
		duration: Number(plan.duration) || 30,
		dietContent: plan?.diet || fallbackText,
		exerciseContent: plan?.exercise || fallbackText
    }

    try {
        const created = await request('/api/plan', { method: 'POST', data: payload })
        return adaptPlanFromServer(created)
	} catch (error) {
		showRequestError(error, '创建方案失败')
        return null
    }
}

export async function getCurrentPlan() {
	const readCache = () => {
		try {
			const raw = uni.getStorageSync('current_plan_cache')
			if (!raw) return null
			const p = typeof raw === 'string' ? JSON.parse(raw) : raw
			return p?.id ? p : null
		} catch (e) { return null }
	}

	try {
		const serverPlan = adaptPlanFromServer(await request('/api/plan/current'))
		if (serverPlan) {
			// 若缓存里有同一方案的更丰富数据（模板 icon/details），保留，避免被服务端通用数据覆盖
			const cached = readCache()
			if (cached?.id && cached.id === serverPlan.id) {
				const merged = {
					...serverPlan,
					name: cached.name || serverPlan.name,
					icon: cached.icon || serverPlan.icon,
					details: cached.details || serverPlan.details,
					target: cached.target || serverPlan.target,
					isTemplate: cached.isTemplate
				}
				uni.setStorageSync('current_plan_cache', JSON.stringify(merged))
				return merged
			}
			uni.setStorageSync('current_plan_cache', JSON.stringify(serverPlan))
			return serverPlan
		}
	} catch (error) {
		// 请求失败时回退缓存
	}

	return readCache()
}

export async function setCurrentPlan(plan) {
	try {
		const planId = typeof plan === 'object' ? plan?.id : plan
		if (!planId) return false
		await request(`/api/plan/current/${planId}`, {
			method: 'PUT'
		})
		// 立即更新本地缓存，防止退出页面后重新 loadData 时后端返回 null 导致方案消失
		if (typeof plan === 'object' && plan?.id) {
			uni.setStorageSync('current_plan_cache', JSON.stringify(plan))
		}
		return true
	} catch (error) {
		showRequestError(error, '切换方案失败')
		return false
	}
}

export async function deleteUserPlan(planId) {
	try {
		await request(`/api/plan/${planId}`, { method: 'DELETE' })
		return true
	} catch (error) {
		showRequestError(error, '删除方案失败')
		return false
	}
}

export async function getCollections() {
	try {
		const collections = await request('/api/collection')
		return adaptCollectionsFromServer(collections)
	} catch (error) {
		showRequestError(error, '获取收藏失败')
		return adaptCollectionsFromServer(null)
	}
}

export async function saveCollections(collections) {
	return collections
}

export async function addCollection(collection) {
	try {
		return await request('/api/collection', {
			method: 'POST',
			data: {
				itemType: collection.itemType,
				itemId: Number(collection.itemId),
				itemTitle: collection.itemTitle,
				itemCover: collection.itemCover,
				itemDesc: collection.itemDesc
			}
		})
	} catch (error) {
		showRequestError(error, '收藏失败')
		return null
	}
}

export async function getRecipeNameIdMap(names = []) {
	try {
		const normalized = (names || [])
			.map(name => String(name || '').trim())
			.filter(Boolean)
		if (!normalized.length) return {}

		const result = await request('/api/recipe/name-id-map', {
			method: 'POST',
			data: normalized
		})
		return result || {}
	} catch (error) {
		showRequestError(error, '获取菜谱映射失败')
		return {}
	}
}

export async function removeCollection(itemType, itemId, collectionId) {
	try {
		const url = `/api/collection/${itemType}/${itemId}`
		await request(url, { method: 'DELETE' })
		return true
	} catch (error) {
		showRequestError(error, '删除收藏失败')
		return false
	}
}

export async function getDailyData() {
	try {
		const list = await request('/api/daily-record')
		return (list || []).map(adaptDailyRecordFromServer)
	} catch (error) {
		showRequestError(error, '获取数据记录失败')
		return []
	}
}

export async function saveDailyData(data, recordToSave = null) {
	try {
		const fallbackRecord = Array.isArray(data) && data.length > 0 ? data[data.length - 1] : null
		const targetRecord = recordToSave || fallbackRecord
		if (!targetRecord) {
			return true
		}

		await request('/api/daily-record', {
			method: 'POST',
			data: adaptDailyRecordToServer(targetRecord)
		})
		return true
	} catch (error) {
		showRequestError(error, '保存数据失败')
		return false
	}
}

export async function recordDailyMetric(metric) {
	try {
		const today = new Date().toISOString().split('T')[0]
		const payload = {
			date: today,
			distance: 0,
			runMinutes: 0,
			focus: 0,
			weight: 0,
			water: 0
		}
		payload[metric.type] = metric.value
		const result = await request('/api/daily-record', {
			method: 'POST',
			data: payload
		})
		return adaptDailyRecordFromServer(result)
	} catch (error) {
		showRequestError(error, '记录失败')
		return null
	}
}

export async function deleteDailyRecord(recordId) {
	try {
		await request(`/api/daily-record/${recordId}`, { method: 'DELETE' })
		return true
	} catch (error) {
		showRequestError(error, '删除记录失败')
		return false
	}
}

export async function getYearlyReport(year = new Date().getFullYear()) {
	try {
		const report = await request(`/api/annual-report?year=${year}`)
		return adaptAnnualReportFromServer(report)
	} catch (error) {
		return null
	}
}

export async function saveYearlyReport(report) {
	try {
		const saved = await request('/api/annual-report', {
			method: 'PUT',
			data: adaptAnnualReportToServer(report)
		})
		return adaptAnnualReportFromServer(saved)
	} catch (error) {
		showRequestError(error, '保存年度报告失败')
		return null
	}
}

export async function getFeedbackList() {
	try {
		const list = await request('/api/feedback')
		return (list || []).map(adaptFeedbackFromServer)
	} catch (error) {
		showRequestError(error, '获取反馈失败')
		return []
	}
}

export async function saveFeedback(feedback) {
	try {
		const result = await request('/api/feedback', {
			method: 'POST',
			data: {
				type: feedback.type,
				content: feedback.content,
				targetAi: !!feedback.targetAI,
				email: feedback.email
			}
		})
		return adaptFeedbackFromServer(result)
	} catch (error) {
		showRequestError(error, '提交反馈失败')
		return null
	}
}

export async function getAssessmentReport() {
	try {
		const report = await request('/api/assessment')
		return adaptAssessmentFromServer(report)
	} catch (error) {
		return null
	}
}

export async function getLatestQuestionnaire() {
	try {
		return await request('/api/questionnaire/latest')
	} catch (error) {
		return null
	}
}

export async function saveAssessmentReport(report) {
	try {
		return await request('/api/assessment', {
			method: 'POST',
			data: report
		})
	} catch (error) {
		showRequestError(error, '保存测评失败')
		return null
	}
}

export async function deleteAssessmentReport() {
	try {
		await request('/api/assessment', { method: 'DELETE' })
		return true
	} catch (error) {
		showRequestError(error, '删除测评失败')
		return false
	}
}

export function getHelpContent() {
	return HELP_CONTENT
}

export function clearUserSession() {
	clearStoredToken()
	uni.removeStorageSync('current_user_profile')
	uni.removeStorageSync('my_user_profile')
}