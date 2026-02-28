<template>
  <view class="list-page">
    <!-- 搜索栏 -->
    <view class="search-container">
      <view class="food-search-bar">
        <text class="search-icon">🔍</text>
        <input 
          v-model="searchKeyword" 
          class="food-search-input" 
          placeholder="请输入你想了解的食物" 
          confirm-type="search"
          @input="handleInput"
          @focus="handleFocus"
          @confirm="handleSearch" 
        />
        <text v-if="searchKeyword" class="clear-icon" @click="clearSearch">✕</text>
      </view>
      
      <!-- 分类筛选 -->
      <scroll-view class="category-tabs" scroll-x>
        <view 
          v-for="cat in categories" 
          :key="cat" 
          class="category-item"
          :class="{ active: selectedCategory === cat }"
          @click="selectCategory(cat)"
        >
          {{ cat }}
        </view>
      </scroll-view>
    </view>

    <!-- 搜索建议 / 搜索历史 -->
    <view v-if="showSearchPanel" class="search-panel">
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
            <image class="suggestion-img" :src="item.image" mode="aspectFill" />
            <view class="suggestion-info">
              <text class="suggestion-name">{{ item.name }}</text>
              <text class="suggestion-category">{{ item.category }}</text>
            </view>
            <text class="arrow-icon">→</text>
          </view>
        </view>
      </view>
      
      <!-- 搜索历史 -->
      <view v-if="searchHistory.length > 0 && !searchKeyword" class="history-section">
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
    </view>

    <!-- 搜索结果 -->
    <view v-if="isSearching || hasSearched" class="search-results-section">
      <view class="results-header">
        <text class="results-title">搜索结果</text>
        <text class="results-count">共 {{ searchResults.length }} 项</text>
      </view>
      <view v-if="isSearching" class="loading-state">
        <text class="loading-icon">⏳</text>
        <text class="loading-text">搜索中...</text>
      </view>
      <view v-else-if="!isSearching && hasSearched && searchResults.length === 0" class="empty-state">
        <text class="empty-icon">🔍</text>
        <text class="empty-text">未找到相关食物</text>
      </view>
      <view v-else class="food-list">
        <view v-for="item in searchResults" :key="item.id" class="food-card" @click="goToDetail(item)">
          <image class="food-img" :src="item.image" mode="aspectFill" />
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

    <!-- 热门推荐（仅在非搜索状态显示） -->
    <view v-else class="recommend-section">
      <!-- 热门水果 -->
      <view class="section">
        <view class="section-title">🍓 热门水果</view>
        <view class="food-list">
          <view v-for="item in fruitList" :key="item.id" class="food-card" @click="goToDetail(item)">
            <image class="food-img" :src="item.image" mode="aspectFill" />
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

      <!-- 热门蔬菜 -->
      <view class="section">
        <view class="section-title">🥬 热门蔬菜</view>
        <view class="food-list">
          <view v-for="item in vegetableList" :key="item.id" class="food-card" @click="goToDetail(item)">
            <image class="food-img" :src="item.image" mode="aspectFill" />
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
      
      <!-- 热门谷物 -->
      <view class="section">
        <view class="section-title">🌾 热门谷物</view>
        <view class="food-list">
          <view v-for="item in grainList" :key="item.id" class="food-card" @click="goToDetail(item)">
            <image class="food-img" :src="item.image" mode="aspectFill" />
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
  </view>
</template>

