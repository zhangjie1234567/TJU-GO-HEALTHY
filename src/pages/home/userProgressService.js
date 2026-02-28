/**
 * 用户进度数据服务
 * 管理用户使用天数、体重记录、方案坚持等数据
 */

// ============ 数据存储键 ============
const KEYS = {
  FIRST_USE_DATE: 'app_first_use_date',      // 首次使用日期
  DAILY_RECORDS: 'daily_records',            // 每日记录
  WEIGHT_LIST: 'weightList',                 // 体重记录列表
  TARGET_WEIGHT: 'targetWeight',             // 目标体重
  PLAN_RECORDS: 'plan_records',              // 方案记录
}

// ============ 初始化 ============
/**
 * 初始化首次使用日期
 */
export function initFirstUseDate() {
  try {
    const saved = uni.getStorageSync(KEYS.FIRST_USE_DATE)
    if (!saved) {
      const today = getTodayString()
      uni.setStorageSync(KEYS.FIRST_USE_DATE, today)
      return today
    }
    return saved
  } catch (e) {
    console.error('初始化首次使用日期失败', e)
    return getTodayString()
  }
}

// ============ 日期工具函数 ============
/**
 * 获取今天的日期字符串 YYYY-MM-DD
 */
export function getTodayString() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

/**
 * 计算两个日期之间的天数差
 */
