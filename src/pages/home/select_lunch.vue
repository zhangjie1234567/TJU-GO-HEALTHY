<template>
  <view class="container">
    <!-- 1. 顶部搜索栏 -->
    <view class="search-box">
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input 
          v-model="searchQuery" 
          @input="handleInput" 
          @focus="handleFocus"
          @confirm="performSearch"
          type="text" 
          class="search-input" 
          placeholder="请输入午餐食物名称" 
          confirm-type="search"
        />
        <text v-if="searchQuery" class="menu-icon" @click="clearSearch">✕</text>
      </view>
    </view>

    <!-- 搜索建议面板 -->
    <view v-if="showSearchPanel && searchQuery" class="search-panel">
      <!-- 搜索建议 -->
      <view v-if="searchSuggestions.length > 0" class="suggestions-section">
        <view class="panel-title">搜索建议</view>
        <view class="suggestions-list">
          <view 
            v-for="item in searchSuggestions" 
            :key="item.id" 
            class="suggestion-item"
            @click="selectSuggestion(item)"
          >
            <view class="suggestion-info">
              <text class="suggestion-name">{{ item.name }}</text>
              <text class="suggestion-category">{{ item.category }}</text>
            </view>
            <text class="arrow-icon">→</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 搜索历史 -->
    <view v-if="showSearchPanel && !searchQuery && searchHistory.length > 0" class="history-section">
      <view class="history-header">
        <text class="panel-title">搜索历史</text>
        <text class="clear-history" @click="clearHistory">清空</text>
      </view>
      <view class="history-tags">
        <view 
          v-for="(keyword, index) in searchHistory" 
          :key="index" 
          class="history-tag"
          @click="searchFromHistory(keyword)"
        >
          <text class="history-text">{{ keyword }}</text>
          <text class="remove-icon" @click.stop="removeHistory(keyword)">✕</text>
        </view>
      </view>
    </view>

    <!-- 搜索结果板块 -->
    <view v-if="hasSearched" class="search-results">
      <view class="results-header">
        <text class="results-title">搜索结果</text>
        <text class="results-count" v-if="!isSearching">(共{{ searchResults.length }}个)</text>
        <text class="results-count" v-else>搜索中...</text>
      </view>
      
      <view v-if="isSearching" class="loading-state">
        <text class="loading-icon">⏳</text>
        <text class="loading-text">搜索中...</text>
      </view>
      
      <view v-else-if="searchResults.length > 0" class="results-list">
        <view 
          v-for="item in searchResults" 
          :key="item.id" 
          class="food-card"
          @click="goToDetail(item)"
        >
          <view class="food-info">
            <view class="food-name">{{ item.name }}</view>
            <view class="food-calorie">{{ item.energy }}千卡/100克</view>
            <view class="food-tags">
              <text v-for="tag in item.tags.slice(0, 2)" :key="tag" class="tag">{{ tag }}</text>
            </view>
          </view>
          <view class="collect-btn" @click.stop="handleToggleCollect(item)">
            <text class="collect-icon">{{ item.collected ? '★' : '☆' }}</text>
          </view>
        </view>
      </view>
      
      <view v-else class="empty-results">
        <text class="empty-icon">🔍</text>
        <text class="empty-text">未找到匹配的午餐食物</text>
      </view>
    </view>

    <!-- 推荐午餐（未搜索时显示） -->
    <view v-if="!hasSearched" class="recommend-section">
      <view class="section-title">🍱 推荐午餐食物</view>
      <view class="food-list">
        <view 
          v-for="item in recommendList" 
          :key="item.id" 
          class="food-card"
          @click="goToDetail(item)"
        >
          <view class="food-info">
            <view class="food-name">{{ item.name }}</view>
            <view class="food-calorie">{{ item.energy }}千卡/100克</view>
            <view class="food-tags">
              <text v-for="tag in item.tags.slice(0, 2)" :key="tag" class="tag">{{ tag }}</text>
            </view>
          </view>
          <view class="collect-btn" @click.stop="handleToggleCollect(item)">
            <text class="collect-icon">{{ item.collected ? '★' : '☆' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { onShow } from '@dcloudio/uni-app'
  import { 
    searchFoods, 
    getSearchSuggestions,
    saveSearchHistory,
    getSearchHistory,
    clearSearchHistory,
    removeSearchHistory as removeSearchHistoryItem,
    toggleCollection,
    getPopularFoods
  } from './foodDataService.js'

  // 搜索数据
  const searchQuery = ref('')
  const searchResults = ref([])
  const searchSuggestions = ref([])
  const searchHistory = ref([])
  const isSearching = ref(false)
  const showSearchPanel = ref(false)
  const hasSearched = ref(false)
  const recommendList = ref([])
  
  // 防抖定时器
  let debounceTimer = null

  // 页面加载
  onMounted(async () => {
    searchHistory.value = getSearchHistory()
    // 加载推荐午餐食物
    const allFoods = await getPopularFoods('', 20, 'lunch')
    recommendList.value = allFoods
  })
// 页面返回时自动刷新，保证收藏状态同步
onShow(async () => {
  if (hasSearched.value && searchQuery.value.trim()) {
    await performSearch()
  } else {
    // 重新加载推荐午餐
    const allFoods = await getPopularFoods('', 20, 'lunch')
    recommendList.value = allFoods
  }
})
  // 输入框输入事件（实时搜索建议）
  const handleInput = () => {
    showSearchPanel.value = true
    
    // 防抖处理
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    debounceTimer = setTimeout(async () => {
      if (searchQuery.value.trim()) {
        searchSuggestions.value = await getSearchSuggestions(searchQuery.value)
      } else {
        searchSuggestions.value = []
      }
    }, 300)
  }

  // 输入框聚焦事件
  const handleFocus = () => {
    showSearchPanel.value = true
  }

  // 执行搜索
  const performSearch = async () => {
    if (!searchQuery.value.trim()) {
      uni.showToast({ title: '请输入搜索关键词', icon: 'none' })
      return
    }
    
    showSearchPanel.value = false
    hasSearched.value = true
    isSearching.value = true
    
    try {
      // 保存搜索历史
      saveSearchHistory(searchQuery.value)
      searchHistory.value = getSearchHistory()
      
      // 执行搜索（后端已返回 collected 字段）
      const results = await searchFoods(searchQuery.value, '')
      searchResults.value = results
    } catch (error) {
      console.error('搜索失败', error)
      uni.showToast({ title: '搜索失败', icon: 'none' })
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }

  // 清除搜索
  const clearSearch = () => {
    searchQuery.value = ''
    searchSuggestions.value = []
    searchResults.value = []
    hasSearched.value = false
    showSearchPanel.value = true
  }

  // 选择搜索建议（直接跳转详情）
  const selectSuggestion = (item) => {
    goToDetail(item)
  }

  // 从历史记录搜索
  const searchFromHistory = (keyword) => {
    searchQuery.value = keyword
    performSearch()
  }

  // 删除单条历史记录
  const removeHistory = (keyword) => {
    removeSearchHistoryItem(keyword)
    searchHistory.value = getSearchHistory()
  }

  // 清空历史记录
  const clearHistory = () => {
    clearSearchHistory()
    searchHistory.value = []
    uni.showToast({ title: '已清空历史记录', icon: 'none' })
  }

  // 跳转到详情页
  const goToDetail = (item) => {
    uni.navigateTo({
      url: `/pages/home/search_bar_detail?foodId=${item.id}`
    })
  }

  // 切换收藏
  const handleToggleCollect = async (item) => {
    try {
      const newState = await toggleCollection(item.id)
      item.collected = newState
      uni.showToast({
        title: newState ? '已收藏' : '已取消收藏',
        icon: 'none',
        duration: 1500
      })
    } catch (error) {
      console.error('切换收藏失败', error)
      uni.showToast({ title: error.message || '收藏操作失败', icon: 'none' })
    }
  }
</script>

<style lang="scss" scoped>
  $main-blue: #4FA1F2;
  $light-blue: #80D0FF;
  $bg-blue: #E3F2FD;
  $text-title: #333;

  .container {
    background: linear-gradient(135deg, #E3F2FD 0%, #F0F9FF 100%);
    min-height: 100vh;
    padding: 24rpx;
    box-sizing: border-box;
  }

  // 搜索栏
  .search-box {
    margin-bottom: 24rpx;

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

  // 搜索建议面板
  .search-panel {
    background: white;
    border-radius: 16rpx;
    padding: 20rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);
  }

  .suggestions-section {
    .panel-title {
      font-size: 28rpx;
      font-weight: 700;
      color: #333;
      margin-bottom: 16rpx;
    }

    .suggestions-list {
      .suggestion-item {
        display: flex;
        align-items: center;
        padding: 12rpx;
        border-radius: 8rpx;
        margin-bottom: 8rpx;
        background: rgba(79, 161, 242, 0.05);

        &:active {
          background: rgba(79, 161, 242, 0.15);
        }

        .suggestion-info {
          flex: 1;

          .suggestion-name {
            display: block;
            font-size: 28rpx;
            color: #333;
            margin-bottom: 4rpx;
          }

          .suggestion-category {
            display: block;
            font-size: 22rpx;
            color: #999;
          }
        }

        .arrow-icon {
          font-size: 32rpx;
          color: $main-blue;
        }
      }
    }
  }

  // 搜索历史
  .history-section {
    background: white;
    border-radius: 16rpx;
    padding: 20rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;

      .panel-title {
        font-size: 28rpx;
        font-weight: 700;
        color: #333;
      }

      .clear-history {
        font-size: 24rpx;
        color: $main-blue;
      }
    }

    .history-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 12rpx;

      .history-tag {
        display: flex;
        align-items: center;
        gap: 8rpx;
        padding: 8rpx 16rpx;
        background: rgba(79, 161, 242, 0.1);
        border-radius: 20rpx;

        .history-text {
          font-size: 24rpx;
          color: #333;
        }

        .remove-icon {
          font-size: 20rpx;
          color: #999;
        }
      }
    }
  }

  // 搜索结果
  .search-results {
    .results-header {
      display: flex;
      gap: 12rpx;
      margin-bottom: 16rpx;

      .results-title {
        font-size: 28rpx;
        font-weight: 700;
        color: #333;
      }

      .results-count {
        font-size: 24rpx;
        color: #999;
      }
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80rpx 0;

      .loading-icon {
        font-size: 64rpx;
        margin-bottom: 16rpx;
      }

      .loading-text {
        font-size: 28rpx;
        color: #999;
      }
    }

    .results-list {
      display: flex;
      flex-direction: column;
      gap: 16rpx;
    }

    .empty-results {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80rpx 0;

      .empty-icon {
        font-size: 64rpx;
        margin-bottom: 16rpx;
      }

      .empty-text {
        font-size: 28rpx;
        color: #999;
      }
    }
  }

  // 推荐食物
  .recommend-section {
    .section-title {
      font-size: 32rpx;
      font-weight: 700;
      color: #333;
      margin-bottom: 20rpx;
    }

    .food-list {
      display: flex;
      flex-direction: column;
      gap: 16rpx;
    }
  }

  // 食物卡片
  .food-card {
    display: flex;
    align-items: center;
    background: white;
    border-radius: 12rpx;
    padding: 16rpx;
    box-shadow: 0 2rpx 8rpx rgba(79, 161, 242, 0.08);

    &:active {
      transform: scale(0.98);
    }

    .food-info {
      flex: 1;

      .food-name {
        font-size: 28rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 8rpx;
      }

      .food-calorie {
        font-size: 24rpx;
        color: #666;
        margin-bottom: 8rpx;
      }

      .food-tags {
        display: flex;
        gap: 8rpx;

        .tag {
          padding: 4rpx 12rpx;
          background: rgba(79, 161, 242, 0.1);
          border-radius: 12rpx;
          font-size: 20rpx;
          color: $main-blue;
        }
      }
    }

    .collect-btn {
      width: 56rpx;
      height: 56rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(79, 161, 242, 0.1);

      .collect-icon {
        font-size: 32rpx;
        color: $main-blue;
      }
    }
  }
</style>