import { BASE_URL } from '@/config.js'

const SEARCH_HISTORY_KEY = 'food_search_history'
const MAX_HISTORY_COUNT = 10
const collectionPendingMap = new Map()
const mealAddPendingMap = new Map()

const MEAL_RULES = {
  breakfast: {
    categoryKeywords: ['谷', '薯', '乳', '蛋', '豆', '果'],
    nameKeywords: ['粥', '包', '馒', '面包', '麦片', '燕麦', '牛奶', '豆浆', '鸡蛋']
  },
  lunch: {
    categoryKeywords: ['谷', '畜', '禽', '鱼', '虾', '贝', '蛋', '豆', '蔬'],
    nameKeywords: ['米饭', '面', '鸡', '鱼', '牛', '猪', '虾', '豆腐', '蔬']
  },
  dinner: {
    categoryKeywords: ['蔬', '鱼', '禽', '豆', '菌', '谷'],
    nameKeywords: ['蔬', '鱼', '豆腐', '杂粮', '燕麦', '粥', '菌']
  },
  other: {
    categoryKeywords: ['果', '坚果', '乳', '豆'],
    nameKeywords: ['酸奶', '水果', '坚果', '香蕉', '苹果', '牛奶']
  }
}

// 后端没有“查询全部收藏食物”接口，这里用内存集合维护当前已知收藏状态。
const collectedFoodIds = new Set()

function getToken() {
  return uni.getStorageSync('token') || ''
}

function buildAuthHeader() {
  const token = getToken()
  if (!token) {
    return null
  }
  return {
    Authorization: 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

function normalizeFoodItem(item) {
  const foodId = Number(item.id)
  return {
    id: Number.isNaN(foodId) ? item.id : foodId,
    name: item.name || '',
    category: item.category || '',
    image: item.image || '',
    energy: Number(item.energy || 0),
    tags: normalizeArray(item.tags),
    collected: !!item.collected
  }
}

function normalizeFoodDetail(detail) {
  const nutrition = detail.nutrition || {}
  const foodId = Number(detail.id)
  const normalizedId = Number.isNaN(foodId) ? detail.id : foodId
  const collected = typeof detail.collected === 'boolean'
    ? detail.collected
    : collectedFoodIds.has(normalizedId)

  if (collected) {
    collectedFoodIds.add(normalizedId)
  } else {
    collectedFoodIds.delete(normalizedId)
  }

  return {
    id: normalizedId,
    name: detail.name || '',
    category: detail.category || '',
    image: detail.image || '',
    energy: Number(detail.energy || 0),
    effect: detail.effect || '',
    feature: detail.feature || '',
    nutrition: {
      water: Number(nutrition.water || 0),
      protein: Number(nutrition.protein || 0),
      fat: Number(nutrition.fat || 0),
      cho: Number(nutrition.cho || 0),
      dietaryFiber: Number(nutrition.dietaryFiber || 0),
      vitaminA: Number(nutrition.vitaminA || 0),
      thiamin: Number(nutrition.thiamin || 0),
      riboflavin: Number(nutrition.riboflavin || 0),
      niacin: Number(nutrition.niacin || 0),
      vitaminC: Number(nutrition.vitaminC || 0),
      vitaminE: Number(nutrition.vitaminE || 0),
      ca: Number(nutrition.ca || 0),
      fe: Number(nutrition.fe || 0),
      na: Number(nutrition.na || 0),
      cholesterol: Number(nutrition.cholesterol || 0)
    },
    relatedRecipes: normalizeArray(detail.relatedRecipes),
    tags: normalizeArray(detail.tags),
    collected
  }
}

function requestApi({ url, method = 'GET', data = undefined }) {
  return new Promise((resolve, reject) => {
    const header = buildAuthHeader()
    if (!header) {
      console.warn('[FoodAPI] token为空，接口未发出:', method, url)
      reject(new Error('未登录，请先登录'))
      return
    }

    uni.request({
      url,
      method,
      data,
      header,
      success: (res) => {
        const body = res.data || {}
        console.log('[FoodAPI] response:', {
          url,
          method,
          statusCode: res.statusCode,
          body
        })

        if (res.statusCode !== 200) {
          reject(new Error('HTTP错误: ' + res.statusCode))
          return
        }
        if (body.code !== 200) {
          reject(new Error(body.message || '接口返回失败'))
          return
        }
        resolve(body.data)
      },
      fail: (err) => {
        console.error('[FoodAPI] network error:', { url, method, err })
        reject(err)
      }
    })
  })
}

function syncCollectedFromItems(items) {
  items.forEach((item) => {
    if (item.collected) {
      collectedFoodIds.add(item.id)
    } else {
      collectedFoodIds.delete(item.id)
    }
  })
}

export async function searchFoods(keyword = '', category = '') {
  const query = (keyword || '').trim()
  const params = [`q=${encodeURIComponent(query)}`]
  if (category && category !== '全部') {
    params.push(`category=${encodeURIComponent(category)}`)
  }

  const data = await requestApi({
    url: `${BASE_URL}/api/search?${params.join('&')}`,
    method: 'GET'
  })

  const list = normalizeArray(data).map(normalizeFoodItem)
  syncCollectedFromItems(list)
  return list
}

export async function getSearchSuggestions(keyword) {
  if (!keyword || !keyword.trim()) {
    return []
  }

  const list = await searchFoods(keyword, '')
  return list.slice(0, 8).map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    image: item.image
  }))
}

export async function getFoodDetail(foodId) {
  const data = await requestApi({
    url: `${BASE_URL}/api/food/${encodeURIComponent(foodId)}`,
    method: 'GET'
  })

  if (!data) {
    return null
  }

  return normalizeFoodDetail(data)
}

