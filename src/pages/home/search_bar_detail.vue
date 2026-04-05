<template>
  <view class="food-detail-page">
    <!-- 顶部食物信息区 -->
    <view class="food-header">
      <view class="food-basic-info">
        <view class="food-name">{{ foodData.name }}</view>
        <view class="food-category-tag">
          <text class="category-icon">🏷️</text>
          <text>{{ foodData.category }}</text>
        </view>
        <view class="food-calorie">
          <text class="calorie-value">{{ foodData.energy }}</text>
          <text class="calorie-unit">kcal/100g</text>
        </view>
        <!-- 收藏按钮 -->
        <view class="detail-collect-btn" @click="handleToggleCollect">
          <text class="collect-icon">{{ isCollectedState ? '★' : '☆' }}</text>
          <text class="collect-text">{{ isCollectedState ? '已收藏' : '收藏' }}</text>
        </view>
      </view>
    </view>

    <!-- 标签 -->
    <view v-if="foodData.tags && foodData.tags.length > 0" class="tags-section">
      <text v-for="tag in foodData.tags" :key="tag" class="food-tag">{{ tag }}</text>
    </view>

    <!-- 作用与特征区 -->
    <view class="info-section">
      <view class="info-card">
        <view class="info-label">
          <text class="info-icon">✨</text>
          <text class="info-title">功效作用</text>
        </view>
        <text class="info-text">{{ foodData.effect }}</text>
      </view>
      <view class="info-card">
        <view class="info-label">
          <text class="info-icon">🔍</text>
          <text class="info-title">食物特征</text>
        </view>
        <text class="info-text">{{ foodData.feature }}</text>
      </view>
    </view>

    <!-- 营养成分表 -->
    <view class="nutrition-section">
      <view class="section-header">
        <text class="section-icon">📊</text>
        <text class="section-title">营养成分（每100g）</text>
      </view>
      
      <!-- 主要营养素（大卡片） -->
      <view class="main-nutrients">
        <view class="nutrient-big-card">
          <text class="nutrient-value">{{ foodData.nutrition.protein }}g</text>
          <text class="nutrient-label">蛋白质</text>
          <view class="nutrient-bar">
            <view class="nutrient-bar-fill" :style="{ width: getNutrientPercent('protein') }"></view>
          </view>
        </view>
        <view class="nutrient-big-card">
          <text class="nutrient-value">{{ foodData.nutrition.fat }}g</text>
          <text class="nutrient-label">脂肪</text>
          <view class="nutrient-bar">
            <view class="nutrient-bar-fill" :style="{ width: getNutrientPercent('fat') }"></view>
          </view>
        </view>
        <view class="nutrient-big-card">
          <text class="nutrient-value">{{ foodData.nutrition.cho }}g</text>
          <text class="nutrient-label">碳水</text>
          <view class="nutrient-bar">
            <view class="nutrient-bar-fill" :style="{ width: getNutrientPercent('cho') }"></view>
          </view>
        </view>
      </view>

      <!-- 详细营养成分 -->
      <view class="nutrition-grid">
        <view class="nutrition-item">
          <text class="nutrition-name">💧 水分</text>
          <text class="nutrition-value">{{ foodData.nutrition.water }}g</text>
        </view>
        <view class="nutrition-item">
          <text class="nutrition-name">🌾 膳食纤维</text>
          <text class="nutrition-value">{{ foodData.nutrition.dietaryFiber }}g</text>
        </view>
        <view class="nutrition-item">
          <text class="nutrition-name">🥕 维生素A</text>
          <text class="nutrition-value">{{ foodData.nutrition.vitaminA }}μg</text>
        </view>
        <view class="nutrition-item">
          <text class="nutrition-name">🧪 烟酸</text>
          <text class="nutrition-value">{{ foodData.nutrition.niacin }}mg</text>
        </view>
        <view class="nutrition-item">
          <text class="nutrition-name">🍊 维生素C</text>
          <text class="nutrition-value">{{ foodData.nutrition.vitaminC }}mg</text>
        </view>
        <view class="nutrition-item">
          <text class="nutrition-name">🌻 维生素E</text>
          <text class="nutrition-value">{{ foodData.nutrition.vitaminE }}mg</text>
        </view>
        <view class="nutrition-item">
          <text class="nutrition-name">🦴 钙</text>
          <text class="nutrition-value">{{ foodData.nutrition.ca }}mg</text>
        </view>
        <view class="nutrition-item">
          <text class="nutrition-name">🩸 铁</text>
          <text class="nutrition-value">{{ foodData.nutrition.fe }}mg</text>
        </view>
        <view class="nutrition-item">
          <text class="nutrition-name">🧂 钠</text>
          <text class="nutrition-value">{{ foodData.nutrition.na }}mg</text>
        </view>
        <view class="nutrition-item">
          <text class="nutrition-name">💊 胆固醇</text>
          <text class="nutrition-value">{{ foodData.nutrition.cholesterol }}mg</text>
        </view>
      </view>
    </view>

    <!-- 相关菜品推荐 -->
    <view class="recipes-section">
      <view class="section-header">
        <text class="section-icon">👨‍🍳</text>
        <text class="section-title">推荐菜品</text>
      </view>
      <view class="recipes-grid">
        <view 
          v-for="(recipe, index) in foodData.relatedRecipes" 
          :key="index" 
          class="recipe-card"
        >
          <view class="recipe-icon">🍽️</view>
          <text class="recipe-name">{{ recipe }}</text>
        </view>
      </view>
    </view>

    <!-- 添加到餐次 -->
    <view class="meal-set-section">
      <view class="meal-set-title">📌 添加到今日餐次</view>
      <view class="meal-set-buttons">
        <view class="meal-set-btn breakfast" @click="openMealPopup('breakfast')">🌅 设置为早餐</view>
        <view class="meal-set-btn lunch" @click="openMealPopup('lunch')">☀️ 设置为午餐</view>
        <view class="meal-set-btn dinner" @click="openMealPopup('dinner')">🌙 设置为晚餐</view>
      </view>
    </view>

    <!-- 底部占位 -->
    <view style="height: 40px;"></view>

    <!-- 设置餐次弹窗（仅通过确定/取消按钮关闭） -->
    <view v-if="showMealPopup" class="meal-popup-mask">
      <view class="meal-popup-content">
        <view class="meal-popup-title">设置为{{ mealTypeNames[currentMealType] }}</view>

        <!-- 器皿选择 -->
        <view class="meal-section-label">🥣 选择器皿</view>
        <view class="meal-chips-row">
          <view
            v-for="(vessel, idx) in vessels"
            :key="idx"
            class="meal-chip"
            :class="{ 'meal-chip-active': selectedVesselIdx === idx }"
            @click="selectedVesselIdx = idx"
          >
            <text class="chip-name">{{ vessel.name }}</text>
            <text class="chip-sub">{{ vessel.grams }}g</text>
          </view>
          <!-- 自定义"x个"器皿 -->
          <view
            class="meal-chip"
            :class="{ 'meal-chip-active': selectedVesselIdx === -1 }"
            @click="selectedVesselIdx = -1"
          >
            <text class="chip-name">x个</text>
            <text class="chip-sub">自定义</text>
          </view>
        </view>
        <!-- 自定义个数输入框（仅选中"x个"时显示） -->
        <view v-if="selectedVesselIdx === -1" class="custom-count-row">
          <text class="custom-count-label">每个</text>
          <input
            class="custom-count-input"
            type="number"
            v-model="customVesselGrams"
            placeholder="每个克数"
          />
          <text class="custom-count-label">g，共</text>
          <input
            class="custom-count-input custom-count-short"
            type="number"
            v-model="customVesselCount"
            placeholder="个数"
          />
          <text class="custom-count-label">个</text>
        </view>

        <!-- 用量选择 -->
        <view class="meal-section-label">📏 选择用量</view>
        <view class="meal-chips-row">
          <view
            v-for="(portion, idx) in portions"
            :key="idx"
            class="meal-chip meal-chip-wide"
            :class="{ 'meal-chip-active': selectedPortionIdx === idx }"
            @click="selectedPortionIdx = idx"
          >
            {{ portion.name }}
          </view>
        </view>

        <!-- 热量预览 -->
        <view class="meal-calorie-preview">
          <text class="preview-label">预计热量：</text>
          <text class="preview-kcal">{{ calculatedCalories }}</text>
          <text class="preview-unit">千卡</text>
        </view>

        <!-- 操作按钮 -->
        <view class="meal-popup-btns">
          <view class="meal-btn-cancel" @click="closeMealPopup">取消</view>
          <view class="meal-btn-confirm" @click="confirmMealSetting">确定</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import { getFoodDetail, toggleCollection, addFoodToMeal } from './foodDataService.js'

  // ========== 数据状态 ==========
  const foodData = ref({
    id: '',
    name: '加载中...',
    category: '',
    image: '',
    energy: 0,
    nutrition: {
      water: 0,
      protein: 0,
      fat: 0,
      cho: 0,
      dietaryFiber: 0,
      vitaminA: 0,
      thiamin: 0,
      riboflavin: 0,
      niacin: 0,
      vitaminC: 0,
      vitaminE: 0,
      ca: 0,
      fe: 0,
      na: 0,
      cholesterol: 0
    },
    effect: '',
    feature: '',
    relatedRecipes: [],
    tags: []
  })

  const isCollectedState = ref(false)
  const isLoading = ref(true)

  // ========== 生命周期 ==========
  onLoad(async (options) => {
    if (!options.foodId) {
      uni.showToast({ title: '参数错误', icon: 'none' })
      return
    }

    try {
      // 从数据服务获取食物详情
      const detail = await getFoodDetail(options.foodId)
      
      if (detail) {
        foodData.value = detail
        isCollectedState.value = !!detail.collected
      } else {
        uni.showToast({ title: '食物不存在', icon: 'none' })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      }
    } catch (error) {
      console.error('加载食物详情失败', error)
      uni.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      isLoading.value = false
    }
  })

  // ========== 营养成分百分比计算 ==========
  // 用于可视化展示（基于参考值）
  const getNutrientPercent = (type) => {
    const nutrition = foodData.value.nutrition
    let value = 0
    let referenceValue = 100 // 参考值
    
    switch(type) {
      case 'protein':
        value = nutrition.protein
        referenceValue = 60 // 成人每日推荐蛋白质摄入量约60g
        break
      case 'fat':
        value = nutrition.fat
        referenceValue = 60 // 成人每日推荐脂肪摄入量约60g
        break
      case 'cho':
        value = nutrition.cho
        referenceValue = 300 // 成人每日推荐碳水摄入量约300g
        break
    }
    
    const percent = Math.min((value / referenceValue) * 100 * 100, 100) // 放大显示效果
    return `${percent}%`
  }

  // ========== 收藏功能 ==========
  const handleToggleCollect = async () => {
    try {
      const newState = await toggleCollection(foodData.value.id)
      isCollectedState.value = newState
      uni.showToast({
        title: newState ? '已添加到收藏' : '已取消收藏',
        icon: 'none',
        duration: 1500
      })
    } catch (error) {
      console.error('切换收藏失败', error)
      uni.showToast({ title: error.message || '收藏操作失败', icon: 'none' })
    }
  }

  // ========== 餐次设置弹窗 ==========
  const showMealPopup = ref(false)
  const currentMealType = ref('')

  const mealTypeNames = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐'
  }

  // 器皿列表（名称 + 容量g）
  const vessels = [
    { name: '小碗', grams: 100 },
    { name: '中碗', grams: 200 },
    { name: '大碗', grams: 300 },
    { name: '小盘', grams: 150 },
    { name: '中盘', grams: 300 },
    { name: '大盘', grams: 500 },
    { name: '小杯', grams: 100 },
    { name: '大杯', grams: 250 },
  ]
  const selectedVesselIdx = ref(0)
  // 自定义"x个"器皿的参数
  const customVesselGrams = ref('') // 每个克数
  const customVesselCount = ref('') // 个数

  // 用量列表
  const portions = [
    { name: '1/4', ratio: 0.25 },
    { name: '1/3', ratio: 0.333 },
    { name: '1/2', ratio: 0.5 },
    { name: '3/4', ratio: 0.75 },
    { name: '整份', ratio: 1.0 },
  ]
  const selectedPortionIdx = ref(4) // 默认整份

  // 根据器皿和用量计算热量
  const calculatedCalories = computed(() => {
    let totalGrams = 0
    if (selectedVesselIdx.value === -1) {
      // 自定义"x个"模式
      const perGrams = parseFloat(customVesselGrams.value) || 0
      const count = parseInt(customVesselCount.value) || 0
      totalGrams = perGrams * count
    } else {
      const vessel = vessels[selectedVesselIdx.value]
      const portion = portions[selectedPortionIdx.value]
      totalGrams = vessel.grams * portion.ratio
    }
    return Math.round((foodData.value.energy / 100) * totalGrams)
  })

  function getSelectedGrams() {
    if (selectedVesselIdx.value === -1) {
      const perGrams = parseFloat(customVesselGrams.value) || 0
      const count = parseInt(customVesselCount.value) || 0
      return perGrams * count
    }
    const vessel = vessels[selectedVesselIdx.value]
    const portion = portions[selectedPortionIdx.value]
    return vessel.grams * portion.ratio
  }

  function openMealPopup(mealType) {
    currentMealType.value = mealType
    selectedVesselIdx.value = 0
    selectedPortionIdx.value = 4
    customVesselGrams.value = ''
    customVesselCount.value = ''
    showMealPopup.value = true
  }

  function closeMealPopup() {
    showMealPopup.value = false
  }

  async function confirmMealSetting() {
    // 自定义模式校验
    if (selectedVesselIdx.value === -1) {
      const perGrams = parseFloat(customVesselGrams.value)
      const count = parseInt(customVesselCount.value)
      if (!perGrams || perGrams <= 0 || !count || count <= 0) {
        uni.showToast({ title: '请输入每个克数和个数', icon: 'none' })
        return
      }
    }
    const kcal = calculatedCalories.value
    const grams = getSelectedGrams()
    const mealType = currentMealType.value
    const today = new Date().toLocaleDateString()

    try {
      await addFoodToMeal({
        foodId: Number(foodData.value.id),
        mealType,
        amountGrams: Number(grams.toFixed(2)),
        calories: Number(kcal.toFixed(2))
      })
    } catch (error) {
      console.error('添加食物到某餐失败', error)
      uni.showToast({ title: error.message || '添加失败', icon: 'none' })
      return
    }

    let caloriesData = {}
    try {
      caloriesData = JSON.parse(uni.getStorageSync('calories') || '{}')
    } catch {}

    if (!caloriesData[today]) {
      caloriesData[today] = { breakfast: 0, lunch: 0, dinner: 0, other: 0 }
    }
    caloriesData[today][mealType] = (caloriesData[today][mealType] || 0) + kcal
    uni.setStorageSync('calories', JSON.stringify(caloriesData))

    showMealPopup.value = false
    uni.showToast({
      title: `已添加到${mealTypeNames[mealType]}，+${kcal}千卡`,
      icon: 'success',
      duration: 2000
    })
  }
