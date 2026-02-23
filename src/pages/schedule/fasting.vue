<template>
  <view class="container">
    <!-- 顶部导航 -->
    <view class="nav-header">
      <text class="back-btn" @click="goBack">← 返回</text>
      <text class="page-title">⏰ 断食计划</text>
      <view style="width: 60rpx;"></view>
    </view>

    <!-- 介绍卡片 -->
    <view class="intro-card">
      <text class="intro-title">什么是间歇性断食？</text>
      <text class="intro-text">
        间歇性断食（Intermittent Fasting）是一种饮食模式，通过周期性地在"饮食窗口"和"断食窗口"之间交替。科研表明，间歇性断食可以帮助改善代谢健康、促进脂肪燃烧、增强心血管功能。
      </text>
    </view>

    <!-- 计划卡片列表 -->
    <view class="plans-grid">
      <!-- 16:8 断食法 -->
      <view class="plan-card">
        <view class="card-header">
          <text class="plan-name">16:8 轻断食法</text>
          <text class="difficulty">初级</text>
        </view>
        
        <view class="plan-badge">
          <text class="badge-icon">⭐</text>
          <text class="badge-text">最受欢迎</text>
        </view>

        <view class="plan-content">
          <text class="content-label">规则</text>
          <text class="content-text">每天禁食16小时，进食8小时</text>
          
          <text class="content-label">常见时间安排</text>
          <view class="schedule-example">
            <text class="schedule-item">• 正常作息：12:00 - 20:00 进食</text>
            <text class="schedule-item">• 晨鸟型：6:00 - 14:00 进食</text>
            <text class="schedule-item">• 夜猫型：14:00 - 22:00 进食</text>
          </view>

          <text class="content-label">适合人群</text>
          <text class="content-text">初学者、工作繁忙者、目标温和减脂</text>

          <text class="content-label">预期效果</text>
          <text class="content-text">4-8周内可见效果，体重下降、精力改善</text>
        </view>

        <view class="pros-cons">
          <view class="pros">
            <text class="title">✅ 优点</text>
            <text>• 容易坚持</text>
            <text>• 可正常进食</text>
            <text>• 代谢改善</text>
          </view>
          <view class="cons">
            <text class="title">⚠️ 注意</text>
            <text>• 初期可能饥饿</text>
            <text>• 需要调整作息</text>
            <text>• 进食需控制量</text>
          </view>
        </view>
      </view>

      <!-- 5:2 断食法 -->
      <view class="plan-card">
        <view class="card-header">
          <text class="plan-name">5:2 断食法</text>
          <text class="difficulty">中级</text>
        </view>

        <view class="plan-content">
          <text class="content-label">规则</text>
          <text class="content-text">一周5天正常进食，2天极低热量（500-600kcal）</text>
          
          <text class="content-label">推荐安排</text>
          <view class="schedule-example">
            <text class="schedule-item">• 周一、周三或周五限制饮食</text>
            <text class="schedule-item">• 其余5天正常进食</text>
            <text class="schedule-item">• 限制日可进食1-2餐</text>
          </view>

          <text class="content-label">适合人群</text>
          <text class="content-text">有一定自律性、追求灵活的人群</text>

          <text class="content-label">预期效果</text>
          <text class="content-text">体重下降、血糖控制、减少炎症反应</text>
        </view>

        <view class="pros-cons">
          <view class="pros">
            <text class="title">✅ 优点</text>
            <text>• 灵活易调整</text>
            <text>• 效果显著</text>
            <text>• 长期可维持</text>
          </view>
          <view class="cons">
            <text class="title">⚠️ 注意</text>
            <text>• 需要计算热量</text>
            <text class="title">• 限制日可能难熬</text>
            <text>• 需跟踪进食</text>
          </view>
        </view>
      </view>

      <!-- 轻断食 -->
      <view class="plan-card">
        <view class="card-header">
          <text class="plan-name">轻断食</text>
          <text class="difficulty">初级</text>
        </view>

        <view class="plan-content">
          <text class="content-label">规则</text>
          <text class="content-text">每天进食热量不超过500-600kcal</text>
          
          <text class="content-label">饮食建议</text>
          <view class="schedule-example">
            <text class="schedule-item">• 早餐：果茶 + 酸奶（150kcal）</text>
            <text class="schedule-item">• 午餐：清汤面条（200kcal）</text>
            <text class="schedule-item">• 晚餐：蔬菜沙拉（100kcal）</text>
          </view>

          <text class="content-label">适合人群</text>
          <text class="content-text">健身爱好者、追求快速减脂的人</text>

          <text class="content-label">预期效果</text>
          <text class="content-text">1-2周明显见效，需配合运动</text>
        </view>

        <view class="pros-cons">
          <view class="pros">
            <text class="title">✅ 优点</text>
            <text>• 见效快速</text>
            <text>• 精确可控</text>
            <text>• 无需完全禁食</text>
          </view>
          <view class="cons">
            <text class="title">⚠️ 注意</text>
            <text>• 需精确计数</text>
            <text>• 可能营养不足</text>
            <text>• 需要毅力</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 对比表格 -->
    <view class="comparison-section">
      <text class="section-title">📊 断食方案对比</text>
      <view class="comparison-table">
        <view class="table-header">
          <text class="cell method">方案</text>
          <text class="cell">禁食时长</text>
          <text class="cell">难度</text>
          <text class="cell">减脂速度</text>
        </view>
        <view class="table-row">
          <text class="cell method">16:8</text>
          <text class="cell">16小时</text>
          <text class="cell">⭐⭐</text>
          <text class="cell">中等</text>
        </view>
        <view class="table-row">
          <text class="cell method">5:2</text>
          <text class="cell">每周2天低热量（约500-600kcal）</text>
          <text class="cell">⭐⭐⭐</text>
          <text class="cell">中等偏快</text>
        </view>
        <view class="table-row">
          <text class="cell method">轻断食 / 低热量日</text>
          <text class="cell">每日低热量限制（示例：≤500-600kcal）</text>
          <text class="cell">⭐⭐⭐</text>
          <text class="cell">快速（需谨慎）</text>
        </view>
      </view>
    </view>

    <!-- 健康提示 -->
    <view class="tips-section">
      <text class="section-title">💡 断食小贴士</text>
      <view class="tips-list">
        <view class="tip-item">
          <text class="tip-icon">1️⃣</text>
          <text class="tip-text">循序渐进：从16:8开始，逐步适应再尝试更强烈的方案</text>
        </view>
        <view class="tip-item">
          <text class="tip-icon">2️⃣</text>
          <text class="tip-text">补充水分：断食期间多喝水、茶、咖啡（无糖）</text>
        </view>
        <view class="tip-item">
          <text class="tip-icon">3️⃣</text>
          <text class="tip-text">营养均衡：进食时选择营养密集型食物</text>
        </view>
        <view class="tip-item">
          <text class="tip-icon">4️⃣</text>
          <text class="tip-text">规律运动：配合力量训练效果更佳</text>
        </view>
        <view class="tip-item">
          <text class="tip-icon">5️⃣</text>
          <text class="tip-text">咨询医生：有基础疾病的人群先咨询专业人士</text>
        </view>
      </view>
    </view>

    <!-- 额外说明：警示、常见误区、开始建议与FAQ -->
    <view class="extra-section">
      <view class="warnings-section">
        <text class="section-title"><text style="font-size: 20rpx;">⚠️</text> 断食警示与不适人群</text>
        <view class="warning-list">
          <text>• 不建议人群：孕妇与哺乳期女性、18岁以下青少年、体重过低（BMI&lt;18.5）、有进食障碍史者、正在接受癌症化疗者、严重心血管疾病患者、1型糖尿病或胰岛素依赖型患者。</text>
          <text>• 有慢性疾病或长期服药者：开始前请务必咨询主治医生，部分药物需要与进食同步服用。</text>
        </view>
      </view>

      <view class="misconceptions-section">
        <text class="section-title"><text style="font-size: 20rpx;">❌</text> 常见误区</text>
        <view class="miscon-list">
          <text>• 断食并非等同于不吃：应在进食窗口保证足够营养与蛋白质摄入。</text>
          <text>• 过度节食会伤害代谢：长期极低热量可能导致基础代谢下降与营养缺乏。</text>
        </view>
      </view>

      <view class="start-guidance">
        <text class="section-title"><text style="font-size: 20rpx;">✅</text> 开始建议与应急指引</text>
        <view class="guidance-list">
          <text>• 适应期：建议先从16:8开始，给身体1-2周适应期，再评估是否尝试更严格方案。</text>
          <text>• 饮食选择：进食窗口优先高蛋白、健康脂肪、蔬菜与全谷物，避免高糖精制碳水。</text>
          <text>• 运动安排：适合低至中等强度运动；断食初期避免高强度和长时间耐力训练。</text>
          <text>• 不适处理：若出现严重头晕、心悸、晕厥、持续乏力，应立即停止断食并就医。</text>
        </view>
      </view>

      <view class="faq-section">
        <text class="section-title"><text style="font-size: 20rpx;">❓</text> 常见问题</text>
        <view class="faq-item">
          <text class="q">Q：断食会降低基础代谢吗？</text>
          <text class="a">A：短期间歇性断食通常不会显著降低基础代谢，长期极低热量限制才可能产生代谢适应。</text>
        </view>
        <view class="faq-item">
          <text class="q">Q：断食期间可以喝水或黑咖啡吗？</text>
          <text class="a">A：可以。无糖黑咖啡、无糖茶和白开水通常不会打断断食。</text>
        </view>
        <view class="faq-item">
          <text class="q">Q：正在服药还能断食吗？</text>
          <text class="a">A：如服用需与进食同步的药物（例如某些降糖药或胰岛素），请先咨询医生再决定。</text>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup>
