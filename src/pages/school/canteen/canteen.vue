<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack">‹</view>
      <text class="title">食堂</text>
    </view>

    <view class="content">
      <view class="btn-primary" @click="goToChoice">今天吃什么?</view>

      <text class="section">食堂实时人流</text>
      <view class="info-card">
        <view class="row" v-for="(c, i) in canteens" :key="i">
          <text class="cname">{{ c.name }}</text>
          <view class="bar" :style="{ width: c.width, flex: 'none' }" />
        </view>
      </view>

      <text class="section">干饭日记</text>
      <view class="card" @click="goToDiary">干饭日记</view>

      <text class="section">今日菜单</text>
      <view class="menu-card canteen-list">
        <view class="canteen-item" v-for="(c,idx) in canteens" :key="idx" @click="goToMenu(c.name)">
          {{ c.name }}
        </view>
      </view>

      <view class="note">数据来自: {{ apiUrl }}</view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'

const apiUrl = ref('http://localhost:8080')
const canteens = reactive([
  { name: '留园', width: '75%' }, // 模拟人流 75%
  { name: '梅园', width: '40%' }, // 模拟人流 40%
  { name: '竹园', width: '80%' }, // 模拟人流 90%
  { name: '兰园', width: '20%' }, // 模拟人流 20%
  { name: '菊园', width: '55%' }, // 模拟人流 55%
  { name: '桃园', width: '35%' }  // 模拟人流 35%
])
const menuData = ref([])

const formatDate = (d) => {
  const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,'0'); const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`
}

const apiGet = async (path) => {
  const url = `${apiUrl.value}${path}`
  try {
    if (typeof uni !== 'undefined' && uni.request) {
      return new Promise((resolve, reject) => {
        // @ts-ignore
        uni.request({ url, method: 'GET', success: (res) => resolve(res.data), fail: reject })
      })
    }
    const res = await fetch(url)
    return await res.json()
  } catch (e) {
    console.warn('apiGet failed', e)
    return null
  }
}

const fetchMenus = async (canteenName) => {
  const today = formatDate(new Date())
  const res = await apiGet(`/canteens/menus?canteenName=${encodeURIComponent(canteenName)}&date=${today}`)
  if (res && res.data) {
    menuData.value = res.data
  } else {
    // fallback sample
    menuData.value = ['红烧肉', '宫保鸡丁', '青菜豆腐']
  }
}

onMounted(async () => {
  //await fetchMenus(canteens[0].name)
})

const goToChoice = () => {
  try {
    // @ts-ignore
    if (typeof uni !== 'undefined' && uni.navigateTo) {
      uni.navigateTo({ url: '/pages/school/canteen/choice' })
      return
    }
  } catch (e) {}
  // 浏览器环境 fallback
  const href = '/#/pages/school/canteen/choice'
  window.location.href = href
}

const goToDiary = () => {
  try {
    // @ts-ignore
    if (typeof uni !== 'undefined' && uni.navigateTo) {
      uni.navigateTo({ url: '/pages/school/canteen/demo' })
      return
    }
  } catch (e) {}
  // 浏览器环境 fallback
  const href = '/#/pages/school/canteen/demo'
  window.location.href = href
}

const goToMenu = async (canteenName) => {
  const today = formatDate(new Date())
  // call backend to fetch today's menu (best-effort, menu pages will also fetch)
  try {
    await apiGet(`/canteens/menus?canteenName=${encodeURIComponent(canteenName)}&date=${today}`)
  } catch (e) { /* ignore */ }

  const map = { '留园': 'liu', '梅园': 'mei', '竹园': 'zhu', '兰园': 'lan', '菊园': 'ju', '桃园': 'tao' }
  const code = map[canteenName] || ''
  try {
    if (typeof uni !== 'undefined' && uni.navigateTo) {
      const url = code ? `/pages/school/canteen/menu/${code}?canteenName=${encodeURIComponent(canteenName)}&date=${today}` : `/pages/school/canteen/menu/liu?canteenName=${encodeURIComponent(canteenName)}&date=${today}`
      // @ts-ignore
      uni.navigateTo({ url })
      return
    }
  } catch (e) {}
  const href = code ? `/#/pages/school/canteen/menu/${code}?canteenName=${encodeURIComponent(canteenName)}&date=${today}` : `/#/pages/school/canteen/menu/liu?canteenName=${encodeURIComponent(canteenName)}&date=${today}`
  window.location.href = href
}

const goBack = () => {
  try { if (typeof uni !== 'undefined' && uni.navigateBack) { uni.navigateBack({ delta: 1 }); return } } catch(e){}
  if (window && window.history) window.history.back()
}
</script>

<style lang="scss" scoped>
.page { min-height:100vh; background:#fff; padding-top:24rpx; font-family: "PingFang SC", "Microsoft Yahei", Arial, sans-serif }
.header { display:flex; align-items:center; height:88rpx; padding:0 24rpx }
.back { font-size:48rpx; line-height:88rpx; width:88rpx; color:#111 }
.title { font-size:36rpx; font-weight:700; margin-left:8rpx }
.content { padding:24rpx }
.btn-primary { display:block; background:#DFF4FF; text-align:center; padding:18rpx 0; border-radius:36rpx; font-size:28rpx; margin-bottom:18rpx }
.section { font-size:28rpx; font-weight:700; margin:12rpx 0 }
.info-card { background:#BEEAFB; border-radius:30rpx; padding:18rpx; margin-bottom:18rpx }
.row { display:flex; align-items:center; justify-content:space-between; margin-bottom:10rpx }
.cname { font-weight:700 }
.bar { flex:1; height:12rpx; background:rgba(0,0,0,0.12); margin-left:16rpx; border-radius:8rpx }
.card { background:#DFF4FF; border-radius:30rpx; padding:20rpx; text-align:center; margin-bottom:18rpx }
.menu-card { background:#BEEAFB; border-radius:18rpx; padding:16rpx; display:flex; flex-wrap:wrap; gap:12rpx }
.menu-item { background:#E8FFF9; padding:12rpx 18rpx; border-radius:20rpx }
.note { margin-top:14rpx; color:#666; font-size:22rpx }
/* 修改对应的样式 */
.row { 
  display: flex; 
  align-items: center; 
  justify-content: flex-start; /* 改为左对齐 */
  margin-bottom: 14rpx; 
}

.cname { 
  width: 80rpx; /* 固定名字宽度，让条对齐 */
  font-weight: 700; 
  font-size: 26rpx;
}

.bar { 
  height: 12rpx; 
  background: rgba(0,0,0,0.12); 
  margin-left: 20rpx; 
  border-radius: 8rpx; 
  /* 移除这里的 flex: 1; 因为我们要手动控制宽度 */
}

.canteen-list { display:flex; flex-wrap:wrap; gap:12rpx }
.canteen-item { background:#E8FFF9; padding:14rpx 18rpx; border-radius:18rpx; cursor:pointer; min-width:120rpx; text-align:center; font-weight:700 }
</style>
