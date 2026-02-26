<template>
  <view class="container">
    <!-- 1. 顶部搜索栏 -->
    <view class="search-box">
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input v-model="searchQuery" @input="performSearch" type="text" class="search-input" placeholder="请输入晚餐名称" />
        <text class="menu-icon" @click="clearSearch">✕</text>
      </view>
    </view>

    <!-- 搜索结果板块 -->
    <view v-if="searchQuery" class="search-results">
      <view class="results-header">
        <text class="results-title">搜索结果</text>
        <text class="results-count" v-if="!isSearching">(共{{ searchResults.length }}个)</text>
        <text class="results-count" v-else>搜索中...</text>
      </view>
      <view v-if="searchResults.length > 0" class="results-grid">
        <view v-for="(item, index) in searchResults" :key="index" class="result-item"
          @click="handleSearchItemClick(item)">
          <text class="result-emoji">{{ item.emoji || '📦' }}</text>
          <text class="result-name">{{ item.name }}</text>
          <text class="result-category">{{ item.category }}</text>
        </view>
      </view>
      <view v-else-if="!isSearching" class="empty-results">
        <text>未找到匹配的内容</text>
      </view>
    </view>
  </view>
</template>

<script setup>
  import {
    ref
  } from 'vue'
  // 搜索数据
  const searchQuery = ref('')
  const searchResults = ref([])
  const isSearching = ref(false)

  // 搜索函数
  const performSearch = async () => {
    if (!searchQuery.value.trim()) {
      searchResults.value = []
      return
    }

    isSearching.value = true
    try {
      const response = await uni.request({
        url: 'http://127.0.0.1:3000/api/search',
        method: 'GET',
        data: {
          q: searchQuery.value
        },
        timeout: 5000
      })

      if (response.statusCode === 200 && response.data.code === 0) {
        searchResults.value = (response.data.data || []).slice(0, 8)
      } else {
        searchResults.value = []
        uni.showToast({
          title: '搜索失败，请重试',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('搜索请求失败:', error)
      uni.showToast({
        title: '网络错误',
        icon: 'none'
      })
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }

  // 清除搜索
  const clearSearch = () => {
    searchQuery.value = ''
  }

  // 处理搜索结果点击
  const handleSearchItemClick = (item) => {
    if (item.type === 'drink') {
      goToPage('/pages/schedule/drinks')
    } else if (item.type === 'recipe') {
      goToPage('/pages/schedule/recipes')
    }
    clearSearch()
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

  // 搜索结果
  .search-results {
    background: white;
    border-radius: 16rpx;
    padding: 20rpx;
    margin-bottom: 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);

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

    .results-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12rpx;

      .result-item {
        background: linear-gradient(135deg, rgba(79, 161, 242, 0.1), rgba(128, 208, 255, 0.1));
        border-radius: 12rpx;
        padding: 16rpx;
        text-align: center;
        cursor: pointer;
        transition: all 0.2s ease;

        &:active {
          transform: scale(0.95);
          background: rgba(79, 161, 242, 0.2);
        }

        .result-emoji {
          display: block;
          font-size: 40rpx;
          margin-bottom: 8rpx;
        }

        .result-name {
          display: block;
          font-size: 22rpx;
          font-weight: 600;
          color: #333;
          margin-bottom: 4rpx;
        }

        .result-category {
          display: block;
          font-size: 18rpx;
          color: #999;
        }
      }
    }

    .empty-results {
      text-align: center;
      padding: 32rpx 0;
      color: #999;
      font-size: 24rpx;
    }
  }
</style>