const goBack = () => {
  uni.navigateBack({
    delta: 1
  })
}
</script>

<style lang="scss" scoped>
$main-blue: #4FA1F2;
$light-blue: #80D0FF;
$bg-blue: #E3F2FD;

.container {
  background: linear-gradient(135deg, $bg-blue 0%, #F0F9FF 100%);
  min-height: 100vh;
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
    font-size: 36rpx;
    font-weight: 700;
    color: #333;
  }
}

.intro-card {
  background: white;
  margin: 16rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);

  .intro-title {
    display: block;
    font-size: 28rpx;
    font-weight: 700;
    color: #333;
    margin-bottom: 12rpx;
  }

  .intro-text {
    font-size: 24rpx;
    color: #666;
    line-height: 1.8;
  }
}

.plans-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16rpx;
  padding: 16rpx;

  .plan-card {
    background: white;
    border-radius: 16rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16rpx 20rpx;
      background: linear-gradient(135deg, rgba(79, 161, 242, 0.1), rgba(128, 208, 255, 0.1));

      .plan-name {
        font-size: 26rpx;
        font-weight: 700;
        color: #333;
      }

      .difficulty {
        background: rgba(79, 161, 242, 0.2);
        color: $main-blue;
        padding: 4rpx 12rpx;
        border-radius: 12rpx;
        font-size: 20rpx;
        font-weight: 600;
      }
    }

    .plan-badge {
      display: flex;
      align-items: center;
      gap: 6rpx;
      padding: 8rpx 16rpx;
      background: rgba(255, 215, 0, 0.1);
      color: #FF8C00;
      font-size: 20rpx;
      font-weight: 600;

      .badge-icon {
        font-size: 20rpx;
      }
    }

    .plan-img {
      width: 100%;
      height: 180rpx;
    }

    .plan-content {
      padding: 20rpx;

      .content-label {
        display: block;
        font-size: 22rpx;
        font-weight: 700;
        color: #333;
        margin-top: 12rpx;
        margin-bottom: 8rpx;

        &:first-child {
          margin-top: 0;
        }
      }

      .content-text {
        display: block;
        font-size: 22rpx;
        color: #666;
        line-height: 1.6;
        margin-bottom: 12rpx;
      }

      .schedule-example {
        background: rgba(79, 161, 242, 0.06);
        padding: 12rpx;
        border-radius: 8rpx;

        .schedule-item {
          display: block;
          font-size: 20rpx;
          color: #666;
          line-height: 1.8;
        }
      }
    }

    .pros-cons {
      display: flex;
      gap: 16rpx;
      padding: 20rpx;
      background: rgba(79, 161, 242, 0.04);
      border-top: 1rpx solid #f0f0f0;

      .pros, .cons {
        flex: 1;
        font-size: 20rpx;

        .title {
          display: block;
          font-weight: 700;
          color: #333;
          margin-bottom: 8rpx;
        }

        text {
          display: block;
          color: #666;
          line-height: 1.8;
        }
      }
    }
  }
}

