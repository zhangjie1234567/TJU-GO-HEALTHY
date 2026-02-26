<template>
  <!-- 列表页（唯一主页面，移除视图切换，跳转独立页面） -->
  <view class="list-page">
    <!-- 搜索栏：居中显示，移除返回按钮 -->
    <view class="food-search-bar">
      <input v-model="searchKeyword" class="food-search-input" placeholder="请输入你想了解的食物并点击查看详情" confirm-type="search"
        @confirm="handleSearch" />
      <image class="food-search-icon" :src="assetSearchIcon" mode="aspectFit" lazy-load @click="handleSearch" />
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
            <text class="collect-icon">{{ item.collected ? '★' : '☆' }}</text>
            <text class="collect-text">{{ item.collected ? '已收藏' : '收藏' }}</text>
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
            <text class="collect-icon">{{ item.collected ? '★' : '☆' }}</text>
            <text class="collect-text">{{ item.collected ? '已收藏' : '收藏' }}</text>
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

  const assetSearchIcon = new URL('../../static/搜索图标.png', import.meta.url).href

  // 搜索关键词
  const searchKeyword = ref('')
  // 热门水果数据
  const fruitList = reactive([{
      id: 1,
      name: '草莓',
      calorie: '30千卡/100克',
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=640&q=80',
      collected: false
    },
    {
      id: 2,
      name: '橙子',
      calorie: '47千卡/100克',
      image: 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?auto=format&fit=crop&w=640&q=80',
      collected: false
    },
    {
      id: 3,
      name: '海棠果',
      calorie: '73千卡/100克',
      image: 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?auto=format&fit=crop&w=640&q=80',
      collected: false
    },
    {
      id: 4,
      name: '柠檬',
      calorie: '35千卡/100克',
      image: 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=640&q=80',
      collected: false
    }
  ])
  // 热门蔬菜数据
  const vegetableList = reactive([{
      id: 5,
      name: '西红柿',
      calorie: '18千卡/100克',
      image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=640&q=80',
      collected: false
    },
    {
      id: 6,
      name: '黄瓜',
      calorie: '16千卡/100克',
      image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=640&q=80',
      collected: false
    },
    {
      id: 7,
      name: '西兰花',
      calorie: '34千卡/100克',
      image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&w=640&q=80',
      collected: false
    },
    {
      id: 8,
      name: '胡萝卜',
      calorie: '41千卡/100克',
      image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=640&q=80',
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
      url: `/pages/home/search_bar_detail?foodData=${JSON.stringify(item)}`
    })
  }

  // 跳转到水果更多页：search_bar_morefruits.vue
  const goToMoreFruits = () => {
    uni.navigateTo({
      url: '/pages/home/search_bar_morefruits'
    })
  }

  // 跳转到蔬菜更多页：search_bar_morevegetables.vue
  const goToMoreVegetables = () => {
    uni.navigateTo({
      url: '/pages/home/search_bar_morevegetables'
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
    min-height: 100vh;
    background: linear-gradient(135deg, #E3F2FD 0%, #F0F9FF 100%);
    padding-top: 18px;
    padding-bottom: 16px;
    margin-bottom: 4px;
    box-sizing: border-box;
  }

  /* 搜索栏：居中显示，调整外层样式，移除原导航栏 */
  .food-search-bar {
    width: calc(100vw - 24px);
    max-width: 460px;
    height: 46px;
    background: #fff;
    border-radius: 25px;
    border: 1px solid rgba(79, 161, 242, 0.15);
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 0 12px;
    margin: 0 auto 18px;
    /* 水平居中，上下间距 */
    box-sizing: border-box;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(79, 161, 242, 0.14);
  }

  .food-search-input {
    flex: 1;
    min-width: 0;
    height: 32px;
    line-height: 32px;
    padding: 0 8px 0 2px;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
    color: #333;
    box-sizing: border-box;
  }

  .food-search-input::placeholder {
    color: #b5bcc6;
    line-height: 32px;
  }

  .food-search-icon {
    width: 20px;
    height: 20px;
    margin-left: 6px;
    flex-shrink: 0;
  }

  /* 内容区块 */
  .section {
    background-color: rgba(255, 255, 255, 0.96);
    /*一个左间距一个下间距*/
    margin: 0 16px 2px;
    /* 左右间距，上下间距 */
    padding: 16px;
    border-radius: 14px;
    box-shadow: 0 4px 12px rgba(79, 161, 242, 0.1);
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
    border-radius: 12px;
    padding: 12px;
    border: 1px solid rgba(79, 161, 242, 0.18);
    box-shadow: 0 2px 8px rgba(79, 161, 242, 0.08);
  }

  .food-img {
    width: 92px;
    height: 72px;
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
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-width: 64px;
    height: 32px;
    padding: 0 8px;
    border-radius: 16px;
    border: 1px solid rgba(79, 161, 242, 0.35);
    background: #f7fbff;
  }

  .collect-icon {
    font-size: 14px;
    color: #4fa1f2;
    line-height: 1;
  }

  .collect-text {
    font-size: 12px;
    color: #4fa1f2;
    font-weight: 600;
    line-height: 1;
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