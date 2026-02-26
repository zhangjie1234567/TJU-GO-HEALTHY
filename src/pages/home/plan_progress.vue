<template>
  <view class="plan-progress-container">
    <!-- 头像区域 -->
    <image src="/static/首页人物图.png" mode="aspectFit" class="avatar-img"></image>

    <!-- 核心信息区域 -->
    <view class="info-section">
      <text class="info-text">你已来到轻跃<text class="highlight">5</text>天</text>
      累计记录<text class="highlight">4</text>天
      <text>\n</text>
      <text class="detail-link">请到“我的”去看详细记录</text>
      <text>\n</text>
      累计坚持方案<text class="highlight">4</text>天
      <text>\n</text>
      <text class="detail-link">请到“首页”去看方案记录</text>

    </view>

    <!-- 体重趋势图区域 -->
    <view class="chart-section">
      <text class="chart-title">你的体重趋势图</text>
      <view class="chart-wrapper">
        <!-- Y轴刻度 -->
        <view class="y-axis">
          <text>1,088.99</text>
          <text>600.00</text>
          <text>200.00</text>
          <text>0</text>
        </view>
        <!-- 图表主体 -->
        <view class="chart-area">
          <view class="line-chart" id="weightChart"></view>
          <!-- X轴刻度 -->
          <view class="x-axis">
            <text v-for="i in 12" :key="i">{{ i }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 剩余天数区域 -->
    <view class="remaining-section">
      <text class="remaining-text">距离达成目标还需坚持<text class="highlight">24</text>天</text>
    </view>

    <!-- 鼓励语区域 -->
    <view class="encourage-section">
      <text class="encourage-text">加油</text>
    </view>
  </view>
</template>

<script>
  import * as echarts from 'echarts'; // 适配uni-app的echarts引入路径

  export default {
    name: 'PlanProgress',
    data() {
      return {
        // 模拟后端返回的体重数据（可替换为真实接口数据）
        weightData: [450, 520, 380, 650, 580, 420, 550, 800, 680, 520, 600, 550],
        chartInstance: null
      };
    },
    onReady() {
      // uni-app中在onReady生命周期初始化图表（确保节点已渲染）
      this.initChart();
    },
    methods: {
      // 初始化体重趋势图
      initChart() {
        const chartDom = uni.createSelectorQuery().in(this).select('#weightChart');
        chartDom.fields({
          node: true,
          size: true
        }, (res) => {
          if (!res.node) return;

          const canvasNode = res.node;
          const ctx = canvasNode.getContext('2d');
          const dpr = uni.getSystemInfoSync().pixelRatio;
          canvasNode.width = res.width * dpr;
          canvasNode.height = res.height * dpr;
          ctx.scale(dpr, dpr);

          this.chartInstance = echarts.init(canvasNode);
          const option = {
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross'
              }
            },
            grid: {
              left: 0,
              right: 0,
              bottom: 0,
              top: 0,
              containLabel: false
            },
            xAxis: {
              type: 'category',
              boundaryGap: false,
              data: Array.from({
                length: 12
              }, (_, i) => i + 1),
              show: false
            },
            yAxis: {
              type: 'value',
              show: false
            },
            series: [{
              name: '体重',
              type: 'line',
              smooth: true,
              data: this.weightData,
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                    offset: 0,
                    color: 'rgba(135, 206, 250, 0.8)'
                  },
                  {
                    offset: 1,
                    color: 'rgba(135, 206, 250, 0.2)'
                  }
                ])
              },
              lineStyle: {
                color: '#419bf9',
                width: 2
              },
              itemStyle: {
                color: '#419bf9'
              }
            }]
          };
          this.chartInstance.setOption(option);
        }).exec();
      },
    },
    onUnload() {
      // 销毁图表实例，避免内存泄漏
      if (this.chartInstance) {
        this.chartInstance.dispose();
      }
    }
  };
</script>

<style scoped>
  /* 全局容器 - 1:1还原设计稿尺寸和布局 */
  .plan-progress-container {
    width: 100%;
    min-height: 100vh;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 16px;
    box-sizing: border-box;
  }

  /* 头像区域 */


  /*首页人物图*/
  .avatar-img {
    width: 280px;
    height: 350px;
  }

  /* 信息区域 */
  .info-section {
    width: 100%;
    text-align: center;
    margin-bottom: 24px;
  }

  .info-text {
    font-size: 18px;
    color: #333333;
    display: block;
    margin-bottom: 12px;
  }



  /*天数字体高光*/
  .highlight {
    color: #419bf9;
    font-weight: bold;
    font-size: 20px;
  }

  .detail-link {
    font-size: 12px;
    color: #999999;
    margin-left: 8px;
  }

  /* 图表区域 */
  .chart-section {
    width: 100%;
    margin-bottom: 24px;
  }

  .chart-title {
    font-size: 16px;
    color: #333333;
    display: block;
    text-align: center;
    margin-bottom: 16px;
  }

  .chart-wrapper {
    width: 100%;
    height: 200px;
    display: flex;
    align-items: center;
  }

  .y-axis {
    width: 60px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-size: 12px;
    color: #999999;
    text-align: right;
    padding-right: 8px;
    box-sizing: border-box;
  }

  .chart-area {
    flex: 1;
    height: 100%;
    position: relative;
  }

  .line-chart {
    width: 100%;
    height: 160px;
  }

  .x-axis {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-around;
    font-size: 12px;
    color: #999999;
  }

  /* 剩余天数区域 */
  .remaining-section {
    width: 100%;
    text-align: center;
    margin-bottom: 32px;
  }

  .remaining-text {
    font-size: 16px;
    color: #333333;
  }

  /* 鼓励语区域 */
  .encourage-section {
    width: 100%;
    text-align: center;
  }

  .encourage-text {
    font-size: 24px;
    color: #419bf9;
    font-weight: bold;
  }
</style>