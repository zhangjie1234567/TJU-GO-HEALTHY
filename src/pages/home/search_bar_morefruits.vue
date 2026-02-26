<template>
  <view class="more-food-page">


    <!-- 食物列表（竖向滚动） -->
    <scroll-view class="food-scroll-list" scroll-y="true">
      <view class="food-card" v-for="(item, index) in foodList" :key="index" @click="goToDetail(item)">
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
    </scroll-view>
  </view>
</template>

<script setup>
  import {
    reactive
  } from 'vue'
  import {
    onLoad
  } from '@dcloudio/uni-app'

  // 10项食物数据（可根据需要替换为蔬菜数据）
  const foodList = reactive([{
      id: 1,
      name: '草莓',
      calorie: '30千卡/100克',
      image: '/static/default.gif',
      collected: false
    },
    {
      id: 2,
      name: '橙子',
      calorie: '47千卡/100克',
      image: '/static/default.gif',
      collected: false
    },
    {
      id: 3,
      name: '海棠果',
      calorie: '73千卡/100克',
      image: '/static/default.gif',
      collected: false
    },
    {
      id: 4,
      name: '柠檬',
      calorie: '35千卡/100克',
      image: '/static/default.gif',
      collected: false
    },
    {
      id: 5,
      name: '苹果',
      calorie: '52千卡/100克',
      image: '/static/default.gif',
      collected: false
    },
    {
      id: 6,
      name: '香蕉',
      calorie: '89千卡/100克',
      image: '/static/default.gif',
      collected: false
    },
    {
      id: 7,
      name: '葡萄',
      calorie: '69千卡/100克',
      image: '/static/default.gif',
      collected: false
    },
    {
      id: 8,
      name: '西瓜',
      calorie: '30千卡/100克',
      image: '/static/default.gif',
      collected: false
    },
    {
      id: 9,
      name: '芒果',
      calorie: '60千卡/100克',
      image: '/static/default.gif',
      collected: false
    },
    {
      id: 10,
      name: '猕猴桃',
      calorie: '61千卡/100克',
      image: '/static/default.gif',
      collected: false
    }
  ])

  // 跳转到食物详情页
  const goToDetail = (item) => {
    uni.navigateTo({
      url: `/pages/home/home_search_bar/search_bar_detail/search_bar_detail?foodData=${JSON.stringify(item)}`
    })
  }

  // 切换收藏状态
  const toggleCollect = (item) => {
    item.collected = !item.collected
    uni.showToast({
      title: item.collected ? '已收藏' : '已取消收藏',
      icon: 'none'
    })
  }

  // 页面加载（可在此处请求后端接口替换模拟数据）
  onLoad(() => {
    // 无后端时，使用上面的模拟数据
    // 有后端时，可在此处调用接口获取10项食物数据
  })
</script>

<style scoped>
  .more-food-page {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 16px;
  }


  /* 竖向滚动容器 */
  .food-scroll-list {
    height: calc(100vh - 80px);
    /* 减去标题高度，确保可滚动 */
  }

  .food-card {
    display: flex;
    align-items: center;
    background-color: #fff;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .food-img {
    width: 80px;
    height: 80px;
    border-radius: 8px;
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
</style>