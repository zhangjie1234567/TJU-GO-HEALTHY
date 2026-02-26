<template>
  <view class="container">
    <!-- 搜索框 -->
    <view class="search-box">
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input v-model="searchText" type="text" class="search-input" placeholder="搜索课程..."/>
        <text v-if="searchText" class="menu-icon" @click="searchText = ''">✕</text>
      </view>
    </view>

    <!-- 筛选标签 -->
    <view class="filter-bar">
      <view class="filter-tag" :class="{ active: filterType === 'all' }" @click="filterType = 'all'">全部</view>
      <view class="filter-tag" :class="{ active: filterType === 'beginner' }" @click="filterType = 'beginner'">入门级</view>
      <view class="filter-tag" :class="{ active: filterType === 'advanced' }" @click="filterType = 'advanced'">进阶级</view>
      <view class="filter-tag" :class="{ active: filterType === 'free' }" @click="filterType = 'free'">免费</view>
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="empty-state">
      <text class="empty-icon">⏳</text>
      <text class="empty-text">加载课程中...</text>
    </view>

    <!-- 课程列表 -->
    <view v-else class="courses-grid">
      <view v-for="(item, index) in filteredCourses" :key="index" class="course-card" @click="goToDetail(item)">
        <view class="card-image-wrapper">
          <image class="card-image" :src="item.image" mode="aspectFill"></image>
          <view class="card-badge" v-if="item.badge">{{ item.badge }}</view>
          <view class="level-tag" :class="'level-' + item.level">{{ item.level }}</view>
        </view>

        <view class="card-content">
          <text class="course-title">{{ item.title }}</text>
          
          <view class="course-meta">
            <text class="meta-item">
              <text class="meta-icon">🏫</text>
              <text class="meta-text">{{ item.platform }}</text>
            </text>
            <text class="meta-item">
              <text class="meta-icon">👨‍🏫</text>
              <text class="meta-text">{{ item.instructor }}</text>
            </text>
          </view>

          <text class="course-desc">{{ item.desc }}</text>

          <view class="course-stats">
            <view class="stat">
              <text class="stat-icon">⭐</text>
              <text class="stat-value">{{ item.rating }}</text>
            </view>
            <view class="stat">
              <text class="stat-icon">👥</text>
              <text class="stat-value">{{ item.students }}</text>
            </view>
            <view class="stat">
              <text class="stat-icon">🎯</text>
              <text class="stat-value">{{ item.difficulty }}</text>
            </view>
          </view>

          <view class="card-footer">
            <text class="price" :class="{ free: item.price === '免费' }">{{ item.price }}</text>
            <view class="fav-icon-wrapper" @click="toggleFavorite(item.id)">
              <text class="fav-icon" :class="{ collected: isFavorited(item.id) }">{{ isFavorited(item.id) ? '★' : '☆' }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="filteredCourses.length === 0" class="empty-state">
        <text class="empty-icon">📚</text>
        <text class="empty-text">未找到匹配的课程</text>
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

const courses = ref([])

// 从后端获取课程列表
const loadCourses = async () => {
  loading.value = true
  try {
    // 使用本地mock数据（不需要后端）
    const mockData = [
      {
        id: 1,
        title: '7天瑜伽入门',
        name: '7天瑜伽入门',
        platform: '瑜伽平台',
        instructor: '瑜伽教练',
        category: '瑜伽',
        duration: '7天',
        difficulty: '简单',
        level: 'beginner',
        badge: '热门',
        price: '199元',
        rating: '4.8',
        students: '2.3万',
        desc: '零基础瑜伽课程，适合初学者',
        image: 'https://via.placeholder.com/200x150/9370DB/FFFFFF?text=瑜伽'
      },
      {
        id: 2,
        title: '30分钟HIIT训练',
        name: '30分钟HIIT训练',
        platform: '健身平台',
        instructor: '健身教练',
        category: '有氧',
        duration: '30分钟',
        difficulty: '中等',
        level: 'advanced',
        badge: '高效',
        price: '99元',
        rating: '4.9',
        students: '5.2万',
        desc: '高效燃脂训练计划',
        image: 'https://via.placeholder.com/200x150/FF4500/FFFFFF?text=HIIT'
      },
      {
        id: 3,
        title: '居家腹肌养成',
        name: '居家腹肌养成',
        platform: '健身平台',
        instructor: '力量教练',
        category: '力量',
        duration: '15天',
        difficulty: '简单',
        level: 'beginner',
        badge: '新课',
        price: '免费',
        rating: '4.7',
        students: '3.1万',
        desc: '在家也能练腹肌',
        image: 'https://via.placeholder.com/200x150/20B2AA/FFFFFF?text=腹肌'
      },
      {
        id: 4,
        title: '瘦腿5分钟破圈',
        name: '瘦腿5分钟破圈',
        platform: '塑形平台',
        instructor: '塑形师',
        category: '塑形',
        duration: '5分钟',
        difficulty: '简单',
        level: 'beginner',
        badge: '推荐',
        price: '59元',
        rating: '4.6',
        students: '4.8万',
        desc: '快速瘦腿方法',
        image: 'https://via.placeholder.com/200x150/FF69B4/FFFFFF?text=瘦腿'
      }
    ]
    
    courses.value = mockData
  } catch (error) {
    console.error('课程加载异常:', error)
  } finally {
    loading.value = false
  }
}

const filteredCourses = computed(() => {
  let result = courses.value
  
  // 搜索过滤
  if (searchText.value) {
    result = result.filter(item =>
      item.title.includes(searchText.value) ||
      item.platform.includes(searchText.value) ||
      item.instructor.includes(searchText.value)
    )
  }
  
  // 难度过滤
  if (filterType.value === 'beginner') {
    result = result.filter(item => item.level === 'beginner')
  } else if (filterType.value === 'advanced') {
    result = result.filter(item => item.level === 'advanced')
  } else if (filterType.value === 'free') {
    result = result.filter(item => item.price === '免费')
  }
  
  return result
})

// 加载收藏和课程列表
onMounted(() => {
  try {
    const saved = uni.getStorageSync('course_favorites')
    if (saved) {
      favorites.value = saved
    }
  } catch (e) {
    console.error('加载收藏失败', e)
  }
  
  // 加载课程列表
  loadCourses()
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
    uni.setStorageSync('course_favorites', favorites.value)
    uni.showToast({ title: isFavorited(id) ? '已收藏' : '已取消收藏', icon: 'success', duration: 1500 })
  } catch (e) {
    console.error('保存收藏失败', e)
  }
}

// 检查是否收藏
const isFavorited = (id) => {
  return favorites.value.includes(id)
}

const goToDetail = (item) => {
  uni.navigateTo({
    url: `/pages/schedule/courses_detail?id=${item.id}&title=${item.title}`,
    success: () => {
      uni.$emit('course-data', item)
    },
    fail: (err) => {
      console.error('跳转详情页失败:', err)
      uni.showToast({
        title: '页面跳转失败',
        icon: 'none',
        duration: 2000
      })
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

.courses-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16rpx;
  padding: 16rpx;

  .course-card {
    background: white;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);
    transition: all 0.2s ease;
    display: flex;
    height: 180rpx;

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

      .level-tag {
        position: absolute;
        bottom: 8rpx;
        left: 8rpx;
        padding: 4rpx 10rpx;
        border-radius: 12rpx;
        font-size: 18rpx;
        font-weight: 600;
        color: white;

        &.level-beginner {
          background: rgba(76, 203, 119, 0.9);
        }

        &.level-advanced {
          background: rgba(255, 195, 0, 0.9);
        }
      }
    }

    .card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 14rpx 16rpx;

      .course-title {
        font-size: 26rpx;
        font-weight: 700;
        color: #222;
        margin-bottom: 8rpx;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        line-height: 1.3;
      }

      .course-meta {
        display: flex;
        flex-direction: column;
        gap: 4rpx;
        font-size: 20rpx;
        color: #666;
        margin-bottom: 8rpx;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6rpx;

          .meta-icon {
            font-size: 18rpx;
            flex-shrink: 0;
          }

          .meta-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }

      .course-desc {
        font-size: 20rpx;
        color: #888;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
        margin-bottom: 8rpx;
      }

      .course-stats {
        display: flex;
        gap: 20rpx;
        margin-bottom: 8rpx;
        flex: 1;

        .stat {
          display: flex;
          align-items: center;
          gap: 6rpx;
          font-size: 19rpx;

          .stat-icon {
            font-size: 18rpx;
          }

          .stat-value {
            color: $main-blue;
            font-weight: 600;
          }
        }
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .price {
          font-size: 18rpx;
          font-weight: 600;
          color: #999;

          &.free {
            color: #4ECDC4;
            font-weight: 700;
          }
        }

        .fav-icon-wrapper {
          padding: 8rpx;
          cursor: pointer;
        }

        .fav-icon {
          font-size: 22rpx;
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