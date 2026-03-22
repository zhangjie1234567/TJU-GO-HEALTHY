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
  PLAN_START_DATE: 'plan_start_date',        // 方案开始日期
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

/**
 * 将各种格式的日期字符串统一为 YYYY-MM-DD
 */
function normalizeDate(str) {
  try {
    const d = new Date(str)
    if (!isNaN(d.getTime())) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }
  } catch {}
  return String(str)
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
 * 获取累计记录天数（体重/运动/喝水/日记任一模块某天有记录即计1天）
 * @returns {number} 有记录的总天数
 */
export function getRecordDays() {
  try {
    const recordDates = new Set()

    // 1. 体重记录（weightList: [{date: 'YYYY-MM-DD', weight}]）
    const weightList = JSON.parse(uni.getStorageSync(KEYS.WEIGHT_LIST) || '[]')
    weightList.forEach(item => {
      if (item.date) recordDates.add(normalizeDate(item.date))
    })

    // 2. 运动记录（exerciseRecords: {[toLocaleDateString()]: [...records], goal: number}）
    const exerciseRecords = JSON.parse(uni.getStorageSync('exerciseRecords') || '{}')
    Object.keys(exerciseRecords).forEach(key => {
      if (key !== 'goal' && Array.isArray(exerciseRecords[key]) && exerciseRecords[key].length > 0) {
        recordDates.add(normalizeDate(key))
      }
    })

    // 3. 喝水记录（drinkWater: {[toLocaleDateString()]: number, goal: number}）
    const drinkWater = JSON.parse(uni.getStorageSync('drinkWater') || '{}')
    Object.keys(drinkWater).forEach(key => {
      if (key !== 'goal' && Number(drinkWater[key]) > 0) {
        recordDates.add(normalizeDate(key))
      }
    })

    // 4. 日记记录（diaryList: [{date: 'YYYY-MM-DD HH:mm', ...}]）
    const diaryList = JSON.parse(uni.getStorageSync('diaryList') || '[]')
    diaryList.forEach(item => {
      if (item.date) {
        // date 格式为 'YYYY-MM-DD HH:mm'，取日期部分
        recordDates.add(item.date.substring(0, 10))
      }
    })

    return recordDates.size
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
 * 获取坚持方案天数
 * 与"使用天数"逻辑一致，从首次使用日期开始计算
 * @returns {number} 坚持方案的天数
 */
export function getPlanDays() {
  return getUseDays()
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
 * 计算剩余天数（基于体重趋势分析预估达到目标所需天数）
 * @returns {number} 预估剩余天数
 */
export function getRemainingDays() {
  const currentWeight = getLatestWeight()
  const targetWeight = getTargetWeight()

  if (!currentWeight || !targetWeight) {
    return 30 // 未设置体重或目标，返回默认值
  }

  const diffToTarget = currentWeight - targetWeight
  const gap = Math.abs(diffToTarget)

  if (gap <= 0.1) {
    return 0 // 已达成目标
  }

  // 基于体重趋势图计算每日朝目标方向变化速度（兼容减重/增重）
  const weightList = getWeightList()
  const isWeightLossGoal = diffToTarget > 0
  let avgDailyTowardTarget = 0.1 // 默认每日朝目标变化0.1kg

  if (weightList.length >= 2) {
    // weightList 按时间倒序，最新在前
    const newest = weightList[0]
    const oldest = weightList[weightList.length - 1]
    const daysDiff = getDaysDiff(oldest.date, newest.date)
    if (daysDiff > 0) {
      const trend = isWeightLossGoal
        ? (Number(oldest.weight) - Number(newest.weight)) / daysDiff
        : (Number(newest.weight) - Number(oldest.weight)) / daysDiff
      if (trend > 0) {
        avgDailyTowardTarget = trend
      }
    }
  }

  if (avgDailyTowardTarget <= 0) {
    avgDailyTowardTarget = 0.1
  }

  return Math.ceil(gap / avgDailyTowardTarget)
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
    const raw = uni.getStorageSync('questionnaireBaseInfo')
    if (!raw) return 170
    const questionnaire = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (questionnaire.height) {
      return parseFloat(String(questionnaire.height).replace('cm', ''))
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
  const rawUseDays = getUseDays()
  let recordDays = getRecordDays()
  const rawPlanDays = getPlanDays()
  const remainingDays = getRemainingDays()
  const weightList = getWeightList()
  const currentWeight = getLatestWeight()
  const targetWeight = getTargetWeight()
  const height = getUserHeight()
  
  // ==================== 新增：优先使用保存的数据 ====================
  // 如果已保存 recordDays（问卷提交时初始化为1），则使用保存的值
  try {
    const savedRecordDays = uni.getStorageSync('recordDays')
    if (savedRecordDays) {
      recordDays = Math.max(recordDays, parseInt(savedRecordDays) || 0)
    }
  } catch (e) {
    console.warn('读取保存的 recordDays 失败:', e)
  }
  // =================================================================

  // 显示层做兜底：使用天数不应小于已发生记录的天数
  const useDays = Math.max(rawUseDays, recordDays)
  // 业务规则：记录了几天，代表至少坚持了几天
  const planDays = Math.max(rawPlanDays, recordDays)
  
  let bmi = 0
  let bmiStatus = 'normal'
  let avatarEmoji = '📈'
  let avatarDesc = '继续加油'
  
  // 优先使用最新体重+身高实时计算 BMI，避免首页沿用问卷时期缓存值
  if (currentWeight && height) {
    bmi = calculateBMI(currentWeight, height)
  } else {
    try {
      const savedBMI = uni.getStorageSync('userBMI')
      if (savedBMI) {
        bmi = parseFloat(savedBMI) || 0
      }
    } catch (e) {}
  }
  
  if (bmi > 0) {
    bmiStatus = getBMIStatus(bmi)
    avatarEmoji = getAvatarEmoji(bmiStatus)
    avatarDesc = getAvatarDescription(bmiStatus)
  }
  // ==================================================================
  
  const progressPercent = (() => {
    if (!targetWeight || !currentWeight) return 0
    const latest = Number(currentWeight)
    const target = Number(targetWeight)
    const historyStart = Array.isArray(weightList) && weightList.length > 0
      ? Number(weightList[weightList.length - 1].weight)
      : latest

    if (Number.isNaN(latest) || Number.isNaN(target) || Number.isNaN(historyStart)) return 0

    const totalDistance = Math.abs(historyStart - target)
    const remainingDistance = Math.abs(latest - target)

    if (totalDistance <= 0.1) {
      return remainingDistance <= 0.1 ? 100 : 0
    }

    return Math.min(100, Math.max(0, ((totalDistance - remainingDistance) / totalDistance) * 100))
  })()

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
    progressPercent
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
