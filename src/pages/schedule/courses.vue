<template>
  <view class="container">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <text class="back-btn" @click="goBack">← 返回</text>
      <text class="page-title">📚 课程推荐</text>
      <view style="width: 60rpx;"></view>
    </view>

    <!-- 搜索框 -->
    <view class="search-box">
      <text class="search-icon">🔍</text>
      <input v-model="searchText" type="text" class="search-input" placeholder="搜索课程..."/>
      <text v-if="searchText" class="clear-icon" @click="searchText = ''">✕</text>
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
      <view v-for="(item, index) in filteredCourses" :key="index" class="course-card">
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
            <text class="fav-icon" @click.stop="toggleFavorite(item.id)" 
                  :class="{ collected: isFavorited(item.id) }">{{ isFavorited(item.id) ? '★' : '☆' }}</text>
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
    const response = await uni.request({
      url: 'http://127.0.0.1:3000/api/courses',
      method: 'GET'
    })

    if (response[1]?.data?.code === 0) {
      courses.value = response[1].data.data || []
    } else {
      console.error('课程加载失败:', response[1]?.data)
    }
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
      item.title.toLowerCase().includes(searchText.value.toLowerCase()) ||
      item.platform.toLowerCase().includes(searchText.value.toLowerCase()) ||
      item.instructor.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }
  
  // 难度过滤
  if (filterType.value === 'beginner') {
    result = result.filter(item => item.level === '入门级')
  } else if (filterType.value === 'advanced') {
    result = result.filter(item => item.level === '进阶级')
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

        &.level-入门级 {
          background: rgba(76, 203, 119, 0.9);
        }

        &.level-进阶级 {
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