<template>
  <view class="container">
    <!-- 顶部导航 -->
    <view class="nav-bar">
      <text class="back-btn" @click="goBack">← 返回</text>
      <text class="nav-title">饮品详情</text>
      <text class="fav-btn" @click="toggleFavorite(drink.id)" 
            :class="{ collected: isFavorited(drink.id) }">{{ isFavorited(drink.id) ? '★' : '☆' }}</text>
    </view>

    <!-- 饮品图片 -->
    <view class="image-section">
      <image class="drink-image" :src="drink.image" mode="aspectFill"></image>
      <view class="badge" v-if="drink.badge">{{ drink.badge }}</view>
    </view>

    <!-- 基本信息 -->
    <view class="info-section">
      <view class="title-row">
        <text class="drink-title">{{ drink.name }}</text>
        <text class="category-tag">{{ drink.category }}</text>
      </view>

      <view class="stats-grid">
        <view class="stat-box">
          <text class="stat-icon">🔥</text>
          <text class="stat-label">热量</text>
          <text class="stat-value">{{ drink.cal }}</text>
        </view>
        <view class="stat-box">
          <text class="stat-icon">☕</text>
          <text class="stat-label">咖啡因</text>
          <text class="stat-value">{{ drink.caffeine }}</text>
        </view>
        <view class="stat-box">
          <text class="stat-icon">💧</text>
          <text class="stat-label">含水量</text>
          <text class="stat-value">85-95%</text>
        </view>
        <view class="stat-box">
          <text class="stat-icon">🥫</text>
          <text class="stat-label">建议量</text>
          <text class="stat-value">250ml</text>
        </view>
      </view>
    </view>

    <!-- 详细信息 -->
    <view class="detail-sections">
      <!-- 简介 -->
      <view class="section">
        <text class="section-title">📖 简介</text>
        <text class="section-content">{{ drinkDetails.intro }}</text>
      </view>

      <!-- 营养成分 -->
      <view class="section">
        <text class="section-title">🥗 营养成分 (每250ml)</text>
        <view class="nutrition-list">
          <view v-for="(item, index) in drinkDetails.nutrition" :key="index" class="nutrition-item">
            <text class="nut-label">{{ item.label }}</text>
            <text class="nut-value">{{ item.value }}</text>
          </view>
        </view>
      </view>

      <!-- 健康益处 -->
      <view class="section">
        <text class="section-title">💪 健康益处</text>
        <view class="benefits-list">
          <view v-for="(benefit, index) in drinkDetails.benefits" :key="index" class="benefit-item">
            <text class="benefit-number">{{ index + 1 }}</text>
            <text class="benefit-text">{{ benefit }}</text>
          </view>
        </view>
      </view>

      <!-- 饮用建议 -->
      <view class="section">
        <text class="section-title">⏰ 饮用建议</text>
        <text class="suggestion-item">📅 频率：{{ drinkDetails.frequency }}</text>
        <text class="suggestion-item">⏱️ 最佳时间：{{ drinkDetails.bestTime }}</text>
        <text class="suggestion-item">⚖️ 推荐用量：{{ drinkDetails.amount }}</text>
        <text class="suggestion-item">☝️ 特殊人群：{{ drinkDetails.special }}</text>
      </view>

      <!-- 配方建议 -->
      <view class="section">
        <text class="section-title">🍯 配方建议</text>
        <view class="recipe-box">
          <text v-for="(recipe, index) in drinkDetails.recipes" :key="index" class="recipe-item">
            • {{ recipe }}
          </text>
        </view>
      </view>

      <!-- 注意事项 -->
      <view class="section">
        <text class="section-title">⚠️ 注意事项</text>
        <view class="caution-box">
          <text v-for="(caution, index) in drinkDetails.cautions" :key="index" class="caution-item">
            • {{ caution }}
          </text>
        </view>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="action-bar">
      <view class="action-btn favorite-btn" @click="toggleFavorite(drink.id)">
        {{ isFavorited(drink.id) ? '已收藏' : '+ 收藏' }}
      </view>
      <view class="action-btn share-btn" @click="shareDrink">📤 分享推荐</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const favorites = ref([])

const drink = ref({
  id: 1,
  name: '经典绿茶',
  category: '茶类',
  cal: '0-2 千卡',
  caffeine: '25-35mg',
  badge: '推荐',
  image: 'https://via.placeholder.com/600x300/4FA1F2/FFFFFF?text=绿茶'
})

const drinkDetails = ref({
  intro: '绿茶是一种经过最少加工的茶叶，保留了茶叶原始的绿色和众多活性成分。作为世界上消费最多的茶类之一，绿茶因其清爽的口感和强大的抗氧化特性而广受欢迎。',
  nutrition: [
    { label: '卡路里', value: '0-2 kcal' },
    { label: '蛋白质', value: '0.2g' },
    { label: '碳水化合物', value: '0g' },
    { label: '儿茶素 (EGCG)', value: '25-50mg' },
    { label: '咖啡因', value: '25-35mg' },
    { label: '多酚', value: '50-100mg' }
  ],
  benefits: [
    '强大的抗氧化作用 - 儿茶素（EGCG）是最有效的天然抗氧化剂之一',
    '加强新陈代谢 - 绿茶提取物能增加脂肪氧化和热量消耗',
    '改善心血管健康 - 定期饮用可降低胆固醇和血压',
    '保护脑认知 - L-茶氨酸与咖啡因协同作用，提高注意力和放松',
    '促进体重管理 - 低卡且能增加脂肪燃烧',
    '强化骨密度 - 长期饮用与骨质密度改善相关'
  ],
  frequency: '每天1-3杯',
  bestTime: '上午9-11点或下午3-5点（避免睡前）',
  amount: '约3-5克茶叶配250ml温水，冲泡3-5分钟',
  special: '孕妇应限制摄入；胃敏感人群建议饭后饮用；服用某些药物的请咨询医生',
  recipes: [
    '蜂蜜绿茶：冲泡后加入1茶匙蜂蜜，增加甜度和润肺效果',
    '绿茶+柠檬：补充维生素C，增强吸收效率',
    '绿茶+薄荷：清凉舒爽，帮助消化',
    '冷泡绿茶：前一晚用冷水浸泡，低温冲泡更能保留营养'
  ],
  cautions: [
    '不建议空腹饮用，可能引起胃部不适',
    '睡前4小时避免饮用，可能影响睡眠质量',
    '过量饮用可能导致咖啡因过敏（如心悸、头晕）',
    '冲泡水温：65-75℃为最佳，过热会破坏有效成分',
    '存储：避免阳光直射和高温，置于阴凉干燥处'
  ]
})

