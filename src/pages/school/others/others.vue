<template>
  <view class="page">
    <view class="content">
      <view class="card">
        <text class="title">其他服务</text>
        <text class="desc">常用校内服务与联系方式</text>
      </view>

      <view class="card">
        <text class="section-title">校内服务入口</text>
        <view class="row" v-for="item in serviceEntries" :key="item.name" @click="goPage(item.url)">
          <view>
            <text class="name">{{ item.name }}</text>
            <text class="sub">{{ item.sub }}</text>
          </view>
          <text class="go">进入 ></text>
        </view>
      </view>

      <view class="card">
        <text class="section-title">常用电话</text>
        <view class="row" v-for="phone in phoneEntries" :key="phone.name">
          <view>
            <text class="name">{{ phone.name }}</text>
            <text class="sub">{{ phone.number }}</text>
          </view>
          <view class="row-actions">
            <text class="action" @click.stop="call(phone.number)">拨打</text>
            <text class="action" @click.stop="copy(phone.number)">复制</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
const serviceEntries = [
  { name: '校内饮水机', sub: '查看点位与使用说明', url: '/pages/school/facilities/water' },
  { name: '校内打印机', sub: '查看位置与可用状态', url: '/pages/school/facilities/printer' },
  { name: '校内打印店', sub: '查看店铺与营业信息', url: '/pages/school/facilities/print_shop' },
  { name: '校内超市', sub: '查看超市位置', url: '/pages/school/facilities/shop' },
  { name: '消费记录', sub: '查看校内服务消费', url: '/pages/school/facilities/records' }
]

const phoneEntries = [
  { name: '保卫处值班', number: '022-27404444' },
  { name: '后勤服务', number: '022-27405432' },
  { name: '校医院门诊', number: '022-27401303' }
]

const fallbackToHashRoute = (url) => {
  if (typeof window !== 'undefined') {
    window.location.hash = `#${url}`
  }
}

const goPage = (url) => {
  try {
    if (typeof uni !== 'undefined' && typeof uni.navigateTo === 'function') {
      uni.navigateTo({
        url,
        fail: () => fallbackToHashRoute(url)
      })
      return
    }
  } catch (e) {
    fallbackToHashRoute(url)
  }
  fallbackToHashRoute(url)
}

const call = (number) => {
  try {
    if (typeof uni !== 'undefined' && typeof uni.makePhoneCall === 'function') {
      uni.makePhoneCall({ phoneNumber: number })
      return
    }
  } catch (e) {}

  if (typeof window !== 'undefined') {
    window.location.href = `tel:${number}`
  }
}

const copy = (value) => {
  try {
    if (typeof uni !== 'undefined' && typeof uni.setClipboardData === 'function') {
      uni.setClipboardData({ data: value })
      return
    }
  } catch (e) {}

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(value)
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f7f8fa;
  padding: 24rpx;
  font-family: "PingFang SC", "Microsoft Yahei", Arial, sans-serif;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx;
  box-sizing: border-box;
}

.title {
  display: block;
  color: #111827;
  font-size: 38rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
}

.desc {
  display: block;
  color: #6b7280;
  font-size: 26rpx;
}

.section-title {
  display: block;
  color: #111827;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 12rpx;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 0;
  border-bottom: 1rpx solid #eceff3;
}

.row:last-child {
  border-bottom: none;
}

.name {
  display: block;
  color: #111827;
  font-size: 30rpx;
  margin-bottom: 4rpx;
}

.sub {
  display: block;
  color: #6b7280;
  font-size: 24rpx;
}

.go,
.action {
  color: #53b1ef;
  font-size: 26rpx;
}

.row-actions {
  display: flex;
  gap: 24rpx;
}
</style>
