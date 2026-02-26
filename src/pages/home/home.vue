<template>
  <view class="home-bg">
    <!-- 食物搜索栏 - 增加点击反馈、优化语义 -->
    <view class="food-search-bar" @click="goToHomeSearchBar" hover-class="search-bar-hover">
      <text class="food-search-placeholder">请输入你想了解的食物并点击查看详情</text>
      <image class="food-search-icon" src="/static/搜索图标.png" mode="aspectFit" lazy-load />
    </view>
    <!-- 人物形象和AI对话横向排列 - 修复响应式、增加点击反馈 -->
    <view class="home-top-row">
      <!-- 人物形象卡片 - 增加点击反馈 -->
      <view class="card-row-item" @click="goToPlanProgress" hover-class="card-hover">
        <image class="avatar-img" src="/static/首页人物图.png" mode="aspectFill" lazy-load />
      </view>
      <!-- AI对话卡片 - 补全点击事件、增加点击反馈、优化布局 -->
      <view class="card-row-item" @click="goToAIChat" hover-class="card-hover">
        <!-- 左下：两个圆圈横排 -->
        <view class="ai-circle-group ai-circle-group-l">
          <image class="ai-circle" src="/static/AI对话小圆圈.png" lazy-load />
          <image class="ai-circle" src="/static/AI对话小圆圈.png" lazy-load />
        </view>
        <!-- 右上：两个圆圈横排 -->
        <view class="ai-circle-group ai-circle-group-r">
          <image class="ai-circle" src="/static/AI对话小圆圈.png" lazy-load />
          <image class="ai-circle" src="/static/AI对话小圆圈.png" lazy-load />
        </view>

        <view class="ai-dialog-main">
          <!-- 蓝色圆角框定位在主图正中间 -->
          <view class="ai-dialog-main-bg"></view>
          <image class="ai-dialog-main-img" src="/static/首页AI对话模块主图.png" mode="aspectFit" lazy-load />
        </view>
        <view class="ai-dialog-desc">
          拍照识别卡路里<br />语音分析情绪<br />定制食谱
        </view>
      </view>
    </view>

    <!-- 可滑动四区容器 - 优化滚动体验、修复高度适配 -->
    <view class="scroll-container" scroll-y="true">
      <view class="home-siqu-container">
        <view class="plan-header-card" @click="goToMyPlan" hover-class="card-hover">
          <view class="plan-header-content">
            <view class="plan-icon-bg">
              <image class="plan-icon-img" src="/static/我的方案图标.png" mode="aspectFit" lazy-load />
            </view>
            <text class="plan-title">我的方案</text>
            <view class="plan-icon-bg">
              <image class="plan-icon-img" src="/static/我的方案图标.png" mode="aspectFit" lazy-load />
            </view>
          </view>
        </view>
        <view class="calories-cards">
          <view class="card-group">
            <!-- 卡路里卡片 - 增加点击反馈、优化语义 -->
            <view class="calories-card" @click="goToSelect('breakfast')" hover-class="calories-card-hover">
              <text class="card-label">{{ calories.breakfast }}千卡</text>
            </view>
            <view class="calories-card" @click="goToSelect('lunch')" hover-class="calories-card-hover">
              <text class="card-label">{{ calories.lunch }}千卡</text>
            </view>
            <view class="calories-card" @click="goToSelect('dinner')" hover-class="calories-card-hover">
              <text class="card-label">{{ calories.dinner }}千卡</text>
            </view>
            <view class="calories-card" @click="goToSelect('other')" hover-class="calories-card-hover">
              <text class="card-label">{{ calories.other }}千卡</text>
            </view>
          </view>
          <view class="calories-tags">
            <text class="tag" @click="goToSelect('breakfast')" hover-class="tag-hover">+ 早餐</text>
            <text class="tag" @click="goToSelect('lunch')" hover-class="tag-hover">+ 午餐</text>
            <text class="tag" @click="goToSelect('dinner')" hover-class="tag-hover">+ 晚餐</text>
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
            <view class="action-item-header">
              <text class="action-title">{{ item.name }}</text>
              <image class="action-icon-img" :src="item.icon" mode="aspectFit" lazy-load />
            </view>
            <view class="action-img-box">
              <image class="action-img" :src="item.img" mode="aspectFill" lazy-load />
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
    onLoad
  } from '@dcloudio/uni-app';

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
    uni.navigateTo({
      url: '/pages/home/home_search_bar/home_search_bar?from=home'
    });
  }
  // 跳转到计划进度页面
  function goToPlanProgress() {
    uni.navigateTo({
      url: '/pages/home/plan_progress/plan_progress?from=home'
    });
  }
  // 跳转到AI对话页面
  function goToAIChat() {
    uni.navigateTo({
      url: '/pages/home/ai_chat/ai_chat?from=home'
    });
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
    uni.navigateTo({
      url: '/pages/home/my_plan/my_plan?from=home'
    });
  }
  // 快捷功能区数据
  const quickActions = [{
      name: '体重',
      icon: '/static/首页功能图标/记录体重图标.png',
      img: '/static/首页功能图标/记录体重图.png',
      route: '/pages/home/record_weight/record_weight',
    },
    {
      name: '喝水',
      icon: '/static/首页功能图标/喝水图标.png',
      img: '/static/首页功能图标/喝水图.png',
      route: '/pages/home/drink_water/drink_water',
    },
    {
      name: '运动',
      icon: '/static/首页功能图标/运动图标.png',
      img: '/static/首页功能图标/运动图.png',
      route: '/pages/home/exercise/exercise',
    },
    {
      name: '断食',
      icon: '/static/首页功能图标/断食图标.png',
      img: '/static/首页功能图标/断食图.png',
      route: '/pages/schedule/fasting',
    },
    {
      name: '日记',
      icon: '/static/首页功能图标/日记图标.png',
      img: '/static/首页功能图标/日记图.png',
      route: '/pages/home/diary/diary',
    },
  ];
  // 跳转到对应功能页面
  function goToAction(route) {
    uni.navigateTo({
      url: route + '?from=home'
    });
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
      breakfast: '/pages/home/select_breakfast/select_breakfast',
      lunch: '/pages/home/select_lunch/select_lunch',
      dinner: '/pages/home/select_dinner/select_dinner',
      other: '/pages/home/select_otherfood/select_otherfood',
    };
    uni.navigateTo({
      url: map[type] + '?from=home'
    });
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
  onMounted(() => {
    loadCalories();
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
    width: 340px;
    display: flex;
    flex-direction: row;
    gap: 4px;
    margin: 16px auto 0 auto;
    justify-content: space-between;
  }

  .card-row-item {
    width: 48%;
    height: 280px;
    /*之前是180*/
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 12px rgba(79, 161, 242, 0.12);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    overflow: hidden;
    transition: box-shadow 0.2s;
    position: relative;
    /* 新增：让子元素绝对定位以卡片为基准 */
  }

  .card-row-item:hover {
    box-shadow: 0 4px 16px rgba(24, 144, 255, 0.18);
  }

  .avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
  }

  /* 食物搜索栏 */
  .food-search-bar {
    width: 366px;
    height: 44px;
    background: #fff;
    border-radius: 22px;
    border: 1.5px solid #D9D9D9;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 18px;
    margin: 18px auto 0 auto;
    box-sizing: border-box;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(79, 161, 242, 0.04);
  }

  .food-search-placeholder {
    color: #D9D9D9;
    font-size: 15px;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .food-search-icon {
    width: 22px;
    height: 22px;
    margin-left: 12px;
  }

  body,
  .home-bg {
    background: #E3F2FD;
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
    width: 366px;
    background: #f7fbff;
    border-radius: 10px;
    box-shadow: 0 2px 12px rgba(79, 161, 242, 0.08);
    padding: 18px 16px 16px 16px;
    margin: 0 20px 8px 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-sizing: border-box;
    overflow-x: hidden !important;
    /* 强制禁止子容器横向溢出 */
    max-width: 90%;
    /* 新增：适配不同屏幕宽度，避免超出视口 */
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
    background: #53B1EF;
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

  /* 我的方案卡片区 */
  .plan-header-card {
    width: 100%;
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0 2px 12px rgba(79, 161, 242, 0.12);
    padding: 12px 0;
    margin-bottom: 8px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: box-shadow 0.2s;
  }

  .plan-header-card:hover {
    box-shadow: 0 4px 16px rgba(24, 144, 255, 0.18);
  }

  .plan-header-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  .plan-title {
    font-size: 21px;
    font-weight: 600;
    color: #2C3E50;
    background: transparent;
    border-radius: 8px;
    padding: 0 18px;
    letter-spacing: 1px;
  }

  .plan-icon-bg {
    width: 38px;
    height: 36px;
    background: #4D96FF;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(24, 144, 255, 0.12);
  }

  .plan-icon-img {
    width: 28px;
    height: 28px;
    object-fit: contain;
    /* 可选：加1px浅阴影，让白色图标更清晰 */
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.2));
  }

  /* 卡片区 */
  .calories-cards {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .card-group {
    display: flex;
    justify-content: space-between;
    gap: 4px;
  }

  .calories-card {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #FDD3D0;
    border-radius: 10px;
    box-shadow: 0 1px 4px rgba(79, 161, 242, 0.08);
    padding: 18px 0;
    cursor: pointer;
    margin-bottom: 0;
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

  .calories-tags {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2px;
  }

  .tag {
    font-size: 13px;
    color: #000000;
    border-radius: 6px;
    padding: 2px 10px;
    min-width: 48px;
    text-align: center;
    cursor: pointer;
    font-weight: 600;
  }

  .tag:hover {
    background: #e3f0fc;
  }

  .health-link {
    text-align: center;
    margin-top: 2px;
  }

  .link-text {
    font-size: 13px;
    color: #53B1EF;
    letter-spacing: 1px;
  }

  /* 快捷功能区 */
  /* 快捷功能区 */
  .quick-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 16px 16px;
    margin-top: 8px;
    justify-content: space-between;
    width: 100%;
    /* 新增：强制继承父容器宽度，避免超出 */
    box-sizing: border-box;
    /* 新增：padding/border 不影响宽度计算 */
    padding: 0;
    /* 新增：清除默认内边距 */
  }

  .action-item {
    width: calc(50% - 8px);
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 12px rgba(79, 161, 242, 0.12);
    padding: 12px 12px 0 12px;
    margin-bottom: 0;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    min-height: 120px;
    position: relative;
    transition: box-shadow 0.2s;
    box-sizing: border-box;
    /* 新增：padding 不影响宽度计算，避免溢出 */
  }

  .action-item:hover {
    box-shadow: 0 4px 16px rgba(24, 144, 255, 0.18);
  }

  .action-item-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .action-title {
    font-size: 15px;
    color: #2C3E50;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .action-icon-img {
    width: 32px;
    height: 32px;
    object-fit: contain;
    /* 可选：加1px浅阴影，让白色图标更清晰 */
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.2));
  }

  .action-img-box {
    position: absolute;
    left: 9px;
    bottom: 9px;
    width: 100px;
    height: 65px;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(79, 161, 242, 0.08);
  }

  .action-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
  }
</style>