.comparison-section {
  padding: 24rpx;

  .section-title {
    display: block;
    font-size: 28rpx;
    font-weight: 700;
    color: #333;
    margin-bottom: 16rpx;
  }

  .comparison-table {
    background: white;
    border-radius: 12rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);

    .table-header {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      background: linear-gradient(135deg, rgba(79, 161, 242, 0.1), rgba(128, 208, 255, 0.1));
      padding: 12rpx;

      .cell {
        font-size: 20rpx;
        font-weight: 700;
        color: #333;
        text-align: center;

        &.method {
          text-align: left;
        }
      }
    }

    .table-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      padding: 12rpx;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }

      .cell {
        font-size: 20rpx;
        color: #666;
        text-align: center;

        &.method {
          text-align: left;
          font-weight: 600;
          color: $main-blue;
        }
      }
    }
  }
}

.tips-section {
  padding: 24rpx;

  .section-title {
    display: block;
    font-size: 28rpx;
    font-weight: 700;
    color: #333;
    margin-bottom: 16rpx;
  }

  .tips-list {
    .tip-item {
      display: flex;
      gap: 12rpx;
      background: white;
      padding: 16rpx;
      margin-bottom: 12rpx;
      border-radius: 12rpx;
      box-shadow: 0 2rpx 8rpx rgba(79, 161, 242, 0.06);

      .tip-icon {
        font-size: 24rpx;
        flex-shrink: 0;
      }

      .tip-text {
        font-size: 22rpx;
        color: #666;
        line-height: 1.6;
      }
    }
  }
}

.extra-section {
  padding: 0 16rpx;
  margin-bottom: 32rpx;

  .section-title {
    display: block;
    font-size: 26rpx;
    font-weight: 700;
    color: #333;
    margin-bottom: 16rpx;
    margin-top: 24rpx;
  }

  .warnings-section, .misconceptions-section, .start-guidance, .faq-section {
    background: white;
    margin: 16rpx;
    padding: 20rpx;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 8rpx rgba(79, 161, 242, 0.06);
  }

  .warning-list, .miscon-list, .guidance-list {
    text {
      display: block;
      font-size: 20rpx;
      color: #666;
      line-height: 1.8;
      margin-bottom: 12rpx;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .faq-item {
    margin-bottom: 16rpx;

    .q {
      display: block;
      font-size: 22rpx;
      font-weight: 700;
      color: #333;
      margin-bottom: 8rpx;
    }

    .a {
      display: block;
      font-size: 20rpx;
      color: #666;
      line-height: 1.6;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>