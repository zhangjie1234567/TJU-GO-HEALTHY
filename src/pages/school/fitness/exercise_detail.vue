<template>
  <view class="page">
    <view class="content">
      <text class="page-title">详细锻炼方案</text>
      
      <view class="exercise-card">
        <text class="section-title">一、热身环节（5分钟）</text>
        <view class="exercise-item">
          <text class="exercise-name">原地高抬腿</text>
          <text class="exercise-desc">30秒，保持上半身挺直，膝盖尽量抬高至腰部高度，激活下肢肌肉。</text>
        </view>
        <view class="exercise-item">
          <text class="exercise-name">手臂环绕</text>
          <text class="exercise-desc">前后各20秒，双手自然下垂后缓慢环绕，放松肩颈与手臂关节。</text>
        </view>
        <view class="exercise-item">
          <text class="exercise-name">弓步压腿</text>
          <text class="exercise-desc">左右腿各15秒，前腿屈膝不超过脚尖，后腿伸直，感受大腿前侧与后侧拉伸。</text>
        </view>
        <view class="exercise-item">
          <text class="exercise-name">躯干扭转</text>
          <text class="exercise-desc">左右各20次，双脚与肩同宽，双手叉腰，缓慢左右扭转上半身，活动腰部。</text>
        </view>
      </view>
      
      <view class="exercise-card">
        <text class="section-title">二、核心训练（15分钟）</text>
        <view class="exercise-item">
          <text class="exercise-name">平板支撑</text>
          <text class="exercise-desc">3组，每组30-45秒，手肘撑地与肩同宽，身体呈一条直线，收紧核心避免塌腰。</text>
        </view>
        <view class="exercise-item">
          <text class="exercise-name">仰卧卷腹</text>
          <text class="exercise-desc">3组，每组15次，屈膝平躺，双手轻扶耳侧，用腹部发力带动上半身起身（避免用脖子发力）。</text>
        </view>
        <view class="exercise-item">
          <text class="exercise-name">站姿后腿踢</text>
          <text class="exercise-desc">3组，每组左右腿各12次，双手扶墙保持平衡，后腿缓慢向后踢至臀部位置，锻炼臀部与大腿后侧。</text>
        </view>
        <view class="exercise-item">
          <text class="exercise-name">简易波比跳（新手版）</text>
          <text class="exercise-desc">3组，每组8-10次，站立屈膝下蹲，双手撑地后双脚向后跳成平板（可膝盖着地），再收回双脚站起，提升心肺功能。</text>
        </view>
      </view>
      
      <view class="exercise-card">
        <text class="section-title">三、放松拉伸（10分钟）</text>
        <view class="exercise-item">
          <text class="exercise-name">大腿前侧拉伸</text>
          <text class="exercise-desc">左右腿各30秒，单脚站立，另一只脚向后勾住脚踝，拉向臀部，感受大腿前侧紧绷感。</text>
        </view>
        <view class="exercise-item">
          <text class="exercise-name">小腿拉伸</text>
          <text class="exercise-desc">左右腿各30秒，面对墙站立，前腿屈膝，后腿伸直脚跟贴地，身体前倾，放松小腿肌肉。</text>
        </view>
        <view class="exercise-item">
          <text class="exercise-name">腰部拉伸</text>
          <text class="exercise-desc">30秒，俯卧后双手撑地缓慢起身，臀部下压，感受腰部拉伸。</text>
        </view>
        <view class="exercise-item">
          <text class="exercise-name">肩颈放松</text>
          <text class="exercise-desc">2分钟，双手交叉抱头后缓慢向后拉伸，再左右侧屈颈部，缓解肩颈紧张。</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {})
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

.page-title {
  display: block; 
  font-size:34rpx; 
  font-weight:700; 
  margin-bottom: 20rpx; 
  margin-left: 10rpx;
}

.exercise-card {
  background: #BEEAFB;
  border-radius: 30rpx;
  padding: 24rpx;
  margin-bottom: 28rpx;
}

.section-title {
  display: block; 
  font-size:34rpx; 
  font-weight:700; 
  margin-bottom: 20rpx; 
  margin-left: 10rpx;
}

.exercise-item {
  margin-bottom: 16rpx;
}

.exercise-name {
  font-size: 26rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
  display: block;
}

.exercise-desc {
  font-size: 24rpx;
  line-height: 1.6;
}
</style>