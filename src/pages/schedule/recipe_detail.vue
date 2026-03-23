<template>
  <view class="container">
    <!-- 食谱图片 -->
    <view class="image-section">
      <image class="recipe-image" :src="recipe.image" mode="aspectFill"></image>
      <view class="badge" v-if="recipe.badge">{{ recipe.badge }}</view>
    </view>

    <!-- 基本信息卡片 -->
    <view class="info-card">
      <view class="info-header">
        <text class="recipe-title">{{ recipe.name }}</text>
        <text class="difficulty-tag" :class="'diff-' + recipe.difficulty">{{ getDifficultyLabel(recipe.difficulty) }}</text>
      </view>

      <view class="stats-row">
        <view class="stat-box">
          <text class="stat-icon">⏱️</text>
          <text class="stat-label">耗时</text>
          <text class="stat-value">{{ recipe.time }}分</text>
        </view>
        <view class="stat-box">
          <text class="stat-icon">🔥</text>
          <text class="stat-label">热量</text>
          <text class="stat-value">{{ recipe.cal }}kcal</text>
        </view>
        <view class="stat-box">
          <text class="stat-icon">👥</text>
          <text class="stat-label">份量</text>
          <text class="stat-value">1人份</text>
        </view>
        <view class="stat-box">
          <text class="stat-icon">⭐</text>
          <text class="stat-label">难度</text>
          <text class="stat-value">{{ recipe.difficulty }}</text>
        </view>
      </view>

      <text class="recipe-desc">{{ recipe.desc }}</text>
    </view>

    <!-- 详细内容 -->
    <view class="detail-sections">
      <!-- 所需食材 -->
      <view class="section">
        <text class="section-title">🛒 所需食材</text>
        <view class="ingredients-list">
          <view class="ingredient-item" v-for="(ingredient, index) in recipe.ingredients" :key="index">
            <text class="ing-name">{{ ingredient.name }}</text>
            <text class="ing-amount">{{ ingredient.amount }}</text>
          </view>
        </view>
      </view>

      <!-- 详细步骤 -->
      <view class="section">
        <text class="section-title">👨‍🍳 烹饪步骤</text>
        <view class="steps-list">
          <view class="step-item" v-for="(step, index) in recipe.steps" :key="index">
            <view class="step-number">{{ index + 1 }}</view>
            <text class="step-text">{{ step }}</text>
          </view>
        </view>
      </view>

      <!-- 营养信息 -->
      <view class="section">
        <text class="section-title">🥗 营养信息</text>
        <view class="nutrition-grid">
          <view v-for="(item, index) in recipe.nutrition" :key="index" class="nutrition-item">
            <text class="nut-label">{{ item.label }}</text>
            <text class="nut-value">{{ item.value }}</text>
          </view>
        </view>
      </view>

      <!-- 健康小贴士 -->
      <view class="section">
        <text class="section-title">💡 健康小贴士</text>
        <view class="tips-box">
          <view v-for="(tip, index) in recipe.tips" :key="index" class="tip-item">
            <text class="tip-number">{{ index + 1 }}</text>
            <text class="tip-text">{{ tip }}</text>
          </view>
        </view>
      </view>

      <!-- 食材替换建议 -->
      <view class="section">
        <text class="section-title">🔄 食材替换建议</text>
        <view class="substitutes-box">
          <view v-for="(item, index) in recipe.substitutes" :key="index" class="substitute-item">
            <text class="sub-original">{{ item.original }}</text>
            <text class="sub-arrow">→</text>
            <text class="sub-alternative">{{ item.alternative }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="action-bar">
      <button class="action-btn favorite-btn" @click="toggleFavorite(recipe.id)">
        {{ isFavorited(recipe.id) ? '已收藏' : '+ 收藏' }}
      </button>
      <button class="action-btn share-btn">📤 分享</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { apiRequest } from '../../utils/request'

const favorites = ref([])
const loading = ref(false)
let recipeId = null

const defaultRecipe = {
  id: 1,
  name: '西葫芦炒牛肉',
  desc: '这是一道低脂高蛋白的经典菜肴，食材简单，烹饪快速，营养丰富。西葫芦低卡且富含纤维，牛肉提供优质蛋白质，是健身和减脂人士的理想选择。',
  difficulty: 'easy',
  time: 15,
  cal: 180,
  badge: '推荐',
  image: 'https://via.placeholder.com/600x300/FF6B6B/FFFFFF?text=西葫芦炒牛肉',
  ingredients: [
    { name: '牛肉（里脊）', amount: '200克' },
    { name: '西葫芦', amount: '1根（约300g）' },
    { name: '大蒜', amount: '3瓣' },
    { name: '生抽', amount: '15ml' },
    { name: '蚝油', amount: '5g' },
    { name: '玉米淀粉', amount: '15g' },
    { name: '食用油', amount: '15ml' },
    { name: '盐', amount: '2g' }
  ],
  steps: [
    '牛肉切薄片，用盐、黑胡椒及一汤匙油腌制15分钟',
    '西葫芦洗净切成厚片，蒜切末',
    '热锅下油，放入牛肉快速翻炒至半熟取出',
    '锅中重新下油，放入西葫芦片炒至半透明',
    '加入蒜末炒香，返回牛肉翻炒',
    '调入生抽、蚝油调味，大火快速翻炒30秒即可出锅'
  ],
  nutrition: [
    { label: '蛋白质', value: '25g' },
    { label: '脂肪', value: '8g' },
    { label: '碳水化合物', value: '6g' },
    { label: '纤维素', value: '1.5g' },
    { label: '钙', value: '35mg' },
    { label: '铁', value: '2.8mg' }
  ],
  tips: [
    '牛肉不要炒太久，否则容易变硬，快手炒菜讲究快火快炒',
    '西葫芦最好切片而非切块，这样受热更均匀，口感更好',
    '可根据个人口味调整生抽和蚝油的比例，追求鲜香口感',
    '如果喜欢脆的口感，西葫芦不要炒太久'
  ],
  substitutes: [
    { original: '西葫芦', alternative: '黄瓜、豆角、青笋' },
    { original: '牛肉', alternative: '鸡肉、猪肉、虾仁' },
    { original: '生抽', alternative: '酱油、豉油' },
    { original: '蚝油', alternative: '酱油、XO酱' }
  ]
}

const recipe = ref({ ...defaultRecipe })

const normalizeDifficulty = (difficulty) => {
  const map = {
    easy: 'easy',
    medium: 'medium',
    hard: 'hard',
    简单: 'easy',
    中等: 'medium',
    困难: 'hard'
  }
  return map[difficulty] || 'easy'
}

const parseNumber = (value, fallback = 0) => {
  const text = String(value || '')
  const match = text.match(/\d+/)
  return match ? Number(match[0]) : fallback
}

const normalizeRecipeDetail = (payload = {}) => {
  return {
    id: payload.id || defaultRecipe.id,
    name: payload.name || defaultRecipe.name,
    desc: payload.desc || defaultRecipe.desc,
    difficulty: normalizeDifficulty(payload.difficulty),
    time: Number(payload.time) || parseNumber(payload.duration, defaultRecipe.time),
    cal: Number(payload.cal) || parseNumber(payload.cal, defaultRecipe.cal),
    badge: payload.badge || '',
    image: payload.image || defaultRecipe.image,
    ingredients: Array.isArray(payload.ingredients) ? payload.ingredients : defaultRecipe.ingredients,
    steps: Array.isArray(payload.steps) ? payload.steps : defaultRecipe.steps,
    nutrition: Array.isArray(payload.nutrition) ? payload.nutrition : defaultRecipe.nutrition,
    tips: Array.isArray(payload.tips) ? payload.tips : defaultRecipe.tips,
    substitutes: Array.isArray(payload.substitutes) ? payload.substitutes : defaultRecipe.substitutes
  }
}

const loadRecipeDetail = async () => {
  if (!recipeId) {
    recipe.value = { ...defaultRecipe }
    return
  }

  loading.value = true
  try {
    const data = await apiRequest({
      url: `/api/recipes/${recipeId}`,
      method: 'GET'
    })
    const root = data?.recipe || data
    recipe.value = normalizeRecipeDetail(root)
  } catch (error) {
    console.error('食谱详情加载异常:', error)
    recipe.value = { ...defaultRecipe }
    uni.showToast({ title: '接口未就绪，已显示示例数据', icon: 'none', duration: 2000 })
  } finally {
    loading.value = false
  }
}

// 加载收藏
onMounted(() => {
  try {
    const saved = uni.getStorageSync('recipe_favorites')
    if (saved) {
      favorites.value = saved
    }
  } catch (e) {
    console.error('加载收藏失败', e)
  }
})

onLoad((options) => {
  recipeId = options?.id ? Number(options.id) : null
  loadRecipeDetail()
})

// 切换收藏
const toggleFavorite = (id) => {
  const index = favorites.value.indexOf(id)
  if (index > -1) {
    favorites.value.splice(index, 1)
  } else {
    favorites.value.push(id)
  }
  
  try {
    uni.setStorageSync('recipe_favorites', favorites.value)
  } catch (e) {
    console.error('保存收藏失败', e)
  }
}

// 难度标签映射
const getDifficultyLabel = (difficulty) => {
  const map = {
    'easy': '简单',
    'medium': '中等',
    'hard': '困难'
  }
  return map[difficulty] || difficulty
}

// 检查是否收藏
const isFavorited = (id) => {
  return favorites.value.includes(id)
}

const goBack = () => uni.navigateBack()
</script>

<style lang="scss" scoped>
$main-blue: #4FA1F2;
$light-blue: #80D0FF;
$bg-blue: #E3F2FD;

.container {
  background: linear-gradient(135deg, $bg-blue 0%, #F0F9FF 100%);
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.image-section {
  position: relative;
  width: 100%;
  height: 300rpx;
  overflow: hidden;

  .recipe-image {
    width: 100%;
    height: 100%;
  }

  .badge {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    background: rgba(255, 107, 107, 0.95);
    color: white;
    padding: 8rpx 16rpx;
    border-radius: 16rpx;
    font-size: 24rpx;
    font-weight: 600;
  }
}

.info-card {
  background: white;
  margin: -30rpx 16rpx 0;
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(79, 161, 242, 0.1);
  position: relative;
  z-index: 1;

  .info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .recipe-title {
      font-size: 32rpx;
      font-weight: 700;
      color: #333;
    }

    .difficulty-tag {
      padding: 6rpx 12rpx;
      border-radius: 12rpx;
      font-size: 20rpx;
      font-weight: 600;
      color: white;

      &.diff-easy {
        background: rgba(76, 203, 119, 0.9);
      }

      &.diff-medium {
        background: rgba(255, 195, 0, 0.9);
      }

      &.diff-hard {
        background: rgba(244, 67, 54, 0.9);
      }
    }
  }

  .stats-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 8rpx;
    margin-bottom: 16rpx;

    .stat-box {
      background: rgba(79, 161, 242, 0.06);
      border-radius: 12rpx;
      padding: 12rpx 8rpx;
      text-align: center;

      .stat-icon {
        display: block;
        font-size: 24rpx;
        margin-bottom: 4rpx;
      }

      .stat-label {
        display: block;
        font-size: 16rpx;
        color: #999;
        margin-bottom: 2rpx;
      }

      .stat-value {
        display: block;
        font-size: 18rpx;
        font-weight: 700;
        color: $main-blue;
      }
    }
  }

  .recipe-desc {
    font-size: 24rpx;
    color: #666;
    line-height: 1.6;
  }
}

.detail-sections {
  padding: 24rpx;
}

.section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);

  .section-title {
    display: block;
    font-size: 28rpx;
    font-weight: 700;
    color: #333;
    margin-bottom: 16rpx;
    padding-bottom: 12rpx;
    border-bottom: 3rpx solid $main-blue;
  }

  .ingredients-list {
    .ingredient-item {
      display: flex;
      justify-content: space-between;
      padding: 12rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .ing-name {
        font-size: 24rpx;
        color: #666;
      }

      .ing-amount {
        font-size: 24rpx;
        color: $main-blue;
        font-weight: 600;
      }
    }
  }

  .steps-list {
    .step-item {
      display: flex;
      gap: 16rpx;
      margin-bottom: 16rpx;

      .step-number {
        background: $main-blue;
        color: white;
        width: 40rpx;
        height: 40rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 22rpx;
        flex-shrink: 0;
      }

      .step-text {
        font-size: 24rpx;
        color: #666;
        line-height: 1.6;
      }
    }
  }

  .nutrition-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12rpx;

    .nutrition-item {
      background: rgba(79, 161, 242, 0.06);
      padding: 12rpx;
      border-radius: 12rpx;
      display: flex;
      justify-content: space-between;

      .nut-label {
        font-size: 22rpx;
        color: #666;
      }

      .nut-value {
        font-size: 22rpx;
        font-weight: 700;
        color: $main-blue;
      }
    }
  }

  .tips-box {
    .tip-item {
      display: flex;
      gap: 12rpx;
      margin-bottom: 12rpx;

      .tip-number {
        background: rgba(79, 161, 242, 0.1);
        color: $main-blue;
        width: 32rpx;
        height: 32rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 18rpx;
        flex-shrink: 0;
      }

      .tip-text {
        font-size: 22rpx;
        color: #666;
        line-height: 1.6;
      }
    }
  }

  .substitutes-box {
    .substitute-item {
      display: flex;
      align-items: center;
      gap: 12rpx;
      padding: 12rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .sub-original {
        flex: 1;
        font-size: 22rpx;
        color: #999;
      }

      .sub-arrow {
        font-size: 20rpx;
        color: $main-blue;
      }

      .sub-alternative {
        flex: 1;
        font-size: 22rpx;
        color: $main-blue;
        font-weight: 600;
      }
    }
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12rpx;
  padding: 12rpx 16rpx;
  background: white;
  border-top: 1rpx solid #f0f0f0;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.08);

  .action-btn {
    flex: 1;
    height: 70rpx;
    border: none;
    border-radius: 12rpx;
    font-size: 26rpx;
    font-weight: 600;

    &.favorite-btn {
      background: $main-blue;
      color: white;
    }

    &.share-btn {
      background: white;
      color: $main-blue;
      border: 2rpx solid $main-blue;
    }
  }
}
</style>