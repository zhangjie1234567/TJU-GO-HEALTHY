<template>
  <!-- 列表页（唯一主页面，移除视图切换，跳转独立页面） -->
  <view class="list-page">
    <!-- 搜索栏：居中显示，移除返回按钮 -->
    <view class="food-search-bar">
      <input v-model="searchKeyword" class="food-search-input" placeholder="请输入你想了解的食物并点击查看详情" confirm-type="search"
        @confirm="handleSearch" />
      <image class="food-search-icon" src="/static/搜索图标.png" mode="aspectFit" lazy-load @click="handleSearch" />
    </view>

    <!-- 热门水果 -->
    <view class="section">
      <view class="section-title">热门水果</view>
      <view class="food-list">
        <view v-for="item in fruitList" :key="item.id" class="food-card" @click="goToDetail(item)">
          <image class="food-img" :src="item.image" mode="aspectFill" />
          <view class="food-info">
            <view class="food-name">{{ item.name }}</view>
            <view class="food-calorie">{{ item.calorie }}</view>
          </view>
          <view class="collect-btn" @click.stop="toggleCollect(item)">
            <image :src="item.collected ? '/static/search_bar/收藏-active.png' : '/static/search_bar/收藏.png'"
              mode="aspectFit" class="collect-icon" />
          </view>
        </view>
      </view>
      <!-- 水果模块添加查看更多 -->
      <view class="more-btn" @click="goToMoreFruits()">
        <text class="more-text">点击查看更多</text>
      </view>
    </view>

    <!-- 热门蔬菜 -->
    <view class="section">
      <view class="section-title">热门蔬菜</view>
      <view class="food-list">
        <view v-for="item in vegetableList" :key="item.id" class="food-card" @click="goToDetail(item)">
          <image class="food-img" :src="item.image" mode="aspectFill" />
          <view class="food-info">
            <view class="food-name">{{ item.name }}</view>
            <view class="food-calorie">{{ item.calorie }}</view>
          </view>
          <view class="collect-btn" @click.stop="toggleCollect(item)">
            <image :src="item.collected ? '/static/search_bar/收藏-active.png' : '/static/search_bar/收藏.png'"
              mode="aspectFit" class="collect-icon" />
          </view>
        </view>
      </view>
      <!-- 蔬菜模块查看更多（跳转蔬菜更多页） -->
      <view class="more-btn" @click="goToMoreVegetables()">
        <text class="more-text">点击查看更多</text>
      </view>
    </view>
  </view>
</template>

<script setup>
  import {
    ref,
    reactive
  } from 'vue'

  // 搜索关键词
  const searchKeyword = ref('')
  // 热门水果数据
  const fruitList = reactive([{
      id: 1,
      name: '草莓',
      calorie: '30千卡/100克',
      image: '/static/search_bar/食物图片.png',
      collected: false
    },
    {
      id: 2,
      name: '橙子',
      calorie: '47千卡/100克',
      image: '/static/search_bar/食物图片.png',
      collected: false
    },
    {
      id: 3,
      name: '海棠果',
      calorie: '73千卡/100克',
      image: '/static/search_bar/食物图片.png',
      collected: false
    },
    {
      id: 4,
      name: '柠檬',
      calorie: '35千卡/100克',
      image: '/static/search_bar/食物图片.png',
      collected: false
    }
  ])
  // 热门蔬菜数据
  const vegetableList = reactive([{
      id: 5,
      name: '西红柿',
      calorie: '18千卡/100克',
      image: '/static/search_bar/食物图片.png',
      collected: false
    },
    {
      id: 6,
      name: '黄瓜',
      calorie: '16千卡/100克',
      image: '/static/search_bar/食物图片.png',
      collected: false
    },
    {
      id: 7,
      name: '西兰花',
      calorie: '34千卡/100克',
      image: '/static/search_bar/食物图片.png',
      collected: false
    },
    {
      id: 8,
      name: '胡萝卜',
      calorie: '41千卡/100克',
      image: '/static/search_bar/食物图片.png',
      collected: false
    }
  ])

  // 处理搜索
  const handleSearch = () => {
    console.log('搜索关键词：', searchKeyword.value)
    // 可在此处添加搜索逻辑
  }

  // 跳转到食物详情页：携带食物数据到search_bar_detail.vue
  const goToDetail = (item) => {
    uni.navigateTo({
      url: `/pages/home/home_search_bar/search_bar_detail/search_bar_detail?foodData=${JSON.stringify(item)}`
    })
  }

  // 跳转到水果更多页：search_bar_morefruits.vue
  const goToMoreFruits = () => {
    uni.navigateTo({
      url: '/pages/home/home_search_bar/search_bar_morefruits/search_bar_morefruits'
    })
  }

  // 跳转到蔬菜更多页：search_bar_morevegetables.vue
  const goToMoreVegetables = () => {
    uni.navigateTo({
      url: '/pages/home/home_search_bar/search_bar_morevegetables/search_bar_morevegetables'
    })
  }

  // 切换收藏状态（本地临时状态，无后端时仅页面内有效）
  const toggleCollect = (item) => {
    item.collected = !item.collected
    uni.showToast({
      title: item.collected ? '已收藏' : '已取消收藏',
      icon: 'none'
    })
  }
</script>

<style scoped>
  .list-page {
    margin-bottom: 4px;
  }

  /* 搜索栏：居中显示，调整外层样式，移除原导航栏 */
  .food-search-bar {
    width: 366px;
    height: 44px;
    background: #fff;
    border-radius: 22px;
    border: 1.5px solid #d9d9d9;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 18px;
    margin: 18px auto;
    /* 水平居中，上下间距 */
    box-sizing: border-box;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(79, 161, 242, 0.04);
  }

  .food-search-input {
    flex: 1;
    font-size: 15px;
    color: #333;
  }

  .food-search-input::placeholder {
    color: #d9d9d9;
  }

  .food-search-icon {
    width: 22px;
    height: 22px;
    margin-left: 12px;
  }

  /* 内容区块 */
  .section {
    background-color: #ffffff;
    /*一个左间距一个下间距*/
    margin: 0 16px 2px;
    /* 左右间距，上下间距 */
    padding: 16px;
    border-radius: 8px;
  }

  .section-title {
    font-size: 18px;
    font-weight: 500;
    color: #333;
    margin-bottom: 16px;
  }

  /* 食物列表 */
  .food-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .food-card {
    display: flex;
    align-items: center;
    background-color: #ffffff;
    border-radius: 8px;
    padding: 12px;
    /*box-shadow: 0 2px 8px #d9d9d9;*/
    border: 2px solid #d9d9d9;
  }

  .food-img {
    width: 100px;
    height: 80px;
    border-radius: 6px;
    margin-right: 12px;
  }

  .food-info {
    flex: 1;
  }

  .food-name {
    font-size: 16px;
    color: #333;
    margin-bottom: 4px;
  }

  .food-calorie {
    font-size: 14px;
    color: #666;
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

  /* 查看更多按钮 */
  .more-btn {
    text-align: center;
    margin-top: 16px;
    padding-top: 8px;
    border-top: 1px solid #f0f0f0;
  }

  .more-text {
    font-size: 14px;
    color: #4fa1f2;
  }
</style>