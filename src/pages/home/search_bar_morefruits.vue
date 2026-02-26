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
          <text class="collect-icon">{{ item.collected ? '★' : '☆' }}</text>
          <text class="collect-text">{{ item.collected ? '已收藏' : '收藏' }}</text>
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
    },
    {
      id: 5,
      name: '苹果',
      calorie: '52千卡/100克',
      image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=640&q=80',
      collected: false
    },
    {
      id: 6,
      name: '香蕉',
      calorie: '89千卡/100克',
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=640&q=80',
      collected: false
    },
    {
      id: 7,
      name: '葡萄',
      calorie: '69千卡/100克',
      image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=640&q=80',
      collected: false
    },
    {
      id: 8,
      name: '西瓜',
      calorie: '30千卡/100克',
      image: 'https://images.unsplash.com/photo-1563114773-84221bd62daa?auto=format&fit=crop&w=640&q=80',
      collected: false
    },
    {
      id: 9,
      name: '芒果',
      calorie: '60千卡/100克',
      image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=640&q=80',
      collected: false
    },
    {
      id: 10,
      name: '猕猴桃',
      calorie: '61千卡/100克',
      image: 'https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?auto=format&fit=crop&w=640&q=80',
      collected: false
    }
  ])

  // 跳转到食物详情页
  const goToDetail = (item) => {
    uni.navigateTo({
      url: `/pages/home/search_bar_detail?foodData=${JSON.stringify(item)}`
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
</style>