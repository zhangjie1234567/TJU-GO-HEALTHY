<template>
  <view class="container">

    <!-- 搜索框 -->
    <view class="search-box">
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input v-model="searchText" type="text" class="search-input" placeholder="搜索食材或菜名..."/>
        <text v-if="searchText" class="menu-icon" @click="searchText = ''">✕</text>
      </view>
    </view>

    <!-- 筛选标签 -->
    <view class="filter-bar">
      <view class="filter-tag" :class="{ active: filterType === 'all' }" @click="filterType = 'all'">全部</view>
      <view class="filter-tag" :class="{ active: filterType === 'low' }" @click="filterType = 'low'">低卡</view>
      <view class="filter-tag" :class="{ active: filterType === 'quick' }" @click="filterType = 'quick'">快手菜</view>
      <view class="filter-tag" :class="{ active: filterType === 'protein' }" @click="filterType = 'protein'">高蛋白</view>
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="empty-state">
      <text class="empty-icon">⏳</text>
      <text class="empty-text">加载食谱中...</text>
    </view>

    <!-- 食谱网格 -->
    <view v-else class="recipes-grid">
      <view v-for="(item, index) in filteredRecipes" :key="index" class="recipe-card" @click="goDetail(item)">
        <view class="card-image-wrapper">
          <image class="card-image" :src="item.image" mode="aspectFill"></image>
          <view class="card-badge" v-if="item.badge">{{ item.badge }}</view>
          <view class="difficulty" :class="'diff-' + getDifficultyKey(item.difficulty)">{{ item.difficulty }}</view>
        </view>
        
        <view class="card-content">
          <text class="recipe-name">{{ item.name }}</text>
          <text class="recipe-desc">{{ item.desc }}</text>
          
          <view class="recipe-stats">
            <view class="stat">
              <text class="stat-icon">⏱️</text>
              <text class="stat-text">{{ item.time }}分钟</text>
            </view>
            <view class="stat">
              <text class="stat-icon">🔥</text>
              <text class="stat-text">{{ item.cal }}千卡</text>
            </view>
          </view>

          <view class="card-footer">
            <view class="fav-icon-wrapper" @click="toggleFavorite(item.id)">
              <text class="fav-icon" :class="{ collected: isFavorited(item.id) }">{{ isFavorited(item.id) ? '★' : '☆' }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredRecipes.length === 0" class="empty-state">
        <text class="empty-icon">🍽️</text>
        <text class="empty-text">未找到匹配的食谱</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiRequest } from '../../utils/request'

const searchText = ref('')
const filterType = ref('all')
const favorites = ref([])
const loading = ref(false)

const recipes = ref([])

const mockRecipes = [
  {
    id: 1,
    name: '三文鱼沙拉',
    category: '鱼类',
    cal: 280,
    protein: '25g',
    time: 12,
    difficulty: '简单',
    badge: '推荐',
    desc: '高蛋白低脂，适合减脂期。',
    image: 'https://via.placeholder.com/200x150/FF6B6B/FFFFFF?text=三文鱼'
  },
  {
    id: 2,
    name: '番茄鸡蛋面',
    category: '面食',
    cal: 350,
    protein: '12g',
    time: 15,
    difficulty: '简单',
    badge: '快手菜',
    desc: '做法简单，适合忙碌时段。',
    image: 'https://via.placeholder.com/200x150/FFA500/FFFFFF?text=汤面'
  },
  {
    id: 3,
    name: '健身鸡胸肉',
    category: '禽肉',
    cal: 165,
    protein: '31g',
    time: 18,
    difficulty: '中等',
    badge: '高蛋白',
    desc: '优质蛋白来源，训练后推荐。',
    image: 'https://via.placeholder.com/200x150/DAA520/FFFFFF?text=鸡肉'
  },
  {
    id: 4,
    name: '花椰菜炒饭',
    category: '米饭',
    cal: 250,
    protein: '8g',
    time: 14,
    difficulty: '简单',
    badge: '低卡',
    desc: '低碳水替代主食方案。',
    image: 'https://via.placeholder.com/200x150/90EE90/FFFFFF?text=炒饭'
  }
]

const parseFirstNumber = (value, defaultValue = 0) => {
  const text = String(value || '')
  const match = text.match(/\d+/)
  return match ? Number(match[0]) : defaultValue
}

const normalizeDifficulty = (difficulty) => {
  const map = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
    beginner: '简单',
    advanced: '中等'
  }
  return map[difficulty] || difficulty || '简单'
}

const normalizeRecipe = (item = {}) => ({
  id: item.id,
  name: item.name || '未命名食谱',
  category: item.category || '未分类',
  cal: parseFirstNumber(item.cal, 0),
  protein: item.protein || '0g',
  time: Number(item.time) || parseFirstNumber(item.duration, 15),
  difficulty: normalizeDifficulty(item.difficulty),
  badge: item.badge || '',
  desc: item.desc || '暂无描述',
  image: item.image || 'https://via.placeholder.com/200x150/4FA1F2/FFFFFF?text=食谱'
})

// 从后端获取食谱列表
const loadRecipes = async () => {
  loading.value = true
  try {
    const data = await apiRequest({
      url: '/api/recipes',
      method: 'GET',
      data: {
        page: 1,
        limit: 50
      }
    })

    const list = Array.isArray(data) ? data : []
    recipes.value = list.map(normalizeRecipe)
  } catch (error) {
    console.error('食谱加载异常:', error)
    recipes.value = mockRecipes.map(normalizeRecipe)
    uni.showToast({ title: '接口未就绪，已显示示例数据', icon: 'none', duration: 2000 })
  } finally {
    loading.value = false
  }
}

