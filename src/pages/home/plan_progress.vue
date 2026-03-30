<template>
  <view class="plan-progress-container">
    <!-- 动态人物形象区域 -->
    <view class="hero-card">
      <view class="avatar-container">
        <text class="avatar-emoji">📈</text>
        <text class="avatar-desc">{{ progressData.avatarDesc }}</text>
        <view class="bmi-badge">
          <text class="bmi-label">BMI</text>
          <text class="bmi-value">{{ progressData.bmi }}</text>
        </view>
      </view>
    </view>

    <!-- 核心信息区域 - 4种天数统计 -->
    <view class="info-section card-panel">
      <view class="info-grid">
        <view class="info-item">
          <text class="info-icon">📅</text>
          <text class="info-value">{{ progressData.useDays }}</text>
          <text class="info-label">使用天数</text>
        </view>
        <view class="info-item">
          <text class="info-icon">✍️</text>
          <text class="info-value">{{ progressData.recordDays }}</text>
          <text class="info-label">记录天数</text>
        </view>
      </view>
      <view class="info-grid">
        <view class="info-item">
          <text class="info-icon">💪</text>
          <text class="info-value">{{ progressData.planDays }}</text>
          <text class="info-label">坚持方案</text>
        </view>
        <view class="info-item">
          <text class="info-icon">🎯</text>
          <text class="info-value">{{ progressData.remainingDays }}</text>
          <text class="info-label">剩余天数</text>
        </view>
      </view>
      <view class="progress-tip">
        <text class="tip-icon">💡</text>
        <text class="tip-text">{{ progressTip }}</text>
      </view>
    </view>

    <!-- 体重趋势图区域 -->
    <view class="chart-section card-panel">
      <view class="chart-header">
        <text class="chart-title">📈 体重趋势</text>
        <view v-if="hasWeightData" class="weight-info">
          <text class="weight-current">当前 {{ currentWeightDisplay }}kg</text>
          <text class="weight-target">目标 {{ targetWeightDisplay }}kg</text>
        </view>
      </view>
      
      <!-- 无数据提示 -->
      <view v-if="!hasWeightData" class="chart-empty">
        <text class="empty-icon">📊</text>
        <text class="empty-text">暂无体重数据</text>
        <text class="empty-hint">请先记录至少2天的体重</text>
        <button class="record-btn" @click="goToRecordWeight">去记录体重</button>
      </view>
      
      <!-- 只有1条数据提示 -->
      <view v-else-if="progressData.weightList.length === 1" class="chart-empty">
        <text class="empty-icon">📝</text>
        <text class="empty-text">数据不足</text>
        <text class="empty-hint">再记录一天即可查看趋势图</text>
        <button class="record-btn" @click="goToRecordWeight">去记录体重</button>
      </view>
      
      <!-- 趋势图 -->
      <view v-else class="trend-wrapper">
        <view class="trend-container">
          <!-- Y轴刻度 -->
          <view class="trend-axis">
            <view v-for="(tick, idx) in yAxisTicks" :key="idx" class="axis-tick">
              <text class="axis-label">{{ tick }}</text>
            </view>
          </view>
          <scroll-view class="trend-scroll" scroll-x>
            <view class="trend-bar">
              <view v-for="item in chartTrendList" :key="item.date" class="trend-item">
                <view class="trend-dot" :style="trendDotStyle(item.weight)"></view>
                <text class="trend-date">{{ formatTrendDate(item.date) }}</text>
              </view>
            </view>
          </scroll-view>
        </view>
      </view>
    </view>

    <!-- 鼓励语区域 -->
    <view class="encourage-section card-panel encourage-card">
      <text class="encourage-text">{{ encouragementText }}</text>
    </view>
  </view>
</template>

<script>
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { BASE_URL } from '@/config.js';
import {
  getUserProgressData,
  getEncouragementText,
  calculateBMI,
  getBMIStatus,
  getAvatarEmoji,
  getAvatarDescription
} from './userProgressService.js';

