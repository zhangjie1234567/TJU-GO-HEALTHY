<template>
  <view class="food-detail-page">
    <!-- 顶部食物信息区 -->
    <view class="food-header">
      <image class="food-cover" :src="foodData.image || '/static/default.gif'" mode="aspectFill" />
      <view class="food-basic-info">
        <view class="food-name">{{ foodData.name || '未知食物' }}</view>
        <view class="food-category">{{ foodData.category || '未知种类' }}</view>
        <view class="food-calorie">
          <text class="calorie-value">{{ foodData.calorieValue || '0' }}</text>
          <text class="calorie-unit">kcal(千卡)/100g(克)</text>
        </view>
      </view>
    </view>


    <!-- 作用与特征区 -->
    <view class="food-features">
      <view class="feature-item">
        <text class="feature-label">作用：</text>
        <text class="feature-text">{{ foodData.effect || '暂无数据' }}</text>
      </view>
      <view class="feature-item">
        <text class="feature-label">特征：</text>
        <text class="feature-text">{{ foodData.feature || '暂无数据' }}</text>
      </view>
    </view>

    <!-- 营养成分表 -->
    <view class="nutrition-section">
      <view class="section-title">成分表（每100g）</view>
      <view class="nutrition-grid">
        <view class="nutrition-item" v-for="(item, index) in foodData.nutrition" :key="index">
          <text class="nutrition-name">{{ item.name }}</text>
          <text class="nutrition-value">{{ item.value }}</text>
        </view>
      </view>
    </view>

    <!-- 相关菜品 -->
    <view class="recipes-section">
      <view class="section-title">相关菜品</view>
      <view class="recipes-grid">
        <view class="recipe-card" v-for="(recipe, index) in relatedRecipes" :key="index">
          <image class="recipe-cover" :src="recipe.image || '/static/default.gif'" mode="aspectFill" />
          <view class="recipe-name">{{ recipe.name || '未知菜品' }}</view>
          <view class="collect-btn" @click.stop="toggleCollect(recipe)">
            <image :src="item.collected ? '/static/search_bar/收藏-active.png' : '/static/search_bar/收藏.png'"
              mode="aspectFit" class="collect-icon" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
  import {
    ref,
    reactive
  } from 'vue'
  import {
    onLoad
  } from '@dcloudio/uni-app'

  // ========== 核心：foodData 定义在这里 ==========
  // 1. 先定义默认模拟数据（无后端/无参数时兜底，不会报错）
  const foodData = reactive({
    name: '未知食物',
    category: '未知种类',
    calorieValue: '0',
    image: '/static/default.gif', // 改用GIF默认图
    effect: '暂无数据',
    feature: '暂无数据',
    // 营养成分默认值
    nutrition: [{
        name: '水分',
        value: '0.00g'
      },
      {
        name: '蛋白质',
        value: '0.00g'
      },
      {
        name: '脂肪',
        value: '0.00g'
      },
      {
        name: '碳水化合物',
        value: '0.00g'
      },
      {
        name: '膳食纤维',
        value: '0.00g'
      },
      {
        name: '维生素A',
        value: '0.00μgRAE'
      },
      {
        name: '维生素B1',
        value: '0.00mg'
      },
      {
        name: '维生素B2',
        value: '0.00mg'
      },
      {
        name: '维生素C',
        value: '0.00mg'
      },
      {
        name: '维生素E',
        value: '0.00mg'
      },
      {
        name: '钠',
        value: '0.0mg'
      },
      {
        name: '钙',
        value: '0mg'
      },
      {
        name: '铁',
        value: '0.0mg'
      },
      {
        name: '胆固醇',
        value: '0mg'
      }
    ],
    // 相关菜品默认值（带收藏状态）
    relatedRecipes: [{
        name: '食谱名称1',
        image: '/static/default.gif',
        collected: false
      },
      {
        name: '食谱名称2',
        image: '/static/default.gif',
        collected: false
      },
      {
        name: '食谱名称3',
        image: '/static/default.gif',
        collected: false
      },
      {
        name: '食谱名称4',
        image: '/static/default.gif',
        collected: false
      }
    ]
  })

  // 2. 页面加载时，读取上个页面传递的参数（覆盖默认值）
  onLoad((options) => {
    // 只有传递了foodData参数，才会替换默认值；无参数则用上面的默认值，不会报错
    if (options.foodData) {
      try {
        const data = JSON.parse(options.foodData)
        // 合并传递的参数到foodData（只替换有值的字段，无值的保留默认）
        Object.keys(data).forEach(key => {
          if (data[key] !== undefined && data[key] !== null) {
            foodData[key] = data[key]
          }
        })
        // 确保相关菜品有收藏状态（避免报错）
        if (Array.isArray(foodData.relatedRecipes)) {
          foodData.relatedRecipes.forEach(recipe => {
            if (recipe.collected === undefined) {
              recipe.collected = false
            }
          })
        }
      } catch (e) {
        console.log('参数解析失败，使用默认数据：', e)
        // 解析失败也不会报错，继续用默认值
      }
    }
  })

  // 切换收藏状态（本地临时）
  const toggleCollect = (recipe) => {
    recipe.collected = !recipe.collected
    uni.showToast({
      title: recipe.collected ? '已收藏' : '已取消收藏',
      icon: 'none'
    })
  }
</script>

<style scoped>
  .food-detail-page {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-bottom: 20px;
  }

  /* 顶部食物信息区 */
  .food-header {
    display: flex;
    align-items: center;
    background-color: #fff;
    padding: 16px;
    margin-bottom: 12px;
  }

  .food-cover {
    width: 100px;
    height: 100px;
    border-radius: 8px;
    margin-right: 16px;
  }

  .food-basic-info {
    flex: 1;
  }

  .food-name {
    font-size: 20px;
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
  }

  .food-category {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }

  .food-calorie {
    display: flex;
    align-items: baseline;
  }

  .calorie-value {
    font-size: 24px;
    font-weight: 600;
    color: #ff6b6b;
    margin-right: 4px;
  }

  .calorie-unit {
    font-size: 14px;
    color: #999;
  }

  /* 作用与特征区 */
  .food-features {
    background-color: #fff;
    padding: 16px;
    margin-bottom: 12px;
  }

  .feature-item {
    margin-bottom: 8px;
  }

  .feature-item:last-child {
    margin-bottom: 0;
  }

  .feature-label {
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }

  .feature-text {
    font-size: 14px;
    color: #666;
  }

  /* 营养成分表 */
  .nutrition-section {
    background-color: #fff;
    padding: 16px;
    margin-bottom: 12px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    margin-bottom: 12px;
  }

  .nutrition-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 16px;
  }

  .nutrition-item {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
  }

  .nutrition-name {
    color: #666;
  }

  .nutrition-value {
    color: #333;
  }

  /* 相关菜品区 */
  .recipes-section {
    background-color: #fff;
    padding: 16px;
  }

  .recipes-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .recipe-card {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .recipe-cover {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin-bottom: 8px;
  }

  .recipe-name {
    font-size: 14px;
    color: #333;
    margin-bottom: 8px;
  }

  /* 收藏按钮 */
  .collect-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0px 0px;
    border-radius: 6px;
  }

  .collect-icon {
    width: 70px;
    height: 80px;
  }
</style>