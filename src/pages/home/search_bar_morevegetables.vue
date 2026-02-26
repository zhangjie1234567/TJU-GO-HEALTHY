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

  // 10项蔬菜数据（适配无后端场景的模拟数据）
  const foodList = reactive([{
      id: 1,
      name: '西红柿',
      calorie: '18千卡/100克',
      image: '/static/default.gif',
      collected: false
    },
    {
      id: 2,
      name: '黄瓜',
      calorie: '16千卡/100克',
      image: '/static/default.gif',
      collected: false
    },
    {
      id: 3,
      name: '西兰花',
      calorie: '34千卡/100克',
      image: '/static/default.gif',
      collected: false
    },
    {
      id: 4,
      name: '胡萝卜',
      calorie: '41千卡/100克',
      image: '/static/default.gif',
      collected: false
    },
    {
      id: 5,
      name: '菠菜',
      calorie: '28千卡/100克',
      image: '/static/default.gif',
      collected: false
    },
    {
      id: 6,
      name: '生菜',
      calorie: '16千卡/100克',
      image: '/static/default.gif',
      collected: false
    },
    {
      id: 7,
      name: '芹菜',
      calorie: '16千卡/100克',
      image: '/static/default.gif',
      collected: false
    },
    {
      id: 8,
      name: '土豆',
      calorie: '77千卡/100克',
      image: '/static/default.gif',
      collected: false
    },
    {
      id: 9,
      name: '青椒',
      calorie: '25千卡/100克',
      image: '/static/default.gif',
      collected: false
    },
    {
      id: 10,
      name: '冬瓜',
      calorie: '12千卡/100克',
      image: '/static/default.gif',
      collected: false
    }
  ])

  // 跳转到食物详情页（和首页/水果更多页逻辑一致）
  const goToDetail = (item) => {
    uni.navigateTo({
      url: `/pages/home/home_search_bar/search_bar_detail/search_bar_detail?foodData=${JSON.stringify(item)}`
    })
  }

  // 切换收藏状态（本地临时，无后端也可正常交互）
  const toggleCollect = (item) => {
    item.collected = !item.collected
    uni.showToast({
      title: item.collected ? '已收藏' : '已取消收藏',
      icon: 'none'
    })
  }

  // 页面加载钩子（后续对接后端时，可在此处替换为接口请求）
  onLoad(() => {
    // 无后端：使用模拟数据；有后端时，替换为以下逻辑
    // uni.request({
    //   url: '你的后端接口/vegetables/list',
    //   success: (res) => {
    //     foodList.splice(0, foodList.length, ...res.data.data)
    //   }
    // })
  })
</script>

<style scoped>
  /* 样式和水果更多页完全一致，无需修改 */
  .more-food-page {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding: 16px;
  }



  /* 竖向滚动容器：高度自适应，确保可手动滚动 */
  .food-scroll-list {
    height: calc(100vh - 80px);
    /* 减去标题高度，占满剩余屏幕 */
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