export default {
  name: 'PlanProgress',
  setup() {
    // 进度数据
    const progressData = ref({
      useDays: 0,
      recordDays: 0,
      planDays: 0,
      remainingDays: 0,
      weightList: [],
      currentWeight: 0,
      targetWeight: 0,
      bmi: 0,
      bmiStatus: 'normal',
      avatarEmoji: '📈',
      avatarDesc: '健康状态良好',
      progressPercent: 0
    });

    // 计算属性
    const hasWeightData = computed(() => {
      return progressData.value.weightList && progressData.value.weightList.length > 0;
    });

    const currentWeightDisplay = computed(() => {
      return progressData.value.currentWeight > 0 
        ? progressData.value.currentWeight.toFixed(1) 
        : '--';
    });

    const targetWeightDisplay = computed(() => {
      return progressData.value.targetWeight > 0 
        ? progressData.value.targetWeight.toFixed(1) 
        : '--';
    });

    const encouragementText = computed(() => {
      return getEncouragementText(progressData.value);
    });

    const progressTip = computed(() => {
      const { progressPercent, remainingDays } = progressData.value;
      if (progressPercent >= 80) {
        return '快达成目标了，坚持住！';
      } else if (progressPercent >= 50) {
        return '已完成一半，继续努力！';
      } else if (remainingDays > 0) {
        return `预计还需 ${remainingDays} 天达成目标`;
      } else {
        return '开始你的健康之旅吧！';
      }
    });

    // 趋势列表（时间正序）
    const trendList = computed(() => {
      return progressData.value.weightList ? progressData.value.weightList.slice().reverse() : [];
    });

    const chartTrendList = computed(() => trendList.value);

    // Y轴刻度计算
    const yAxisTicks = computed(() => {
      if (!progressData.value.weightList || progressData.value.weightList.length === 0) return [];
      const weights = progressData.value.weightList.map(w => w.weight);
      const min = Math.min(...weights);
      const max = Math.max(...weights);
      const step = Math.ceil((max - min) / 3 * 4) / 4 || 1;
      const ticks = [];
      for (let i = Math.floor(min); i <= Math.ceil(max); i += step) {
        ticks.push(i.toFixed(1));
      }
      return ticks.length > 0 ? ticks : [min.toFixed(1), max.toFixed(1)];
    });

    // 趋势点样式
    function trendDotStyle(weight) {
      const weights = progressData.value.weightList.map(w => w.weight);
      const min = Math.min(...weights);
      const max = Math.max(...weights);
      const range = max - min || 1;
      const percent = ((weight - min) / range);
      return {
        marginBottom: `${percent * 60 + 10}px`,
        background: percent > 0.5 ? '#53B1EF' : '#FDD0D0'
      };
    }

    function formatTrendDate(dateStr) {
      const parts = String(dateStr || '').split('-');
      if (parts.length === 3) {
        return `${parts[1]}-${parts[2]}`;
      }
      return dateStr;
    }

    function getToken() {
      return uni.getStorageSync('token') || '';
    }

    function calcRemainingDaysByWeight(weightList, targetWeight) {
      const currentWeight = weightList.length > 0 ? Number(weightList[0].weight) : 0;
      if (!currentWeight || !targetWeight) return 30;

      const diffToTarget = currentWeight - targetWeight;
      const gap = Math.abs(diffToTarget);
      if (gap <= 0.1) return 0;

      const isWeightLossGoal = diffToTarget > 0;
      let avgDailyTowardTarget = 0.1;
      if (weightList.length >= 2) {
        const newest = weightList[0];
        const oldest = weightList[weightList.length - 1];
        const start = new Date(oldest.date);
        const end = new Date(newest.date);
        const daysDiff = Math.max(1, Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)));
        if (daysDiff > 0) {
          const trend = isWeightLossGoal
            ? (Number(oldest.weight) - Number(newest.weight)) / daysDiff
            : (Number(newest.weight) - Number(oldest.weight)) / daysDiff;
          if (trend > 0) {
            avgDailyTowardTarget = trend;
          }
        }
      }

      if (avgDailyTowardTarget <= 0) avgDailyTowardTarget = 0.1;
      return Math.ceil(gap / avgDailyTowardTarget);
    }

    function applyBackendWeightData(baseData, backendData) {
      const records = Array.isArray(backendData?.records) ? backendData.records : [];
      if (records.length === 0) return baseData;

      const weightList = records
        .map(item => ({
          date: String(item.date || ''),
          weight: Number(item.weight)
        }))
        .filter(item => item.date && !Number.isNaN(item.weight))
        .sort((a, b) => String(b.date).localeCompare(String(a.date)));

      if (weightList.length === 0) return baseData;

      const uniqueWeightDays = new Set(weightList.map(item => item.date)).size;
      const finalRecordDays = Math.max(uniqueWeightDays, Number(baseData.recordDays || 0));
      const currentWeight = Number(weightList[0].weight);
      const targetWeight = Number(backendData.targetWeight || baseData.targetWeight || 0);
      const remainingDays = calcRemainingDaysByWeight(weightList, targetWeight);
      const initialWeight = Number(weightList[weightList.length - 1].weight);
      const totalDistance = Math.abs(initialWeight - targetWeight);
      const remainingDistance = Math.abs(currentWeight - targetWeight);
      const progressPercent = totalDistance <= 0.1
        ? (remainingDistance <= 0.1 ? 100 : 0)
        : Math.min(100, Math.max(0, ((totalDistance - remainingDistance) / totalDistance) * 100));

      const height = Number(baseData.height || 0);
      let bmi = Number(baseData.bmi || 0);
      let bmiStatus = baseData.bmiStatus || 'normal';
      let avatarEmoji = baseData.avatarEmoji || '📈';
      let avatarDesc = baseData.avatarDesc || '继续加油';

      if (height > 0 && currentWeight > 0) {
        bmi = Number(calculateBMI(currentWeight, height).toFixed(1));
        bmiStatus = getBMIStatus(bmi);
        avatarEmoji = getAvatarEmoji(bmiStatus);
        avatarDesc = getAvatarDescription(bmiStatus);
      }

      return {
        ...baseData,
        weightList,
        currentWeight,
        targetWeight,
        recordDays: finalRecordDays,
        useDays: Math.max(Number(baseData.useDays || 0), finalRecordDays),
        planDays: Math.max(Number(baseData.planDays || 0), finalRecordDays),
        remainingDays,
        progressPercent,
        bmi: bmi.toFixed(1),
        bmiStatus,
        avatarEmoji,
        avatarDesc
      };
    }

    // 加载数据
    const loadData = () => {
      try {
        const data = getUserProgressData();
        progressData.value = data;

        const token = getToken();
        if (!token) {
          console.warn('[PlanProgressAPI] token为空，跳过后端请求');
          return;
        }

        uni.request({
          url: BASE_URL + '/api/weight/list',
          method: 'GET',
          header: {
            Authorization: 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          success(res) {
            console.log('[PlanProgressAPI] response:', {
              url: BASE_URL + '/api/weight/list',
              method: 'GET',
              statusCode: res.statusCode,
              body: res.data
            });
            if (res.statusCode === 200 && res.data && res.data.code === 200) {
              progressData.value = applyBackendWeightData(progressData.value, res.data.data || {});
            }
          },
          fail(err) {
            console.error('[PlanProgressAPI] network error:', {
              url: BASE_URL + '/api/weight/list',
              method: 'GET',
              err
            });
          }
        });
      } catch (error) {
        console.error('加载进度数据失败:', error);
        uni.showToast({
          title: '数据加载失败',
          icon: 'none'
        });
      }
    };

    // 跳转到体重记录页面
    const goToRecordWeight = () => {
      uni.navigateTo({
        url: '/pages/home/record_weight'
      });
    };

    // 生命周期
    onShow(() => {
      loadData();
    });

    return {
      progressData,
      hasWeightData,
      currentWeightDisplay,
      targetWeightDisplay,
      encouragementText,
      progressTip,
      trendList,
      chartTrendList,
      yAxisTicks,
      trendDotStyle,
      formatTrendDate,
      goToRecordWeight
    };
  }
};
</script>