const filteredRecipes = computed(() => {
  let result = recipes.value
  
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    result = result.filter(item =>
      String(item.name || '').toLowerCase().includes(keyword) ||
      String(item.desc || '').toLowerCase().includes(keyword) ||
      String(item.category || '').toLowerCase().includes(keyword)
    )
  }
  
  if (filterType.value === 'low') {
    result = result.filter(item => Number(item.cal) <= 200)
  } else if (filterType.value === 'quick') {
    result = result.filter(item => item.time <= 15)
  } else if (filterType.value === 'protein') {
    result = result.filter(item => String(item.protein).toLowerCase().includes('g') && parseFirstNumber(item.protein, 0) >= 20)
  }
  
  return result
})

onMounted(() => {
  try {
    const saved = uni.getStorageSync('recipe_favorites')
    if (saved) {
      favorites.value = saved
    }
  } catch (e) {
    console.error('加载收藏失败', e)
  }
  
  // 加载食谱列表
  loadRecipes()
})

const toggleFavorite = (id) => {
  const index = favorites.value.indexOf(id)
  if (index > -1) {
    favorites.value.splice(index, 1)
  } else {
    favorites.value.push(id)
  }
  
  try {
    uni.setStorageSync('recipe_favorites', favorites.value)
    uni.showToast({ title: isFavorited(id) ? '已收藏' : '已取消收藏', icon: 'success', duration: 1500 })
  } catch (e) {
    console.error('保存收藏失败', e)
  }
}

const getDifficultyKey = (difficulty) => {
  const map = {
    '简单': 'easy',
    '中等': 'medium',
    '困难': 'hard'
  }
  return map[difficulty] || 'easy'
}

const isFavorited = (id) => {
  return favorites.value.includes(id)
}

const goDetail = (item) => {
  const safeName = encodeURIComponent(item.name || '')
  uni.navigateTo({
    url: `/pages/schedule/recipe_detail?id=${item.id}&name=${safeName}`
  })
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
  padding: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background: white;
  box-shadow: 0 2rpx 8rpx rgba(79, 161, 242, 0.1);

  .back-icon {
    font-size: 28rpx;
    color: $main-blue;
    font-weight: 600;
  }

  .page-title {
    flex: 1;
    text-align: center;
    font-size: 36rpx;
    font-weight: 700;
    color: #333;
  }
}

.search-box {
  margin-bottom: 30rpx;

  .search-bar {
    background: white;
    border-radius: 50rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    padding: 0 24rpx;
    gap: 12rpx;
    box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.15);

    .search-icon {
      font-size: 32rpx;
    }

    .search-input {
      flex: 1;
      font-size: 28rpx;
      background: transparent;
      border: none;
      outline: none;
    }

    .menu-icon {
      font-size: 28rpx;
      color: $main-blue;
      cursor: pointer;
    }
  }
}

.filter-bar {
  display: flex;
  gap: 12rpx;
  padding: 0 24rpx 20rpx;
  overflow-x: auto;

  .filter-tag {
    padding: 10rpx 20rpx;
    background: white;
    border: 2rpx solid #ddd;
    border-radius: 20rpx;
    font-size: 26rpx;
    color: #666;
    white-space: nowrap;
    transition: all 0.2s ease;

    &.active {
      background: $main-blue;
      color: white;
      border-color: $main-blue;
    }

    &:active {
      transform: scale(0.95);
    }
  }
}

.recipes-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16rpx;
  padding: 16rpx;

  .recipe-card {
    background: white;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);
    transition: all 0.2s ease;
    display: flex;
    height: 220rpx;

    &:active {
      transform: translateY(-2rpx);
      box-shadow: 0 8rpx 16rpx rgba(79, 161, 242, 0.12);
    }

    .card-image-wrapper {
      position: relative;
      width: 200rpx;
      flex-shrink: 0;

      .card-image {
        width: 100%;
        height: 100%;
      }

      .card-badge {
        position: absolute;
        top: 8rpx;
        left: 8rpx;
        background: rgba(255, 107, 107, 0.9);
        color: white;
        padding: 4rpx 10rpx;
        border-radius: 12rpx;
        font-size: 18rpx;
        font-weight: 600;
      }

      .difficulty {
        position: absolute;
        bottom: 8rpx;
        left: 8rpx;
        padding: 4rpx 10rpx;
        border-radius: 12rpx;
        font-size: 18rpx;
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

    .card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 14rpx;

      .recipe-name {
        font-size: 26rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 6rpx;
      }

      .recipe-desc {
        font-size: 20rpx;
        color: #999;
        margin-bottom: 12rpx;
      }

      .recipe-stats {
        display: flex;
        gap: 16rpx;
        margin-bottom: 10rpx;
        flex: 1;

        .stat {
          display: flex;
          align-items: center;
          gap: 4rpx;

          .stat-icon {
            font-size: 18rpx;
          }

          .stat-text {
            font-size: 18rpx;
            color: #999;
          }
        }
      }

      .card-footer {
        display: flex;
        justify-content: flex-end;

        .fav-icon-wrapper {
          padding: 8rpx;
          cursor: pointer;
        }

        .fav-icon {
          font-size: 24rpx;
          color: #ddd;
          transition: all 0.2s ease;

          &.collected {
            color: #FFB347;
            transform: scale(1.2);
          }
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 20rpx;

  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
    opacity: 0.3;
  }

  .empty-text {
    font-size: 28rpx;
    color: #999;
  }
}
</style>