</script>

<style scoped>
  .food-detail-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #E3F2FD 0%, #F0F9FF 100%);
    padding-bottom: 20px;
  }

  /* ========== 顶部食物信息区 ========== */
  .food-header {
    background: white;
    padding: 20px 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(79, 161, 242, 0.08);
  }

  .food-basic-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .food-name {
    font-size: 22px;
    font-weight: 700;
    color: #333;
    line-height: 1.3;
  }

  .food-category-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    background: rgba(79, 161, 242, 0.1);
    border-radius: 12px;
    align-self: flex-start;
  }

  .category-icon {
    font-size: 14px;
  }

  .food-category-tag text:last-child {
    font-size: 13px;
    color: #4FA1F2;
    font-weight: 600;
  }

  .food-calorie {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .calorie-value {
    font-size: 32px;
    font-weight: 700;
    color: #FF6B6B;
    line-height: 1;
  }

  .calorie-unit {
    font-size: 13px;
    color: #999;
  }

  .detail-collect-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: rgba(255, 215, 0, 0.1);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 20px;
    align-self: flex-start;
    cursor: pointer;
    transition: all 0.2s;
  }

  .detail-collect-btn:active {
    background: rgba(255, 215, 0, 0.2);
    transform: scale(0.95);
  }

  .detail-collect-btn .collect-icon {
    font-size: 18px;
    color: #FFD700;
  }

  .detail-collect-btn .collect-text {
    font-size: 13px;
    color: #D4AF37;
    font-weight: 600;
  }

  /* ========== 标签区 ========== */
  .tags-section {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 16px;
    background: white;
    margin-bottom: 12px;
  }

  .food-tag {
    padding: 6px 14px;
    background: linear-gradient(135deg, rgba(79, 161, 242, 0.1), rgba(128, 208, 255, 0.1));
    border: 1px solid rgba(79, 161, 242, 0.2);
    border-radius: 14px;
    font-size: 12px;
    color: #4FA1F2;
    font-weight: 600;
  }

  /* ========== 信息卡片区 ========== */
  .info-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 0 16px;
    margin-bottom: 12px;
  }

  .info-card {
    background: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(79, 161, 242, 0.08);
  }

  .info-label {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 10px;
  }

  .info-icon {
    font-size: 18px;
  }

  .info-title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
  }

  .info-text {
    font-size: 14px;
    color: #666;
    line-height: 1.8;
  }

  /* ========== 营养成分区 ========== */
  .nutrition-section {
    background: white;
    padding: 20px 16px;
    margin: 0 16px 12px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(79, 161, 242, 0.08);
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .section-icon {
    font-size: 20px;
  }

  .section-title {
    font-size: 17px;
    font-weight: 700;
    color: #333;
  }

  /* 主要营养素（三大营养素） */
  .main-nutrients {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .nutrient-big-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 10px;
    background: linear-gradient(135deg, rgba(79, 161, 242, 0.08), rgba(128, 208, 255, 0.08));
    border: 1px solid rgba(79, 161, 242, 0.15);
    border-radius: 12px;
  }

  .nutrient-value {
    font-size: 24px;
    font-weight: 700;
    color: #4FA1F2;
    margin-bottom: 6px;
  }

  .nutrient-label {
    font-size: 12px;
    color: #666;
    margin-bottom: 10px;
  }

  .nutrient-bar {
    width: 100%;
    height: 4px;
    background: rgba(79, 161, 242, 0.2);
    border-radius: 2px;
    overflow: hidden;
  }

  .nutrient-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #4FA1F2, #80D0FF);
    border-radius: 2px;
    transition: width 0.5s ease;
  }

  /* 详细营养成分网格 */
  .nutrition-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 16px;
  }

  .nutrition-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background: rgba(79, 161, 242, 0.04);
    border-radius: 8px;
  }

  .nutrition-name {
    font-size: 13px;
    color: #666;
  }

  .nutrition-value {
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }

  /* ========== 相关菜品区 ========== */
  .recipes-section {
    background: white;
    padding: 20px 16px;
    margin: 0 16px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(79, 161, 242, 0.08);
  }

  .recipes-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .recipe-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 12px;
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.08), rgba(255, 193, 7, 0.08));
    border: 1px solid rgba(255, 107, 107, 0.15);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .recipe-card:active {
    transform: scale(0.95);
    background: linear-gradient(135deg, rgba(255, 107, 107, 0.12), rgba(255, 193, 7, 0.12));
  }

  .recipe-icon {
    font-size: 36px;
    margin-bottom: 8px;
  }

  .recipe-name {
    font-size: 13px;
    color: #333;
    font-weight: 600;
    text-align: center;
  }

  /* ========== 添加到餐次区 ========== */
  .meal-set-section {
    margin: 0 16px 16px;
    background: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(79, 161, 242, 0.08);
  }

  .meal-set-title {
    font-size: 16px;
    font-weight: 700;
    color: #333;
    margin-bottom: 12px;
  }

  .meal-set-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .meal-set-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 8px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .meal-set-btn:active {
    opacity: 0.75;
  }

  .meal-set-btn.breakfast {
    background: linear-gradient(135deg, #FFF3CD, #FFE082);
    color: #E65100;
  }

  .meal-set-btn.lunch {
    background: linear-gradient(135deg, #E8F5E9, #A5D6A7);
    color: #2E7D32;
  }

  .meal-set-btn.dinner {
    background: linear-gradient(135deg, #E3F2FD, #90CAF9);
    color: #1565C0;
  }

  /* ========== 餐次弹窗 ========== */
  .meal-popup-mask {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .meal-popup-content {
    background: white;
    border-radius: 16px;
    padding: 24px 20px 20px;
    width: 86%;
    max-width: 340px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  }

  .meal-popup-title {
    font-size: 18px;
    font-weight: 700;
    color: #333;
    text-align: center;
    margin-bottom: 18px;
  }

  .meal-section-label {
    font-size: 14px;
    font-weight: 600;
    color: #555;
    margin-bottom: 8px;
  }

  .meal-chips-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .meal-chip {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 12px;
    border-radius: 8px;
    background: #f5f7fa;
    border: 1.5px solid transparent;
    cursor: pointer;
    transition: all 0.15s;
    min-width: 54px;
  }

  .meal-chip-wide {
    flex-direction: row;
    min-width: 54px;
    padding: 8px 14px;
  }

  .meal-chip-active {
    background: rgba(79, 161, 242, 0.12);
    border-color: #419bf9;
  }

  .chip-name {
    font-size: 13px;
    font-weight: 600;
    color: #333;
  }

  .chip-sub {
    font-size: 11px;
    color: #999;
    margin-top: 2px;
  }

  /* 自定义个数输入行 */
  .custom-count-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 14px;
    background: #f5f7fa;
    border-radius: 10px;
    padding: 10px 12px;
  }

  .custom-count-label {
    font-size: 13px;
    color: #555;
    white-space: nowrap;
  }

  .custom-count-input {
    flex: 1;
    border: 1.5px solid #d0e6fa;
    border-radius: 8px;
    padding: 6px 8px;
    font-size: 14px;
    background: white;
    text-align: center;
    min-width: 0;
  }

  .custom-count-short {
    max-width: 56px;
    flex: none;
  }

  .meal-calorie-preview {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 4px;
    background: linear-gradient(135deg, #E3F2FD, #f0f9ff);
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 18px;
  }

  .preview-label {
    font-size: 14px;
    color: #555;
  }

  .preview-kcal {
    font-size: 28px;
    font-weight: 700;
    color: #419bf9;
  }

  .preview-unit {
    font-size: 13px;
    color: #888;
  }

  .meal-popup-btns {
    display: flex;
    gap: 12px;
  }

  .meal-btn-cancel {
    flex: 1;
    padding: 12px;
    border-radius: 10px;
    text-align: center;
    font-size: 15px;
    font-weight: 600;
    background: #f5f7fa;
    color: #666;
    cursor: pointer;
  }

  .meal-btn-cancel:active {
    opacity: 0.75;
  }

  .meal-btn-confirm {
    flex: 1;
    padding: 12px;
    border-radius: 10px;
    text-align: center;
    font-size: 15px;
    font-weight: 600;
    background: linear-gradient(135deg, #419bf9, #5fb3ff);
    color: white;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(79, 161, 242, 0.3);
  }

  .meal-btn-confirm:active {
    opacity: 0.85;
  }
</style>