function getDaysDiff(startDateStr, endDateStr) {
  const start = new Date(startDateStr)
  const end = new Date(endDateStr)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// ============ 使用天数统计 ============
/**
 * 获取使用天数
 * @returns {number} 从首次使用到今天的天数
 */
export function getUseDays() {
  try {
    const firstUseDate = initFirstUseDate()
    const today = getTodayString()
    return getDaysDiff(firstUseDate, today) + 1 // +1 包括首次使用当天
  } catch (e) {
    console.error('获取使用天数失败', e)
    return 1
  }
}

/**
 * 获取累计记录天数（有任何记录的天数）
 * @returns {number} 有记录的总天数
 */
export function getRecordDays() {
  try {
    const records = JSON.parse(uni.getStorageSync(KEYS.DAILY_RECORDS) || '{}')
    return Object.keys(records).length
  } catch (e) {
    console.error('获取记录天数失败', e)
    return 0
  }
}

/**
 * 记录今日行为（每日自动调用）
 */
export function recordTodayActivity() {
  try {
    const today = getTodayString()
    const records = JSON.parse(uni.getStorageSync(KEYS.DAILY_RECORDS) || '{}')
    
    if (!records[today]) {
      records[today] = {
        date: today,
        hasRecord: true,
        timestamp: Date.now()
      }
      uni.setStorageSync(KEYS.DAILY_RECORDS, JSON.stringify(records))
    }
  } catch (e) {
    console.error('记录今日活动失败', e)
  }
}

/**
 * 获取累计坚持方案天数
 * @returns {number} 完成方案的天数
 */
export function getPlanDays() {
  try {
    // 统计calories数据中不为0的天数
    const caloriesData = JSON.parse(uni.getStorageSync('calories') || '{}')
    let planDays = 0
    
    for (const date in caloriesData) {
      const dayData = caloriesData[date]
      // 如果当天有任何餐次的卡路里记录，算作坚持了方案
      if (dayData.breakfast > 0 || dayData.lunch > 0 || dayData.dinner > 0 || dayData.other > 0) {
        planDays++
      }
    }
    
    return planDays
  } catch (e) {
    console.error('获取方案天数失败', e)
    return 0
  }
}

// ============ 体重数据 ============
/**
 * 获取体重记录列表
 * @returns {Array} 体重记录数组
 */
export function getWeightList() {
  try {
    return JSON.parse(uni.getStorageSync(KEYS.WEIGHT_LIST) || '[]')
  } catch (e) {
    console.error('获取体重列表失败', e)
    return []
  }
}

/**
 * 获取最新体重
 * @returns {number|null} 最新体重值
 */
export function getLatestWeight() {
  const list = getWeightList()
  return list.length > 0 ? list[0].weight : null
}

/**
 * 获取目标体重
 * @returns {number|null} 目标体重值
 */
export function getTargetWeight() {
  try {
    const target = uni.getStorageSync(KEYS.TARGET_WEIGHT)
    return target ? parseFloat(target) : null
  } catch (e) {
    return null
  }
}

/**
 * 计算剩余天数（预估）
 * 基于当前体重、目标体重和平均减重速度
 * @returns {number} 预估剩余天数
 */
export function getRemainingDays() {
  const currentWeight = getLatestWeight()
  const targetWeight = getTargetWeight()
  
  if (!currentWeight || !targetWeight) {
    return 30 // 默认返回30天
  }
  
  const weightDiff = currentWeight - targetWeight
  
  if (weightDiff <= 0) {
    return 0 // 已达成目标
  }
  
  // 计算平均每日减重速度
  const weightList = getWeightList()
  let avgDailyLoss = 0.1 // 默认每天减0.1kg
  
  if (weightList.length >= 2) {
    const firstWeight = weightList[weightList.length - 1].weight
    const lastWeight = weightList[0].weight
    const days = weightList.length - 1
    
    if (days > 0 && firstWeight > lastWeight) {
      avgDailyLoss = (firstWeight - lastWeight) / days
    }
  }
  
  // 避免除以0
  if (avgDailyLoss <= 0) {
    avgDailyLoss = 0.1
  }
  
  return Math.ceil(weightDiff / avgDailyLoss)
}

// ============ BMI计算 ============
/**
 * 计算BMI
 * @param {number} weight - 体重(kg)
 * @param {number} height - 身高(cm)
 * @returns {number} BMI值
 */
export function calculateBMI(weight, height) {
  if (!weight || !height) return 0
  const heightM = height / 100
  return weight / (heightM * heightM)
}

/**
 * 获取BMI状态
 * @param {number} bmi - BMI值
 * @returns {string} BMI状态描述
 */
export function getBMIStatus(bmi) {
  if (bmi < 18.5) return 'underweight'  // 偏瘦
  if (bmi < 24) return 'normal'         // 正常
  if (bmi < 28) return 'overweight'     // 偏胖
  return 'obese'                        // 肥胖
}

/**
 * 获取人物形象emoji（根据BMI状态）
 * @param {string} status - BMI状态
 * @returns {string} 对应的emoji
 */
export function getAvatarEmoji(status) {
  const avatarMap = {
    'underweight': '🧘', // 偏瘦：瑜伽
    'normal': '📈',      // 正常：微笑
    'overweight': '😊',  // 偏胖：开心（努力中）
    'obese': '😅'        // 肥胖：努力减肥中
  }
  return avatarMap[status] || '📈'
}

/**
 * 获取人物形象描述
 * @param {string} status - BMI状态
 * @returns {string} 描述文字
 */
export function getAvatarDescription(status) {
  const descMap = {
    'underweight': '身材纤瘦，注意营养均衡',
    'normal': '体重正常，继续保持',
    'overweight': '稍微偏胖，加油减重',
    'obese': '超重较多，坚持锻炼'
  }
  return descMap[status] || '继续加油'
}

// ============ 用户身高数据 ============
/**
 * 获取用户身高
 * @returns {number|null} 身高(cm)
 */
export function getUserHeight() {
  try {
    // 从问卷数据中获取
    const questionnaire = JSON.parse(uni.getStorageSync('questionnaireBaseInfo') || '{}')
    if (questionnaire.height) {
      return parseFloat(questionnaire.height.replace('cm', ''))
    }
    return 170 // 默认身高
  } catch (e) {
    return 170
  }
}

// ============ 综合进度数据 ============
/**
 * 获取完整的用户进度数据
 * @returns {Object} 包含所有进度信息的对象
 */
export function getUserProgressData() {
  const useDays = getUseDays()
  const recordDays = getRecordDays()
  const planDays = getPlanDays()
  const remainingDays = getRemainingDays()
  const weightList = getWeightList()
  const currentWeight = getLatestWeight()
  const targetWeight = getTargetWeight()
  const height = getUserHeight()
  
  let bmi = 0
  let bmiStatus = 'normal'
  let avatarEmoji = '📈'
  let avatarDesc = '继续加油'
  
  if (currentWeight && height) {
    bmi = calculateBMI(currentWeight, height)
    bmiStatus = getBMIStatus(bmi)
    avatarEmoji = getAvatarEmoji(bmiStatus)
    avatarDesc = getAvatarDescription(bmiStatus)
  }
  
  return {
    // 天数统计
    useDays,
    recordDays,
    planDays,
    remainingDays,
    
    // 体重数据
    weightList,
    currentWeight,
    targetWeight,
    
    // BMI数据
    height,
    bmi: bmi.toFixed(1),
    bmiStatus,
    
    // 人物形象
    avatarEmoji,
    avatarDesc,
    
    // 目标进度
    progressPercent: targetWeight && currentWeight 
      ? Math.min(100, Math.max(0, 100 - ((currentWeight - targetWeight) / currentWeight * 100)))
      : 0
  }
}

// ============ 鼓励语系统 ============
/**
 * 获取鼓励语
 * @param {Object} progressData - 进度数据
 * @returns {string} 鼓励语
 */
export function getEncouragementText(progressData) {
  const { useDays, planDays, remainingDays, bmiStatus } = progressData
  
  // 根据不同情况返回不同鼓励语
  if (remainingDays === 0) {
    return '🎉 恭喜达成目标！'
  }
  
  if (planDays >= useDays - 1) {
    return '💪 坚持得很好！'
  }
  
  if (planDays >= 7) {
    return '🌟 一周坚持，继续加油！'
  }
  
  if (bmiStatus === 'normal') {
    return '✨ 保持良好状态！'
  }
  
  return '💪 加油，你可以的！'
}
