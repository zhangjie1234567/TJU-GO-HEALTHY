<template>
  <view class="home-bg">
    <!-- 食物搜索栏 - 样式对齐 schedule -->
    <view class="search-box">
      <view class="food-search-bar" @click="goToHomeSearchBar" hover-class="search-bar-hover">
        <text class="search-icon">🔍</text>
        <text class="food-search-placeholder">请输入你想了解的食物并点击查看详情</text>
        <text class="menu-icon">✕</text>
      </view>
    </view>
    <!-- 人物形象和AI对话横向排列 - 修复响应式、增加点击反馈 -->
    <view class="home-top-row">
      <!-- 人物形象卡片 - 动态显示emoji和状态 -->
      <view class="avatar-card-wrapper">
        <view class="card-item avatar-card" @click="goToPlanProgress" hover-class="card-hover">
          <text class="avatar-emoji-home">{{ userProgress.avatarEmoji }}</text>
          <text class="avatar-desc-home">{{ userProgress.avatarDesc }}</text>
          <text class="avatar-hint-home">点击查看计划进度</text>
          <view v-if="userProgress.bmi > 0" class="bmi-badge-home">
            <text class="bmi-value-home">{{ userProgress.bmi }}</text>
          </view>
        </view>
      </view>
      <!-- AI对话卡片 - 补全点击事件、增加点击反馈、优化布局 -->
      <view class="ai-card-wrapper">
        <view class="card-item" @click="goToAIChat" hover-class="card-hover">
          <!-- 左下：两个圆圈横排 -->
          <view class="ai-circle-group ai-circle-group-l">
            <image class="ai-circle" :src="assetAiCircle" lazy-load />
            <image class="ai-circle" :src="assetAiCircle" lazy-load />
          </view>
          <!-- 右上：两个圆圈横排 -->
          <view class="ai-circle-group ai-circle-group-r">
            <image class="ai-circle" :src="assetAiCircle" lazy-load />
            <image class="ai-circle" :src="assetAiCircle" lazy-load />
          </view>

          <view class="ai-dialog-main">
            <!-- 蓝色圆角框定位在主图正中间 -->
            <view class="ai-dialog-main-bg"></view>
            <image class="ai-dialog-main-img" :src="assetAiMain" mode="aspectFit" lazy-load />
          </view>
          <view class="ai-dialog-desc">
            拍照识别卡路里<br />语音分析情绪<br />定制食谱
          </view>
        </view>
      </view>
    </view>

    <!-- 可滑动四区容器 - 优化滚动体验、修复高度适配 -->
    <view class="scroll-container" scroll-y="true">
      <view class="home-siqu-container">
        <view class="plan-header-card" @click="goToMyPlan" hover-class="card-hover">
          <view class="plan-header-content">
            <text class="plan-emoji">📋</text>
            <text class="plan-title">我的方案</text>
            <text class="plan-emoji">📋</text>
          </view>
        </view>
        <view class="calories-cards">
          <!-- 早餐 -->
          <view class="calories-item">
            <view class="calories-card" @click="goToSelect('breakfast')" hover-class="calories-card-hover">
              <text class="card-label">{{ calories.breakfast }}千卡</text>
            </view>
            <text class="tag" @click="goToSelect('breakfast')" hover-class="tag-hover">+ 早餐</text>
          </view>
          <!-- 午餐 -->
          <view class="calories-item">
            <view class="calories-card" @click="goToSelect('lunch')" hover-class="calories-card-hover">
              <text class="card-label">{{ calories.lunch }}千卡</text>
            </view>
            <text class="tag" @click="goToSelect('lunch')" hover-class="tag-hover">+ 午餐</text>
          </view>
          <!-- 晚餐 -->
          <view class="calories-item">
            <view class="calories-card" @click="goToSelect('dinner')" hover-class="calories-card-hover">
              <text class="card-label">{{ calories.dinner }}千卡</text>
            </view>
            <text class="tag" @click="goToSelect('dinner')" hover-class="tag-hover">+ 晚餐</text>
          </view>
          <!-- 零食 -->
          <view class="calories-item">
            <view class="calories-card" @click="goToSelect('other')" hover-class="calories-card-hover">
              <text class="card-label">{{ calories.other }}千卡</text>
            </view>
            <text class="tag" @click="goToSelect('other')" hover-class="tag-hover">+ 零食</text>
          </view>
        </view>
        <view class="health-link" @click="showRemindPopup = true" hover-class="link-hover">
          <text class="link-text">— 一键设置健康提醒 —</text>
        </view>
        <!-- 健康提醒弹窗 -->
        <view v-if="showRemindPopup" class="popup-mask" @click.self="closeRemindPopup">
          <view class="popup-content">
            <view class="popup-title">请选择要设置的提醒</view>
            <view class="popup-item" v-for="item in remindItems" :key="item.key" @click="selectRemind(item)">
              <text>{{ item.label }}</text>
            </view>
            <view class="popup-cancel" @click="closeRemindPopup">取消</view>
          </view>
        </view>
        <!-- 时间选择器弹窗 -->
        <view v-if="showTimePicker" class="popup-mask" @click.self="closeTimePicker">
          <view class="popup-content">
            <view class="popup-title">请选择提醒时间</view>
            <picker-view :value="pickerValue" @change="onTimeChange" class="picker-view">
              <picker-view-column>
                <view v-for="(y, i) in years" :key="i">{{y}}年</view>
              </picker-view-column>
              <picker-view-column>
                <view v-for="(m, i) in months" :key="i">{{m}}月</view>
              </picker-view-column>
              <picker-view-column>
                <view v-for="(d, i) in days" :key="i">{{d}}日</view>
              </picker-view-column>
              <picker-view-column>
                <view v-for="(h, i) in hours" :key="i">{{h}}时</view>
              </picker-view-column>
              <picker-view-column>
                <view v-for="(min, i) in minutes" :key="i">{{min}}分</view>
              </picker-view-column>
            </picker-view>
            <view class="popup-btn-row">
              <view class="popup-btn" @click="closeTimePicker">取消</view>
              <view class="popup-btn confirm" @click="confirmTime">确定</view>
            </view>
          </view>
        </view>
        <view class="quick-actions">
          <view v-for="item in quickActions" :key="item.name" class="action-item" @click="goToAction(item.route)"
            hover-class="action-item-hover">
            <view class="action-content">
              <text class="action-emoji">{{ item.emoji }}</text>
              <text class="action-name">{{ item.name }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
  import {
    ref,
    onMounted
  } from 'vue';
  import {
    onLoad,
    onShow
  } from '@dcloudio/uni-app';
  import { getUserProgressData } from './userProgressService.js';

  // 用户进度数据
  const userProgress = ref({
    avatarEmoji: '📈',
    avatarDesc: '健康状态良好',
    bmi: 0
  });

  const assetAiCircle = '/static/AI对话小圆圈.png';
  const assetAiMain = '/static/首页AI对话模块主图.png';

  // 统一路由跳转封装 - 增加异常处理和日志
  function navigateToPage(url) {
    try {
      uni.navigateTo({
        url: url,
        fail: (err) => {
          console.error(`跳转失败：${url}`, err);
          uni.showToast({
            title: '页面跳转失败，请重试',
            icon: 'none',
            duration: 2000
          });
        }
      });
    } catch (e) {
      console.error(`跳转异常：${url}`, e);
      uni.showToast({
        title: '页面不存在',
        icon: 'none',
        duration: 2000
      });
    }
  }

  //跳转到首页搜索栏页面
  function goToHomeSearchBar() {
    navigateToPage('/pages/home/home_search_bar?from=home');
  }
  // 跳转到计划进度页面
  function goToPlanProgress() {
    navigateToPage('/pages/home/plan_progress?from=home');
  }
  // 跳转到AI对话页面
  function goToAIChat() {
    navigateToPage('/pages/home/ai_chat?from=home');
  }
  // 健康提醒弹窗相关
  import {
    ref as vueRef
  } from 'vue';
  const showRemindPopup = vueRef(false);
  const showTimePicker = vueRef(false);
  const remindItems = [{
      key: 'weight',
      label: '设置体重提醒'
    },
    {
      key: 'drink',
      label: '设置饮水提醒'
    },
    {
      key: 'exercise',
      label: '设置运动提醒'
    },
    {
      key: 'fasting',
      label: '设置断食提醒'
    }
  ];
  const selectedRemind = vueRef(null);

  function closeRemindPopup() {
    showRemindPopup.value = false;
  }

  function selectRemind(item) {
    selectedRemind.value = item;
    showRemindPopup.value = false;
    showTimePicker.value = true;
  }

  function closeTimePicker() {
    showTimePicker.value = false;
  }
  // 时间选择器数据
  const now = new Date();
  const years = [];
  for (let y = now.getFullYear(); y <= now.getFullYear() + 2; y++) years.push(y);
  const months = Array.from({
    length: 12
  }, (_, i) => i + 1);
  const days = Array.from({
    length: 31
  }, (_, i) => i + 1);
  const hours = Array.from({
    length: 24
  }, (_, i) => i);
  const minutes = Array.from({
    length: 60
  }, (_, i) => i);
  // pickerValue: [年, 月, 日, 时, 分]的下标
  const pickerValue = vueRef([
    0, now.getMonth(), now.getDate() - 1, now.getHours(), now.getMinutes()
  ]);

  function onTimeChange(e) {
    pickerValue.value = e.detail.value;
  }

  function confirmTime() {
    // 获取选择的时间
    const y = years[pickerValue.value[0]];
    const m = months[pickerValue.value[1]];
    const d = days[pickerValue.value[2]];
    const h = hours[pickerValue.value[3]];
    const min = minutes[pickerValue.value[4]];
    const timeStr =
      `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')} ${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
    // 这里可以调用日历API或保存提醒逻辑
    uni.showToast({
      title: `已为“${selectedRemind.value.label}”设置提醒\n${timeStr}`,
      icon: 'none',
      duration: 2500
    });
    showTimePicker.value = false;
  }
  // 跳转到我的方案页面
  function goToMyPlan() {
    navigateToPage('/pages/home/my_plan?from=home');
  }
  // 快捷功能区数据
  const quickActions = [{
      name: '体重',
      emoji: '⚖️',
      route: '/pages/home/record_weight',
    },
    {
      name: '喝水',
      emoji: '💧',
      route: '/pages/home/drink_water',
    },
    {
      name: '运动',
      emoji: '🏃',
      route: '/pages/home/exercise',
    },
    {
      name: '日记',
      emoji: '📔',
      route: '/pages/home/diary',
    },
  ];
  // 跳转到对应功能页面
  function goToAction(route) {
    navigateToPage(route + '?from=home');
  }
  // 卡路里数据
  const calories = ref({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    other: 0
  });
  // 跳转到选择页面
  function goToSelect(type) {
    let map = {
      breakfast: '/pages/home/select_breakfast',
      lunch: '/pages/home/select_lunch',
      dinner: '/pages/home/select_dinner',
      other: '/pages/home/select_otherfood',
    };
    navigateToPage(map[type] + '?from=home');
  }
  // 加载卡路里数据
  function loadCalories() {
    const today = new Date().toLocaleDateString();
    const saved = JSON.parse(uni.getStorageSync('calories') || '{}');
    if (saved[today]) {
      calories.value = saved[today];
    } else {
      calories.value = {
        breakfast: 0,
        lunch: 0,
        dinner: 0,
        other: 0
      };
    }
  }
  
  // 加载用户进度数据
  function loadUserProgress() {
    try {
      const data = getUserProgressData();
      userProgress.value = {
        avatarEmoji: data.avatarEmoji,
        avatarDesc: data.avatarDesc,
        bmi: data.bmi
      };
    } catch (error) {
      console.error('加载用户进度数据失败:', error);
    }
  }
  
  onMounted(() => {
    loadCalories();
    loadUserProgress();
  });
  
  // ✅ 新增：页面显示时刷新数据，确保BMI实时更新
  onShow(() => {
    loadCalories();
    loadUserProgress();
  });
</script>

<style scoped>
  .popup-mask {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.25);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .popup-content {
    background: #fff;
    border-radius: 12px;
    min-width: 260px;
    max-width: 90vw;
    padding: 24px 18px 18px 18px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .popup-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 18px;
    text-align: center;
  }

  .popup-item {
    padding: 12px 0;
    text-align: center;
    font-size: 16px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background 0.2s;
  }

  .popup-item:last-child {
    border-bottom: none;
  }

  .popup-item:active {
    background: #f5f7fa;
  }

  .popup-cancel {
    margin-top: 16px;
    color: #888;
    text-align: center;
    font-size: 15px;
    cursor: pointer;
  }

  .picker-view {
    width: 100%;
    height: 220px;
    margin: 12px 0;
    background: #f7f7fa;
    border-radius: 8px;
  }

  .popup-btn-row {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
  }

  .popup-btn {
    flex: 1;
    text-align: center;
    padding: 10px 0;
    font-size: 16px;
    border-radius: 8px;
    background: #f0f0f0;
    margin: 0 6px;
    cursor: pointer;
  }

  .popup-btn.confirm {
    background: #53B1EF;
    color: #fff;
    font-weight: 600;
  }

  /* 顶部人物形象和AI对话横向排列 */
  .home-top-row {
    width: calc(100vw - 24px);
    max-width: 460px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin: 14px auto 0 auto;
    box-sizing: border-box;
  }

  .avatar-card-wrapper {
    width: 100%;
  }

  .ai-card-wrapper {
    width: 100%;
  }

  .card-item {
    height: 280px;
    background: linear-gradient(180deg, #ffffff 0%, #f7fbff 100%);
    border-radius: 14px;
    box-shadow: 0 4px 14px rgba(79, 161, 242, 0.14);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    overflow: hidden;
    transition: box-shadow 0.2s;
    position: relative;
  }

  .card-item:hover {
    box-shadow: 0 4px 16px rgba(24, 144, 255, 0.18);
  }

  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #E3F2FD;
    border-radius: 10px;
  }

  /* 动态人物形象样式 */
  .avatar-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .avatar-emoji-home {
    font-size: 70px;
    line-height: 1;
    animation: avatarFloat 3s ease-in-out infinite;
  }

  @keyframes avatarFloat {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .avatar-desc-home {
    font-size: 13px;
    color: #666;
    font-weight: 500;
    text-align: center;
    margin-top: 4px;
  }

  .avatar-hint-home {
    font-size: 18px;
    color: #4FA1F2;
    font-weight: 600; 
    text-align: center;
    margin-top: 6px;
    letter-spacing: 0.5px;
  }

  .bmi-badge-home {
    position: absolute;
    top: 12px;
    right: 12px;
    background: linear-gradient(135deg, #419bf9 0%, #5fb3ff 100%);
    border-radius: 16px;
    padding: 4px 10px;
    box-shadow: 0 2px 8px rgba(79, 161, 242, 0.3);
  }

  .bmi-value-home {
    font-size: 14px;
    color: #ffffff;
    font-weight: bold;
  }

  /* 食物搜索栏 */
  .search-box {
    width: calc(100vw - 24px);
    max-width: 460px;
    margin-top: 18px;
    margin-bottom: 4px;
  }

  .food-search-bar {
    width: calc(100vw - 24px);
    max-width: 460px;
    height: 40px;
    background: #fff;
    border-radius: 25px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 12px;
    margin: 0 auto;
    box-sizing: border-box;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(79, 161, 242, 0.16);
  }

  .search-icon {
    font-size: 16px;
    line-height: 1;
  }

  .food-search-placeholder {
    color: #b5bcc6;
    font-size: 14px;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .menu-icon {
    font-size: 16px;
    color: #4FA1F2;
    line-height: 1;
  }

  body,
  .home-bg {
    background: linear-gradient(135deg, #E3F2FD 0%, #F0F9FF 100%);
    min-height: 100vh;
    width: 100vw;
  }

  .home-bg {
    min-height: 100vh;
    width: 100vw;
    position: relative;
    overflow-x: hidden !important;
    /* 强化：根容器彻底禁止横向滚动 */
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* 替换原有.scroll-container 样式中错误的 // 注释，同时新增强制禁止横向滚动的关键属性 */
  .scroll-container {
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    overflow-x: hidden !important;
    /* 强制禁止横向滚动 */
    max-height: 70vh;
    margin-top: 16px;
    box-sizing: border-box;
    padding: 0;
    position: relative;
    /* 新增：稳定布局 */
    left: 0;
    /* 新增：防止偏移 */
    right: 0;
    /* 新增：防止偏移 */
  }

  .home-siqu-container {
    width: calc(100vw - 24px);
    max-width: 460px;
    background: rgba(255, 255, 255, 0.92);
    border-radius: 16px;
    box-shadow: 0 6px 16px rgba(79, 161, 242, 0.12);
    padding: 18px 16px 16px 16px;
    margin: 0 0 8px 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-sizing: border-box;
    overflow-x: hidden !important;
    /* 强制禁止子容器横向溢出 */
  }

  /* AI对话卡片 */
  .ai-dialog-card {
    width: 366px;
    min-height: 150px;
    background: #fff;
    border-radius: 21px;
    box-shadow: 0 2px 12px rgba(79, 161, 242, 0.12);
    margin: 24px auto 0 auto;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 16px 20px 16px;
  }

  /* 小圆圈组容器 */
  .ai-circle-group {
    display: flex;
    gap: 0px;
    /* 组内两个圆圈的间距 */
    position: absolute;
  }

  /* 左下组位置 */
  .ai-circle-group-l {
    left: 12px;
    bottom: 12px;
  }

  /* 右上组位置 */
  .ai-circle-group-r {
    right: 12px;
    top: 12px;
  }

  /* 小圆圈基础样式 */
  .ai-circle {
    width: 10px;
    height: 10px;
  }

  .ai-dialog-main {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    /* 新增：让标题背景绝对定位以主图容器为基准 */
  }

  .ai-dialog-main-img {
    width: 130px;
    height: 130px;
    margin-bottom: 8px;
    z-index: 2;
    /* 图片层级高于背景 */
    position: relative;
    /* 开启z-index生效 */
  }

  /* 背景层样式调整 */
  .ai-dialog-main-bg {
    background: linear-gradient(135deg, #4FA1F2 0%, #80D0FF 100%);
    border-radius: 20px;
    /* 尺寸为图片的1/3：130px / 3 ≈ 43.3px */
    width: 90px;
    height: 50px;
    /* 绝对定位垂直居中 */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -55%);
    z-index: 1;
    /* 背景层级低于图片 */
  }

  .ai-dialog-desc {
    margin-top: 12px;
    color: #333;
    font-size: 15px;
    text-align: center;
    line-height: 1.7;
  }

  /* 我的方案卡片区 - 参考schedule设计 */
  .plan-header-card {
    width: 100%;
    background: linear-gradient(135deg, #6BCB77 0%, #4ECDC4 100%);
    border-radius: 20px;
    box-shadow: 0 6px 16px rgba(76, 203, 119, 0.25);
    padding: 24px 20px;
    margin-bottom: 8px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    box-sizing: border-box;
    max-width: 100%;
  }

  .plan-header-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.1);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .plan-header-card:hover::before {
    opacity: 1;
  }

  .plan-header-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(76, 203, 119, 0.35);
  }

  .plan-header-card:active {
    transform: translateY(0) scale(0.98);
  }

  .plan-header-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    position: relative;
    z-index: 1;
  }

  .plan-title {
    font-size: 22px;
    font-weight: 700;
    color: #ffffff;
    background: transparent;
    border-radius: 8px;
    padding: 0 12px;
    letter-spacing: 1.5px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  .plan-emoji {
    font-size: 36px;
    line-height: 1;
    filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.2));
    animation: gentle-bounce 2s ease-in-out infinite;
  }

  @keyframes gentle-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
  }

  /* 卡片区 */
  .calories-cards {
    display: flex;
    gap: 8px;
    justify-content: space-between;
  }

  .calories-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
  }

  .calories-card {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(135deg, rgba(79, 161, 242, 0.18), rgba(128, 208, 255, 0.18));
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(79, 161, 242, 0.12);
    padding: 18px 0;
    cursor: pointer;
  }

  .calories-card:hover {
    box-shadow: 0 2px 8px rgba(79, 161, 242, 0.16);
  }

  .card-label {
    font-size: 15px;
    color: #2C3E50;
    font-weight: 500;
    border-radius: 6px;
    padding: 4px 10px;
    min-width: 56px;
    text-align: center;
  }

  .tag {
    font-size: 13px;
    color: #2b5f91;
    background: rgba(79, 161, 242, 0.1);
    border-radius: 6px;
    padding: 3px 14px;
    text-align: center;
    cursor: pointer;
    font-weight: 600;
    white-space: nowrap;
  }

  .tag:hover {
    background: #e3f0fc;
  }

  .health-link {
    text-align: center;
    margin-top: 4px;
  }

  .link-text {
    font-size: 13px;
    color: #53B1EF;
    letter-spacing: 1px;
  }

  /* 快捷功能区 */
  .quick-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 14px 14px;
    margin-top: 8px;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box;
    padding: 0;
  }

  .action-item {
    width: calc(50% - 7px);
    height: 90px;
    border-radius: 20px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
    padding: 16px 12px;
    margin-bottom: 0;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: all 0.3s ease;
    box-sizing: border-box;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }

  /* 为不同功能项设置不同渐变背景 - 参考schedule风格 */
  .action-item:nth-child(1) {
    background: linear-gradient(135deg, #FFB6C1 0%, #FFA07A 100%);
  }

  .action-item:nth-child(2) {
    background: linear-gradient(135deg, #87CEEB 0%, #4FA1F2 100%);
  }

  .action-item:nth-child(3) {
    background: linear-gradient(135deg, #FF6B9D 0%, #C06C84 100%);
  }

  .action-item:nth-child(4) {
    background: linear-gradient(135deg, #FFD93D 0%, #FFA07A 100%);
  }

  .action-item:nth-child(5) {
    background: linear-gradient(135deg, #A8E6CF 0%, #6BCB77 100%);
  }

  .action-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.15);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .action-item:hover::before {
    opacity: 1;
  }

  .action-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
  }

  .action-item:active {
    transform: translateY(-2px) scale(0.97);
  }

  .action-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    position: relative;
    z-index: 1;
  }

  .action-emoji {
    font-size: 40px;
    line-height: 1;
    filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.25));
    transition: transform 0.3s ease;
  }

  .action-item:hover .action-emoji {
    transform: scale(1.1) rotate(5deg);
  }

  .action-name {
    font-size: 14px;
    color: #ffffff;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    margin-top: 4px;
  }

  .search-bar-hover {
    opacity: 0.92;
  }

  .card-hover {
    transform: scale(0.98);
  }

  .calories-card-hover {
    transform: translateY(-1px);
    opacity: 0.95;
  }

  .tag-hover {
    background: rgba(79, 161, 242, 0.18);
  }

  .link-hover {
    opacity: 0.88;
  }

  .action-item-hover {
    transform: scale(0.97);
  }
</style>