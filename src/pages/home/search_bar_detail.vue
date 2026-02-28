<template>
  <view class="food-detail-page">
    <!-- 顶部食物信息区 -->
    <view class="food-header">
      <image class="food-cover" :src="foodData.image" mode="aspectFill" />
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
          <text class="nutrient-value">{{ foodData.nutrition.carbohydrate }}g</text>
          <text class="nutrient-label">碳水</text>
          <view class="nutrient-bar">
            <view class="nutrient-bar-fill" :style="{ width: getNutrientPercent('carbohydrate') }"></view>
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
          <text class="nutrition-value">{{ foodData.nutrition.fiber }}g</text>
        </view>
        <view class="nutrition-item">
          <text class="nutrition-name">🥕 维生素A</text>
          <text class="nutrition-value">{{ foodData.nutrition.vitaminA }}μg</text>
        </view>
        <view class="nutrition-item">
          <text class="nutrition-name">🅱️ 维生素B1</text>
          <text class="nutrition-value">{{ foodData.nutrition.vitaminB1 }}mg</text>
        </view>
        <view class="nutrition-item">
          <text class="nutrition-name">🅱️ 维生素B2</text>
          <text class="nutrition-value">{{ foodData.nutrition.vitaminB2 }}mg</text>
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
          <text class="nutrition-value">{{ foodData.nutrition.calcium }}mg</text>
        </view>
        <view class="nutrition-item">
          <text class="nutrition-name">🩸 铁</text>
          <text class="nutrition-value">{{ foodData.nutrition.iron }}mg</text>
        </view>
        <view class="nutrition-item">
          <text class="nutrition-name">🧂 钠</text>
          <text class="nutrition-value">{{ foodData.nutrition.sodium }}mg</text>
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

    <!-- 底部占位 -->
    <view style="height: 40px;"></view>
  </view>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import { getFoodDetail, toggleCollection, isCollected } from './foodDataService.js'

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
      carbohydrate: 0,
      fiber: 0,
      vitaminA: 0,
      vitaminB1: 0,
      vitaminB2: 0,
      vitaminC: 0,
      vitaminE: 0,
      calcium: 0,
      iron: 0,
      sodium: 0,
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
        isCollectedState.value = isCollected(detail.id)
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
      case 'carbohydrate':
        value = nutrition.carbohydrate
        referenceValue = 300 // 成人每日推荐碳水摄入量约300g
        break
    }
    
    const percent = Math.min((value / referenceValue) * 100 * 100, 100) // 放大显示效果
    return `${percent}%`
  }

  // ========== 收藏功能 ==========
  const handleToggleCollect = () => {
    const newState = toggleCollection(foodData.value.id)
    isCollectedState.value = newState
    
    uni.showToast({
      title: newState ? '已添加到收藏' : '已取消收藏',
      icon: 'none',
      duration: 1500
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
    display: flex;
    align-items: flex-start;
    background: white;
    padding: 20px 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(79, 161, 242, 0.08);
  }

  .food-cover {
    width: 120px;
    height: 120px;
    border-radius: 12px;
    margin-right: 16px;
    object-fit: cover;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
</style>