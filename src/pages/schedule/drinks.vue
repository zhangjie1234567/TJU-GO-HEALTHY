<template>
  <view class="container">
    <!-- 搜索框 -->
    <view class="search-box">
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input v-model="searchText" type="text" class="search-input" placeholder="搜索饮品..."/>
        <text v-if="searchText" class="menu-icon" @click="searchText = ''">✕</text>
      </view>
    </view>

    <!-- 筛选标签 -->
    <view class="filter-bar">
      <view class="filter-tag" :class="{ active: filterType === 'all' }" @click="filterType = 'all'">全部</view>      <view class="filter-tag" :class="{ active: filterType === 'recommend' }" @click="filterType = 'recommend'">推荐</view>      <view class="filter-tag" :class="{ active: filterType === 'low' }" @click="filterType = 'low'">低卡</view>
      <view class="filter-tag" :class="{ active: filterType === 'coffee' }" @click="filterType = 'coffee'">含咖啡因</view>
      <view class="filter-tag" :class="{ active: filterType === 'cold' }" @click="filterType = 'cold'">冷饮</view>
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="empty-state">
      <text class="empty-icon">⏳</text>
      <text class="empty-text">加载饮品中...</text>
    </view>

    <!-- 饮品列表 -->
    <view v-else class="drinks-grid">
      <view v-for="(item, index) in filteredDrinks" :key="index" class="drink-card" @click="goDetail(item)">
        <view class="card-image-wrapper">
          <image class="card-image" :src="item.image" mode="aspectFill"></image>
          <view class="card-badge" v-if="item.badge">{{ item.badge }}</view>
        </view>
        
        <view class="card-content">
          <view class="card-header">
            <text class="drink-name">{{ item.name }}</text>
            <text class="fav-icon" @click.stop="toggleFavorite(item.id)" 
                  :class="{ collected: isFavorited(item.id) }">{{ isFavorited(item.id) ? '★' : '☆' }}</text>
          </view>

          <text class="card-category">{{ item.category }}</text>
          
          <view class="card-stats">
            <view class="stat-item">
              <text class="stat-label">热量</text>
              <text class="stat-value">{{ item.cal }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">咖啡因</text>
              <text class="stat-value">{{ item.caffeine }}</text>
            </view>
          </view>

          <text class="card-desc">{{ item.desc }}</text>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredDrinks.length === 0" class="empty-state">
        <text class="empty-icon">🔍</text>
        <text class="empty-text">未找到匹配的饮品</text>
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

const drinks = ref([])

// 从后端获取饮品列表
const loadDrinks = async () => {
  loading.value = true
  try {
    // 使用本地mock数据（不需要后端）
    const mockData = [
      {
        id: 1,
        name: '经典绿茶',
        category: '茶类',
        cal: '0-2 千卡',
        caffeine: '25',
        badge: '推荐',
        image: 'https://via.placeholder.com/200x150/4FA1F2/FFFFFF?text=绿茶'
      },
      {
        id: 2,
        name: '咖啡拿铁',
        category: '咖啡',
        cal: '100-150 千卡',
        caffeine: '75',
        badge: '热饮',
        image: 'https://via.placeholder.com/200x150/8B4513/FFFFFF?text=咖啡'
      },
      {
        id: 3,
        name: '新鲜果汁',
        category: '果汁',
        cal: '80-120 千卡',
        caffeine: '0',
        badge: '',
        image: 'https://via.placeholder.com/200x150/FF6347/FFFFFF?text=果汁'
      },
      {
        id: 4,
        name: '冰淇淋奶茶',
        category: '奶茶',
        cal: '150-200 千卡',
        caffeine: '35',
        badge: '冷饮',
        image: 'https://via.placeholder.com/200x150/FFB6C1/FFFFFF?text=奶茶'
      }
    ]
    
    drinks.value = mockData
  } catch (error) {
    console.error('饮品加载异常:', error)
  } finally {
    loading.value = false
  }
}

const filteredDrinks = computed(() => {
  let result = drinks.value
  
  // 搜索过滤
  if (searchText.value) {
    result = result.filter(item =>
      item.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
      item.category.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }
  
  // 类型过滤
  if (filterType.value === 'recommend') {
    result = result.filter(item => item.badge === '推荐')
  } else if (filterType.value === 'low') {
    result = result.filter(item => item.cal.includes('0-') || item.cal.includes('2-') || item.cal.includes('30-') || item.cal.includes('60-'))
  } else if (filterType.value === 'coffee') {
    result = result.filter(item => parseInt(item.caffeine) > 50)
  } else if (filterType.value === 'cold') {
    result = result.filter(item => item.badge === '冷饮')
  }
  
  return result
})

// 加载收藏和饮品列表
onMounted(() => {
  try {
    const saved = uni.getStorageSync('drink_favorites')
    if (saved) {
      favorites.value = saved
    }
  } catch (e) {
    console.error('加载收藏失败', e)
  }
  
  // 加载饮品列表
  loadDrinks()
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
    uni.setStorageSync('drink_favorites', favorites.value)
    uni.showToast({ title: isFavorited(id) ? '已收藏' : '已取消收藏', icon: 'success', duration: 1500 })
  } catch (e) {
    console.error('保存收藏失败', e)
  }
}

// 检查是否收藏
const isFavorited = (id) => {
  return favorites.value.includes(id)
}

// 跳转详情页
const goDetail = (item) => {
  uni.navigateTo({
    url: `/pages/schedule/drinks_detail?id=${item.id}&name=${item.name}`,
    success: () => {
      uni.$emit('drink-data', item)
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

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background: white;
  box-shadow: 0 2rpx 8rpx rgba(79, 161, 242, 0.1);

  .back-btn {
    font-size: 32rpx;
    color: $main-blue;
    font-weight: 600;
  }

  .page-title {
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

.drinks-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  padding: 0 16rpx;

  .drink-card {
    background: white;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);
    transition: all 0.2s ease;

    &:active {
      transform: translateY(-4rpx);
      box-shadow: 0 8rpx 16rpx rgba(79, 161, 242, 0.12);
    }

    .card-image-wrapper {
      position: relative;
      overflow: hidden;

      .card-image {
        width: 100%;
        height: 180rpx;
        display: block;
      }

      .card-badge {
        position: absolute;
        top: 8rpx;
        right: 8rpx;
        background: rgba(255, 107, 107, 0.9);
        color: white;
        padding: 4rpx 10rpx;
        border-radius: 12rpx;
        font-size: 20rpx;
        font-weight: 600;
      }
    }

    .card-content {
      padding: 14rpx;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8rpx;

      .drink-name {
        font-size: 26rpx;
        font-weight: 600;
        color: #333;
        flex: 1;
      }

      .fav-icon {
        font-size: 24rpx;
        color: #ddd;
        margin-left: 8rpx;
        transition: all 0.2s ease;

        &.collected {
          color: #FFB347;
          transform: scale(1.2);
        }
      }
    }

    .card-category {
      display: block;
      font-size: 20rpx;
      color: $main-blue;
      margin-bottom: 6rpx;
      font-weight: 500;
    }

    .card-stats {
      display: flex;
      gap: 8rpx;
      margin-bottom: 6rpx;

      .stat-item {
        flex: 1;
        background: rgba(79, 161, 242, 0.06);
        padding: 6rpx 8rpx;
        border-radius: 8rpx;
        text-align: center;

        .stat-label {
          display: block;
          font-size: 18rpx;
          color: #999;
        }

        .stat-value {
          display: block;
          font-size: 20rpx;
          font-weight: 600;
          color: $main-blue;
        }
      }
    }

    .card-desc {
      display: block;
      font-size: 20rpx;
      color: #999;
      line-height: 1.4;
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