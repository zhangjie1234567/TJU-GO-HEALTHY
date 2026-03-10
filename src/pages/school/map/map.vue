<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack">‹</view>
      <text class="title">地图</text>
    </view>

    <view class="content">
      <text class="placeholder">地图内容（待实现）</text>
      <view class="list">
        <view class="loc" v-for="loc in locations" :key="loc.id">{{ loc.name }} - {{ loc.type }}</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const apiUrl = ref('http://localhost:8080')
const locations = ref([])

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
  } catch (e) { console.warn(e); return null }
}

onMounted(async () => {
  const res = await apiGet('/maps')
  if (res && res.data) locations.value = res.data
  else locations.value = [{ id:1, name: '图书馆', type:'学习' }, { id:2, name: '体育馆', type:'运动' }]
})

const goBack = () => { try{ if (typeof uni !== 'undefined' && uni.navigateBack) { uni.navigateBack({ delta: 1 }); return } } catch(e){} if (window && window.history) window.history.back() }
</script>

<style lang="scss" scoped>
.page { width: 100%; min-height:100vh; background:#fff; padding-top:24rpx }
.header { display:flex; align-items:center; height:88rpx; padding:0 24rpx }
.back { font-size:48rpx; line-height:88rpx; width:88rpx }
.title { font-size:36rpx; font-weight:700; margin-left:8rpx }
.content { padding:24rpx }
.list { margin-top:12rpx }
.loc { padding:12rpx; border-bottom:1rpx solid #eee }
</style>