<script setup>
  import { ref, reactive, onMounted } from 'vue'
  import { 
    searchFoods, 
    getSearchSuggestions, 
    getCategories, 
    getPopularFoods,
    saveSearchHistory,
    getSearchHistory,
    clearSearchHistory,
    removeSearchHistory,
    toggleCollection,
    isCollected
  } from './foodDataService.js'

  // ========== 状态管理 ==========
  const searchKeyword = ref('')
  const selectedCategory = ref('全部')
  const categories = ref([])
  const searchResults = ref([])
  const searchSuggestions = ref([])
  const searchHistory = ref([])
  const isSearching = ref(false)
  const showSearchPanel = ref(false)
  const hasSearched = ref(false)
  
  // 热门推荐列表
  const fruitList = ref([])
  const vegetableList = ref([])
  const grainList = ref([])
  
  // 防抖定时器
  let debounceTimer = null
  
  // ========== 生命周期 ==========
  onMounted(async () => {
    // 加载分类
    categories.value = getCategories()
    
    // 加载搜索历史
    searchHistory.value = getSearchHistory()
    
    // 加载热门推荐
    await loadPopularFoods()
  })
  
  // ========== 搜索功能 ==========
  
  // 输入框输入事件（实时搜索建议）
  const handleInput = () => {
    showSearchPanel.value = true
    
    // 防抖处理
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    debounceTimer = setTimeout(async () => {
      if (searchKeyword.value.trim()) {
        searchSuggestions.value = await getSearchSuggestions(searchKeyword.value)
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
  const handleSearch = async () => {
    if (!searchKeyword.value.trim()) {
      uni.showToast({ title: '请输入搜索关键词', icon: 'none' })
      return
    }
    
    showSearchPanel.value = false
    hasSearched.value = true
    isSearching.value = true
    
    try {
      // 保存搜索历史
      saveSearchHistory(searchKeyword.value)
      searchHistory.value = getSearchHistory()
      
      // 执行搜索
      const results = await searchFoods(searchKeyword.value, selectedCategory.value)
      
      // 添加收藏状态
      searchResults.value = results.map(item => ({
        ...item,
        collected: isCollected(item.id)
      }))
    } catch (error) {
      console.error('搜索失败', error)
      uni.showToast({ title: '搜索失败', icon: 'none' })
      searchResults.value = []
    } finally {
      isSearching.value = false
    }
  }
  
  // 清空搜索框
  const clearSearch = () => {
    searchKeyword.value = ''
    searchSuggestions.value = []
    searchResults.value = []
    hasSearched.value = false
    showSearchPanel.value = true
  }
  
  // 选择搜索建议
  const selectSuggestion = (item) => {
    // 直接跳转到详情页
    goToDetail(item)
  }
  
  // 从历史记录搜索
  const searchFromHistory = (keyword) => {
    searchKeyword.value = keyword
    handleSearch()
  }
  
  // 删除单条历史记录
  const removeHistory = (keyword) => {
    removeSearchHistory(keyword)
    searchHistory.value = getSearchHistory()
  }
  
  // 清空历史记录
  const clearHistory = () => {
    uni.showModal({
      title: '确认清空',
      content: '确定要清空所有搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          clearSearchHistory()
          searchHistory.value = []
          uni.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  }
  
  // ========== 分类筛选 ==========
  const selectCategory = async (category) => {
    selectedCategory.value = category
    
    // 如果有搜索关键词，重新搜索
    if (searchKeyword.value.trim()) {
      await handleSearch()
    } else {
      // 否则刷新热门推荐
      await loadPopularFoods()
    }
  }
  
  // ========== 数据加载 ==========
  const loadPopularFoods = async () => {
    try {
      // 加载各分类热门食物
      const fruits = await getPopularFoods('水果', 4)
      const vegetables = await getPopularFoods('蔬菜', 4)
      const grains = await getPopularFoods('谷物', 4)
      
      // 添加收藏状态
      fruitList.value = fruits.map(item => ({
        ...item,
        collected: isCollected(item.id)
      }))
      vegetableList.value = vegetables.map(item => ({
        ...item,
        collected: isCollected(item.id)
      }))
      grainList.value = grains.map(item => ({
        ...item,
        collected: isCollected(item.id)
      }))
    } catch (error) {
      console.error('加载热门食物失败', error)
    }
  }
  
  // ========== 收藏功能 ==========
  const handleToggleCollect = (item) => {
    const newState = toggleCollection(item.id)
    item.collected = newState
    
    uni.showToast({
      title: newState ? '已收藏' : '已取消收藏',
      icon: 'none',
      duration: 1500
    })
  }
  
  // ========== 页面跳转 ==========
  const goToDetail = (item) => {
    // 使用食物ID传递，详情页内部调用API获取完整数据
    uni.navigateTo({
      url: `/pages/home/search_bar_detail?foodId=${item.id}`
    })
  }
</script>

<style scoped>
  .list-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #E3F2FD 0%, #F0F9FF 100%);
    padding-bottom: 20px;
  }

  /* ========== 搜索容器 ========== */
  .search-container {
    position: sticky;
    top: 0;
    z-index: 100;
    background: linear-gradient(135deg, #E3F2FD 0%, #F0F9FF 100%);
    padding: 18px 12px 12px;
  }

  /* 搜索栏 */
  .food-search-bar {
    width: 100%;
    max-width: 460px;
    height: 46px;
    background: #fff;
    border-radius: 25px;
    border: 1px solid rgba(79, 161, 242, 0.15);
    display: flex;
    align-items: center;
    padding: 0 16px;
    margin: 0 auto 12px;
    box-sizing: border-box;
    box-shadow: 0 2px 8px rgba(79, 161, 242, 0.14);
  }

  .search-icon {
    font-size: 18px;
    margin-right: 8px;
    color: #999;
  }

  .food-search-input {
    flex: 1;
    min-width: 0;
    height: 36px;
    line-height: 36px;
    padding: 0 8px;
    font-size: 14px;
    color: #333;
    border: none;
    background: transparent;
  }

  .food-search-input::placeholder {
    color: #b5bcc6;
  }

  .clear-icon {
    font-size: 16px;
    color: #999;
    padding: 4px;
    cursor: pointer;
  }

  /* 分类标签 */
  .category-tabs {
    display: flex;
    white-space: nowrap;
    margin: 0 auto;
    max-width: 460px;
  }

  .category-item {
    display: inline-block;
    padding: 6px 16px;
    margin-right: 8px;
    font-size: 13px;
    color: #666;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 16px;
    border: 1px solid rgba(79, 161, 242, 0.15);
    transition: all 0.2s;
    white-space: nowrap;
  }

  .category-item.active {
    background: linear-gradient(135deg, #4FA1F2, #80D0FF);
    color: #fff;
    border-color: #4FA1F2;
    font-weight: 600;
  }

  /* ========== 搜索面板 ========== */
  .search-panel {
    background: white;
    margin: 0 12px 12px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(79, 161, 242, 0.1);
    padding: 16px;
  }

  .panel-title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
  }

  /* 搜索建议 */
  .suggestions-section {
    margin-bottom: 16px;
  }

  .suggestions-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .suggestion-item {
    display: flex;
    align-items: center;
    padding: 10px;
    background: rgba(79, 161, 242, 0.05);
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .suggestion-item:active {
    background: rgba(79, 161, 242, 0.12);
  }

  .suggestion-img {
    width: 40px;
    height: 40px;
    border-radius: 6px;
    margin-right: 12px;
    object-fit: cover;
  }

  .suggestion-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .suggestion-name {
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }

  .suggestion-category {
    font-size: 12px;
    color: #999;
  }

  .arrow-icon {
    font-size: 16px;
    color: #4FA1F2;
  }

  /* 搜索历史 */
  .history-section {
    margin-top: 16px;
  }

  .history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .clear-history {
    font-size: 13px;
    color: #4FA1F2;
    cursor: pointer;
  }

  .history-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .history-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: rgba(79, 161, 242, 0.08);
    border: 1px solid rgba(79, 161, 242, 0.15);
    border-radius: 16px;
    font-size: 13px;
    color: #333;
    cursor: pointer;
  }

  .history-tag:active {
    background: rgba(79, 161, 242, 0.15);
  }

  .history-text {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .remove-icon {
    font-size: 12px;
    color: #999;
  }

  /* ========== 搜索结果 ========== */
  .search-results-section {
    margin: 0 12px;
  }

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 12px 12px 0 0;
  }

  .results-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .results-count {
    font-size: 13px;
    color: #999;
  }

  /* 加载/空状态 */
  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    background: white;
    border-radius: 0 0 12px 12px;
  }

  .loading-icon,
  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .loading-text,
  .empty-text {
    font-size: 14px;
    color: #999;
  }

  /* ========== 推荐区域 ========== */
  .recommend-section {
    padding: 0 12px;
  }

  .section {
    background-color: rgba(255, 255, 255, 0.96);
    margin-bottom: 16px;
    padding: 16px;
    border-radius: 14px;
    box-shadow: 0 4px 12px rgba(79, 161, 242, 0.1);
  }

  .section-title {
    font-size: 17px;
    font-weight: 600;
    color: #333;
    margin-bottom: 16px;
  }

  /* ========== 食物列表 ========== */
  .food-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .food-card {
    display: flex;
    align-items: center;
    background-color: #ffffff;
    border-radius: 12px;
    padding: 12px;
    border: 1px solid rgba(79, 161, 242, 0.12);
    box-shadow: 0 2px 8px rgba(79, 161, 242, 0.06);
    transition: all 0.2s;
  }

  .food-card:active {
    transform: scale(0.98);
    box-shadow: 0 4px 12px rgba(79, 161, 242, 0.12);
  }

  .food-img {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    margin-right: 12px;
    object-fit: cover;
  }

  .food-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .food-name {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .food-calorie {
    font-size: 13px;
    color: #FF6B6B;
    font-weight: 500;
  }

  .food-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  .tag {
    padding: 2px 8px;
    background: rgba(79, 161, 242, 0.1);
    border-radius: 4px;
    font-size: 11px;
    color: #4FA1F2;
  }

  /* 收藏按钮 */
  .collect-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(79, 161, 242, 0.08);
    cursor: pointer;
    transition: all 0.2s;
  }

  .collect-btn:active {
    background: rgba(79, 161, 242, 0.15);
    transform: scale(0.95);
  }

  .collect-icon {
    font-size: 20px;
    color: #FFD700;
  }
</style>