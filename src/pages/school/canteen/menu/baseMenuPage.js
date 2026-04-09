import { computed, ref } from 'vue'
import { BASE_URL } from '@/config.js'
import { addCollection, getCollections, removeCollection } from '@/pages/my/my-store.js'
import { addFoodToMeal, syncLocalMealCalories } from '@/pages/home/foodDataService.js'

function requestWithAuth({ url, method = 'GET', data = null }) {
  const token = uni.getStorageSync('token') || ''
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      success: (res) => {
        const body = res?.data || {}
        if (body && typeof body === 'object' && 'code' in body) {
          if (body.code !== 200 && body.code !== 0 && body.code !== 1) {
            reject(new Error(body.message || body.msg || '请求失败'))
            return
          }
          resolve(body.data || [])
          return
        }
        resolve(body)
      },
      fail: reject
    })
  })
}

export function useCanteenMenu(canteenName) {
  const dishes = ref([])
  const loading = ref(false)

  const fetchMenu = async () => {
    loading.value = true
    try {
      const today = new Date().toISOString().slice(0, 10)
      const list = await requestWithAuth({
        url: `${BASE_URL}/canteens/menus?canteenName=${encodeURIComponent(canteenName)}&date=${today}`
      })
      const collections = await getCollections()
      const dishMap = new Set((collections?.dishes || []).map(item => Number(item.itemId || item.id)).filter(id => !Number.isNaN(id)))

      const normalized = (Array.isArray(list) ? list : []).map(item => ({
        id: Number(item.id),
        dishName: item.dishName || '未命名菜品',
        price: Number(item.price || 0),
        floor: item.floor ?? '-',
        flavor: item.flavor || '暂无',
        calorie: item.calorie ?? '-',
        collected: dishMap.has(Number(item.id))
      }))

      normalized.sort((a, b) => {
        if (a.collected !== b.collected) return a.collected ? -1 : 1
        return String(a.dishName).localeCompare(String(b.dishName), 'zh-CN')
      })
      dishes.value = normalized
    } catch (e) {
      dishes.value = []
      uni.showToast({ title: '加载菜单失败', icon: 'none' })
    } finally {
      loading.value = false
    }
  }

  const toggleDishCollection = async (dish) => {
    const itemId = Number(dish.id)
    if (!itemId) return

    if (dish.collected) {
      const ok = await removeCollection('dishes', itemId)
      if (!ok) return
      dish.collected = false
      uni.showToast({ title: '已取消收藏', icon: 'none' })
    } else {
      const saved = await addCollection({
        // 食堂菜品使用 dishes 类型，避免与 recipe 表主键冲突导致展示串菜
        itemType: 'dishes',
        itemId,
        itemTitle: dish.dishName,
        itemCover: '🍳',
        itemDesc: `${canteenName} ${dish.floor}楼 · ${dish.flavor} · ${dish.calorie}kcal`
      })
      if (!saved) return
      dish.collected = true
      uni.showToast({ title: '已收藏食堂菜品', icon: 'none' })
    }

    dishes.value = [...dishes.value].sort((a, b) => {
      if (a.collected !== b.collected) return a.collected ? -1 : 1
      return String(a.dishName).localeCompare(String(b.dishName), 'zh-CN')
    })
  }

  const addDishToMeal = async (dish, mealType) => {
    const calorie = Number(dish.calorie || 0)
    if (Number.isNaN(calorie) || calorie <= 0) {
      uni.showToast({ title: '该菜品缺少卡路里', icon: 'none' })
      return
    }

    try {
      await addFoodToMeal({
        foodId: Number(dish.id),
        mealType,
        amountGrams: 100,
        calories: calorie
      })
      syncLocalMealCalories(mealType, calorie)
      uni.showToast({ title: '已加入对应餐次', icon: 'none' })
    } catch (e) {
      uni.showToast({ title: e?.message || '加入失败', icon: 'none' })
    }
  }

  const emptyText = computed(() => {
    if (loading.value) return '加载中...'
    return '暂无菜单数据'
  })

  return {
    dishes,
    loading,
    emptyText,
    fetchMenu,
    toggleDishCollection,
    addDishToMeal
  }
}
