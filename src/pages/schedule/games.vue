<template>
  <view class="games-container">
    <view class="games-list">
      <!-- 游戏头部 -->
      <view class="games-header">
        <text class="games-title">3大高端体感游戏等你挑战！</text>
      </view>

      <!-- 深蹲挑战 -->
      <view class="game-item" @click="goToGame('squat')">
        <view class="game-icon">🏋️</view>
        <view class="game-info">
          <text class="game-name">智能深蹲挑战</text>
          <text class="game-detail">双手握持手机，自动识别深蹲动作！</text>
        </view>
        <view class="stats-badge">
          <text class="badge-text">加速度</text>
        </view>
        <text class="game-arrow">→</text>
      </view>

      <!-- 平衡保持 -->
      <view class="game-item" @click="goToGame('balance')">
        <view class="game-icon">🧘</view>
        <view class="game-info">
          <text class="game-name">平衡保持挑战</text>
          <text class="game-detail">保持手机平稳，挑战最长平衡时间！</text>
        </view>
        <view class="stats-badge">
          <text class="badge-text">陀螺仪</text>
        </view>
        <text class="game-arrow">→</text>
      </view>

      <!-- 拳击训练 -->
      <view class="game-item" @click="goToGame('boxing')">
        <view class="game-icon">🥊</view>
        <view class="game-info">
          <text class="game-name">爆发力拳击训练</text>
          <text class="game-detail">挥拳出击，检测爆发力和连击！</text>
        </view>
        <view class="stats-badge">
          <text class="badge-text">60秒</text>
        </view>
        <text class="game-arrow">→</text>
      </view>

      <!-- 提示 -->
      <view class="game-tips">
        <text class="tips-icon">⚡</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onMounted } from 'vue'

const goBack = () => {
  uni.navigateBack()
}

const goToGame = (gameType) => {
  let url = ''
  
  if (gameType === 'squat') {
    url = '/pages/schedule/game_squat'
  } else if (gameType === 'balance') {
    url = '/pages/schedule/game_balance'
  } else if (gameType === 'boxing') {
    url = '/pages/schedule/game_boxing'
  }
  
  if (url) {
    uni.navigateTo({ url })
  }
}

onMounted(() => {
  // 页面初始化
})
</script>

<style lang="scss" scoped>
$main-blue: #4FA1F2;
$light-blue: #80D0FF;
$bg-blue: #E3F2FD;
$text-dark: #333;

.games-container {
  background: linear-gradient(135deg, $bg-blue 0%, #F0F9FF 100%);
  min-height: 100vh;
  padding: 0;
}

.games-list {
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
    font-size: 32rpx;
    font-weight: 700;
    color: #333;
  }
}

.games-header {
  text-align: center;
  padding: 30rpx 20rpx 20rpx;
  margin: 0 20rpx;

  .games-title {
    font-size: 36rpx;
    font-weight: 700;
    color: $text-dark;
    display: block;
    margin-bottom: 12rpx;
  }

  .games-desc {
    font-size: 22rpx;
    color: #888;
    display: block;
  }
}

.game-item {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 20rpx;
  padding: 20rpx 16rpx;
  margin: 0 20rpx 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);
  transition: all 0.2s ease;

  &:active {
    transform: translateY(-2rpx);
    box-shadow: 0 8rpx 20rpx rgba(79, 161, 242, 0.12);
  }

  .game-icon {
    font-size: 56rpx;
    margin-right: 16rpx;
    flex-shrink: 0;
  }

  .game-info {
    flex: 1;

    .game-name {
      font-size: 28rpx;
      font-weight: 700;
      color: $text-dark;
      display: block;
      margin-bottom: 6rpx;
    }

    .game-detail {
      font-size: 20rpx;
      color: #999;
      display: block;
    }
  }

  .stats-badge {
    background: rgba(79, 161, 242, 0.1);
    border: 1rpx solid rgba(79, 161, 242, 0.2);
    border-radius: 12rpx;
    padding: 8rpx 14rpx;
    margin-right: 12rpx;
    flex-shrink: 0;

    .badge-text {
      font-size: 18rpx;
      color: $main-blue;
      font-weight: 600;
    }
  }

  .game-arrow {
    font-size: 32rpx;
    color: $main-blue;
    flex-shrink: 0;
    margin-left: 8rpx;
  }
}

.game-tips {
  background: linear-gradient(135deg, rgba(79, 161, 242, 0.1), rgba(128, 208, 255, 0.1));
  border: 2rpx solid rgba(79, 161, 242, 0.2);
  border-radius: 16rpx;
  padding: 20rpx 16rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin: 40rpx 20rpx 0;

  .tips-icon {
    font-size: 32rpx;
    flex-shrink: 0;
  }

  .tips-text {
    font-size: 20rpx;
    color: $text-dark;
    line-height: 1.5;
  }
}
</style>
