<template>
  <view class="page">
    <view class="content">
      <text class="page-title">体测数据详情</text>
      
      <view class="detail-card">
        <!-- 布局逻辑：项目名(左) | 成绩值(中) | 分数(右) | 等级(右) -->
        <view class="detail-item">
          <text class="detail-label">1000米跑</text>
          <text class="detail-value">3分56秒</text>
          <text class="detail-score">92</text>
          <text class="detail-level">优秀</text>
        </view>
        
        <view class="detail-item">
          <text class="detail-label">引体向上</text>
          <text class="detail-value">10个</text>
          <text class="detail-score">85</text>
          <text class="detail-level">良好</text>
        </view>
        
        <view class="detail-item">
          <text class="detail-label">立定跳远</text>
          <text class="detail-value">2.56米</text>
          <text class="detail-score">90</text>
          <text class="detail-level">优秀</text>
        </view>
        
        <view class="detail-item">
          <text class="detail-label">肺活量</text>
          <text class="detail-value">5400ml</text>
          <text class="detail-score">95</text>
          <text class="detail-level">优秀</text>
        </view>
        
        <view class="detail-item">
          <text class="detail-label">50米跑</text>
          <text class="detail-value">6.3秒</text>
          <text class="detail-score">91</text>
          <text class="detail-level">优秀</text>
        </view>
      </view>
      
      <text class="section-title">成绩分析</text>
      <view class="analysis-card">
        <text class="analysis-text">
          整体体测成绩优秀，耐力和爆发力表现突出。建议继续保持锻炼习惯，可适当增加力量训练以提升引体向上成绩。
        </text>
      </view>
    </view>
  </view>
</template>

<script setup>
/**
 * 体测详情页面逻辑
 * 采用 Composition API 风格
 */
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #fff;
  padding-top: 24rpx;
  font-family: "PingFang SC", "Helvetica Neue", "Microsoft Yahei", Arial, sans-serif;
}

.content {
  padding: 24rpx;
}

.page-title, .section-title {
  display: block; 
  font-size: 34rpx; 
  font-weight: 700; 
  margin-bottom: 24rpx; 
  margin-left: 10rpx;
  color: #000;
}

.detail-card {
  background: #BEEAFB;
  border-radius: 30rpx;
  padding: 36rpx 28rpx; // 适当增加内边距
  margin-bottom: 40rpx;
}

.detail-item {
  display: grid;
  /**
   * 关键布局：
   * 160rpx: 保证左侧项目名对齐
   * 1fr: 中间自适应空间，用于居中显示成绩
   * 80rpx + 80rpx: 右侧分数和等级固定宽度
   * 因为 160 = 80 + 80，所以 1fr 会在视觉正中心
   */
  grid-template-columns: 160rpx 1fr 80rpx 80rpx; 
  gap: 10rpx;
  align-items: center;
  margin-bottom: 28rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.detail-label {
  font-weight: 700;
  font-size: 28rpx;
  text-align: left;
  color: #333;
}

.detail-value {
  font-weight: 700;
  font-size: 30rpx; // 稍微调大成绩值，突出重点
  text-align: center; // 核心修改：让具体成绩在中间列居中
  color: #333;
}

.detail-score {
  font-size: 26rpx;
  font-weight: 700;
  color: #444;
  text-align: right; // 分数向右对齐，紧贴等级
}

.detail-level {
  font-size: 24rpx;
  color: #007AFF;
  font-weight: 700;
  text-align: right; // 等级固定在最右侧
}

.analysis-card {
  background: #BEEAFB;
  border-radius: 30rpx;
  padding: 30rpx;
}

.analysis-text {
  font-size: 26rpx;
  line-height: 1.7;
  color: #333;
  text-align: justify; // 文字两端对齐，更工整
}
</style>