// 加载收藏
onMounted(() => {
  try {
    const saved = uni.getStorageSync('drink_favorites')
    if (saved) {
      favorites.value = saved
    }
  } catch (e) {
    console.error('加载收藏失败', e)
  }
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
    uni.setStorageSync('drink_favorites', favorites.value)
  } catch (e) {
    console.error('保存收藏失败', e)
  }
}

// 检查是否收藏
const isFavorited = (id) => {
  return favorites.value.includes(id)
}

const shareDrink = () => {
  uni.showToast({
    title: `已分享 ${drink.value.name}`,
    icon: 'success'
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
  padding-bottom: 120rpx;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background: white;
  box-shadow: 0 2rpx 8rpx rgba(79, 161, 242, 0.1);

  .back-btn, .fav-btn {
    font-size: 28rpx;
    color: $main-blue;
    font-weight: 600;
  }

  .nav-title {
    font-size: 32rpx;
    font-weight: 700;
    color: #333;
  }

  .fav-btn.collected {
    color: #FFB347;
  }
}

.image-section {
  position: relative;
  width: 100%;
  height: 350rpx;
  overflow: hidden;

  .drink-image {
    width: 100%;
    height: 100%;
  }

  .badge {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    background: rgba(255, 107, 107, 0.95);
    color: white;
    padding: 8rpx 16rpx;
    border-radius: 16rpx;
    font-size: 24rpx;
    font-weight: 600;
  }
}

.info-section {
  background: white;
  margin: -30rpx 16rpx 0;
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(79, 161, 242, 0.1);
  position: relative;
  z-index: 1;

  .title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .drink-title {
      font-size: 36rpx;
      font-weight: 700;
      color: #333;
    }

    .category-tag {
      background: rgba(79, 161, 242, 0.1);
      color: $main-blue;
      padding: 6rpx 12rpx;
      border-radius: 12rpx;
      font-size: 22rpx;
      font-weight: 600;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12rpx;

    .stat-box {
      background: rgba(79, 161, 242, 0.06);
      border-radius: 16rpx;
      padding: 16rpx;
      text-align: center;

      .stat-icon {
        display: block;
        font-size: 32rpx;
        margin-bottom: 8rpx;
      }

      .stat-label {
        display: block;
        font-size: 18rpx;
        color: #999;
        margin-bottom: 4rpx;
      }

      .stat-value {
        display: block;
        font-size: 22rpx;
        font-weight: 700;
        color: $main-blue;
      }
    }
  }
}

.detail-sections {
  padding: 24rpx;
}

.section {
  background: white;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);

  .section-title {
    display: block;
    font-size: 28rpx;
    font-weight: 700;
    color: #333;
    margin-bottom: 16rpx;
    padding-bottom: 12rpx;
    border-bottom: 3rpx solid $main-blue;
  }

  .section-content {
    font-size: 26rpx;
    color: #666;
    line-height: 1.8;
  }

  .nutrition-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12rpx;

    .nutrition-item {
      background: rgba(79, 161, 242, 0.06);
      padding: 12rpx;
      border-radius: 12rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .nut-label {
        font-size: 24rpx;
        color: #666;
        font-weight: 500;
      }

      .nut-value {
        font-size: 22rpx;
        font-weight: 700;
        color: $main-blue;
      }
    }
  }

  .benefits-list {
    .benefit-item {
      display: flex;
      gap: 16rpx;
      margin-bottom: 12rpx;

      .benefit-number {
        background: $main-blue;
        color: white;
        width: 36rpx;
        height: 36rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 20rpx;
        flex-shrink: 0;
      }

      .benefit-text {
        font-size: 24rpx;
        color: #666;
        line-height: 1.6;
      }
    }
  }

  .suggestion-item {
    display: block;
    font-size: 24rpx;
    color: #666;
    line-height: 2;
  }

  .recipe-box {
    background: rgba(79, 161, 242, 0.06);
    padding: 16rpx;
    border-radius: 12rpx;

    .recipe-item {
      display: block;
      font-size: 24rpx;
      color: #666;
      line-height: 2;
    }
  }

  .caution-box {
    background: rgba(255, 193, 7, 0.1);
    padding: 16rpx;
    border-radius: 12rpx;
    border-left: 4rpx solid #FFC107;

    .caution-item {
      display: block;
      font-size: 24rpx;
      color: #856404;
      line-height: 2;
    }
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12rpx;
  padding: 12rpx 16rpx;
  background: white;
  border-top: 1rpx solid #f0f0f0;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.08);

  .action-btn {
    flex: 1;
    height: 70rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 12rpx;
    font-size: 26rpx;
    font-weight: 600;

    &.favorite-btn {
      background: $main-blue;
      color: white;
    }

    &.share-btn {
      background: white;
      color: $main-blue;
      border: 2rpx solid $main-blue;
    }
  }
}
</style>