export function getCategories() {
  return ['全部', '主食', '蛋白质', '乳制品', '水果', '蔬菜', '油脂', '谷物']
}

function includesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword))
}

function rankFoodsByMeal(list, mealType) {
  const rule = MEAL_RULES[mealType]
  if (!rule) {
    return list
  }

  return [...list].sort((a, b) => {
    const aScore = mealScore(a, rule)
    const bScore = mealScore(b, rule)
    return bScore - aScore
  })
}

function mealScore(item, rule) {
  const categoryText = String(item.category || '')
  const nameText = String(item.name || '')
  const tagText = Array.isArray(item.tags) ? item.tags.join(',') : ''

  let score = 0
  if (includesAny(categoryText, rule.categoryKeywords)) {
    score += 2
  }
  if (includesAny(nameText, rule.nameKeywords)) {
    score += 2
  }
  if (includesAny(tagText, rule.nameKeywords)) {
    score += 1
  }
  return score
}

export async function getPopularFoods(category = '', limit = 4, mealType = '') {
  const list = await searchFoods('', category)
  if (!mealType) {
    return list.slice(0, limit)
  }

  return rankFoodsByMeal(list, mealType).slice(0, limit)
}

export function saveSearchHistory(keyword) {
  const text = (keyword || '').trim()
  if (!text) {
    return
  }

  try {
    let history = JSON.parse(uni.getStorageSync(SEARCH_HISTORY_KEY) || '[]')
    history = history.filter((item) => item !== text)
    history.unshift(text)
    if (history.length > MAX_HISTORY_COUNT) {
      history = history.slice(0, MAX_HISTORY_COUNT)
    }
    uni.setStorageSync(SEARCH_HISTORY_KEY, JSON.stringify(history))
  } catch (e) {
    console.error('保存搜索历史失败', e)
  }
}

export function getSearchHistory() {
  try {
    return JSON.parse(uni.getStorageSync(SEARCH_HISTORY_KEY) || '[]')
  } catch (e) {
    console.error('读取搜索历史失败', e)
    return []
  }
}

export function clearSearchHistory() {
  try {
    uni.removeStorageSync(SEARCH_HISTORY_KEY)
  } catch (e) {
    console.error('清空搜索历史失败', e)
  }
}

export function removeSearchHistory(keyword) {
  try {
    let history = JSON.parse(uni.getStorageSync(SEARCH_HISTORY_KEY) || '[]')
    history = history.filter((item) => item !== keyword)
    uni.setStorageSync(SEARCH_HISTORY_KEY, JSON.stringify(history))
  } catch (e) {
    console.error('删除搜索历史失败', e)
  }
}

export async function toggleCollection(foodId) {
  const numericFoodId = Number(foodId)
  const normalizedFoodId = Number.isNaN(numericFoodId) ? String(foodId) : String(numericFoodId)

  if (collectionPendingMap.has(normalizedFoodId)) {
    return collectionPendingMap.get(normalizedFoodId)
  }

  const pending = requestApi({
    url: `${BASE_URL}/api/food/collect`,
    method: 'POST',
    data: {
      foodId: Number.isNaN(numericFoodId) ? foodId : numericFoodId
    }
  }).then((data) => {
    const collected = !!(data && data.collected)
    if (collected) {
      collectedFoodIds.add(Number.isNaN(numericFoodId) ? foodId : numericFoodId)
    } else {
      collectedFoodIds.delete(Number.isNaN(numericFoodId) ? foodId : numericFoodId)
    }
    return collected
  }).finally(() => {
    collectionPendingMap.delete(normalizedFoodId)
  })

  collectionPendingMap.set(normalizedFoodId, pending)
  return pending
}

export async function addFoodToMeal(payload) {
  const safePayload = payload || {}
  const requestKey = JSON.stringify({
    foodId: safePayload.foodId,
    mealType: safePayload.mealType,
    amountGrams: safePayload.amountGrams,
    calories: safePayload.calories
  })

  if (mealAddPendingMap.has(requestKey)) {
    return mealAddPendingMap.get(requestKey)
  }

  const pending = requestApi({
    url: `${BASE_URL}/api/food/meal/add`,
    method: 'POST',
    data: safePayload
  }).finally(() => {
    mealAddPendingMap.delete(requestKey)
  })

  mealAddPendingMap.set(requestKey, pending)
  return pending
}

export function syncLocalMealCalories(mealType, calories) {
  const safeMealType = String(mealType || '')
  const safeCalories = Number(calories || 0)
  if (!['breakfast', 'lunch', 'dinner', 'other'].includes(safeMealType) || safeCalories <= 0) {
    return
  }

  const today = new Date().toLocaleDateString()
  let caloriesData = {}
  try {
    caloriesData = JSON.parse(uni.getStorageSync('calories') || '{}')
  } catch (e) {
    caloriesData = {}
  }

  if (!caloriesData[today]) {
    caloriesData[today] = { breakfast: 0, lunch: 0, dinner: 0, other: 0 }
  }

  caloriesData[today][safeMealType] = Number(caloriesData[today][safeMealType] || 0) + safeCalories
  uni.setStorageSync('calories', JSON.stringify(caloriesData))
}

export function isCollected(foodId) {
  const numericFoodId = Number(foodId)
  return collectedFoodIds.has(Number.isNaN(numericFoodId) ? foodId : numericFoodId)
}

export async function getCollectionList() {
  const list = await searchFoods('', '')
  return list.filter((item) => item.collected)
}