<style scoped>
/* 全局容器 */
.plan-progress-container {
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #E3F2FD 0%, #F0F9FF 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 16px calc(26px + env(safe-area-inset-bottom));
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* 卡片基础样式 */
.card-panel {
  width: 100%;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 4px 12px rgba(79, 161, 242, 0.1);
  padding: 20px 16px;
  box-sizing: border-box;
  margin-bottom: 14px;
}

/* 动态人物形象区域 */
.hero-card {
  width: 100%;
  background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
  border-radius: 18px;
  box-shadow: 0 4px 12px rgba(79, 161, 242, 0.15);
  padding: 24px 16px;
  margin-bottom: 14px;
  display: flex;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.avatar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.avatar-emoji {
  font-size: 50px;
  line-height: 1;
  margin-bottom: 12px;
}

.avatar-desc {
  font-size: 16px;
  color: #666;
  font-weight: 500;
}

.bmi-badge {
  position: absolute;
  top: 8px;
  right: 12px;
  background: linear-gradient(135deg, #419bf9 0%, #5fb3ff 100%);
  border-radius: 20px;
  padding: 6px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 8px rgba(79, 161, 242, 0.3);
}

.bmi-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2px;
}

.bmi-value {
  font-size: 16px;
  color: #ffffff;
  font-weight: bold;
}

/* 信息区域 - 网格布局 */
.info-section {
  padding: 18px 16px;
}

.info-grid {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.info-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #f8fbff 0%, #ffffff 100%);
  border-radius: 12px;
  padding: 16px 12px;
  box-shadow: 0 2px 8px rgba(79, 161, 242, 0.08);
}

.info-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.info-value {
  font-size: 28px;
  color: #419bf9;
  font-weight: bold;
  margin-bottom: 4px;
}

.info-label {
  font-size: 13px;
  color: #999;
}

.progress-tip {
  margin-top: 16px;
  padding: 12px;
  background: linear-gradient(135deg, #fff9e6 0%, #fffdf5 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tip-icon {
  font-size: 18px;
}

.tip-text {
  font-size: 14px;
  color: #ff9800;
  font-weight: 500;
}

/* 图表区域 */
.chart-section {
  padding: 20px 16px;
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.chart-title {
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.weight-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.weight-current {
  font-size: 13px;
  color: #419bf9;
  font-weight: 500;
}

.weight-target {
  font-size: 13px;
  color: #4CAF50;
  font-weight: 500;
}

/* 图表画布 */
.trend-wrapper {
  width: 100%;
  padding: 12px 0;
  box-sizing: border-box;
  overflow: hidden;
}

.trend-container {
  display: flex;
  gap: 8px;
  width: 100%;
  overflow: hidden;
}

.trend-scroll {
  flex: 1;
  width: 100%;
  overflow: hidden;
}

.trend-axis {
  display: flex;
  flex-direction: column-reverse;
  min-width: 30px;
  justify-content: space-between;
  padding-right: 4px;
}

.axis-tick {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 20px;
}

.axis-label {
  font-size: 11px;
  color: #999;
  white-space: nowrap;
}

.trend-bar {
  height: 132px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  gap: 8px;
  width: max-content;
  min-width: 100%;
  position: relative;
  padding: 0 4px 4px 0;
  box-sizing: border-box;
}

.trend-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  flex: 0 0 56px;
  min-width: 56px;
  box-sizing: border-box;
}

.trend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: margin-bottom 0.3s;
}

.trend-date {
  font-size: 11px;
  color: #7a8ba0;
  margin-top: 6px;
  white-space: nowrap;
}

/* 空状态 */
.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  min-height: 220px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 12px;
  opacity: 0.6;
}

.empty-text {
  font-size: 16px;
  color: #666;
  font-weight: 500;
  margin-bottom: 8px;
}

.empty-hint {
  font-size: 13px;
  color: #999;
  margin-bottom: 20px;
}

.record-btn {
  background: linear-gradient(135deg, #419bf9 0%, #5fb3ff 100%);
  color: #ffffff;
  border: none;
  border-radius: 20px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(79, 161, 242, 0.3);
}

.record-btn:active {
  opacity: 0.8;
}

/* 鼓励语区域 */
.encourage-section {
  text-align: center;
  margin-bottom: 0;
  padding: 24px 20px;
}

.encourage-card {
  background: linear-gradient(135deg, rgba(79, 161, 242, 0.12), rgba(128, 208, 255, 0.08));
  border: 1px solid rgba(79, 161, 242, 0.2);
}

.encourage-text {
  font-size: 20px;
  color: #419bf9;
  font-weight: 600;
  line-height: 1.5;
  text-align: center;
}
</style>
