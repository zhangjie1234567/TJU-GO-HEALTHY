<template>
  <view class="container">
    <!-- 标题栏 -->
    <view class="header">
      <text class="back-icon" @click="goBack">← 返回</text>
      <text class="page-title">🍽️ 热门食谱</text>
      <view style="width: 60rpx;"></view>
    </view>

    <!-- 搜索框 -->
    <view class="search-box">
      <text class="search-icon">🔍</text>
      <input v-model="searchText" type="text" class="search-input" placeholder="搜索食材或菜名..."/>
      <text v-if="searchText" class="clear-icon" @click="searchText = ''">✕</text>
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
          <view class="difficulty" :class="'diff-' + item.difficulty">{{ item.difficulty }}</view>
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
            <text class="fav-icon" @click.stop="toggleFavorite(item.id)" 
                  :class="{ collected: isFavorited(item.id) }">{{ isFavorited(item.id) ? '★' : '☆' }}</text>
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

const searchText = ref('')
const filterType = ref('all')
const favorites = ref([])
const loading = ref(false)

const recipes = ref([])

// 从后端获取食谱列表
const loadRecipes = async () => {
  loading.value = true
  try {
    const response = await uni.request({
      url: 'http://127.0.0.1:3000/api/recipes',
      method: 'GET'
    })

    if (response[1]?.data?.code === 0) {
      recipes.value = response[1].data.data || []
    } else {
      console.error('食谱加载失败:', response[1]?.data)
    }
  } catch (error) {
    console.error('食谱加载异常:', error)
  } finally {
    loading.value = false
  }
}

const filteredRecipes = computed(() => {
  let result = recipes.value
  
  if (searchText.value) {
    result = result.filter(item =>
      item.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }
  
  if (filterType.value === 'low') {
    result = result.filter(item => item.cal < 150)
  } else if (filterType.value === 'quick') {
    result = result.filter(item => item.time <= 15)
  } else if (filterType.value === 'protein') {
    result = result.filter(item => item.badge === '高蛋白')
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

const isFavorited = (id) => {
  return favorites.value.includes(id)
}

const goDetail = (item) => {
  uni.navigateTo({
    url: `/pages/schedule/recipe_detail?id=${item.id}&name=${item.name}`,
    success: () => {
      uni.$emit('recipe-data', item)
    }
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
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 24rpx;
  margin: 16rpx 24rpx;
  background: white;
  border-radius: 20rpx;
  border: 2rpx solid rgba(79, 161, 242, 0.2);

  .search-icon {
    font-size: 28rpx;
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    font-size: 28rpx;
    outline: none;
    border: none;
    background: transparent;
  }

  .clear-icon {
    font-size: 24rpx;
    color: #999;
    flex-shrink: 0;
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

        &.diff-简单 {
          background: rgba(76, 203, 119, 0.9);
        }

        &.diff-中等 {
          background: rgba(255, 195, 0, 0.9);
        }

        &.diff-困难 {
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