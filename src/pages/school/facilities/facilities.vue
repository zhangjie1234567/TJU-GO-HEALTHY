<template>
  <view class="page">
    <view class="header">
      <view class="back" @click="goBack">‹</view>
      <text class="title">校内设施</text>
    </view>

    <view class="content">
      <view class="card water-card">
        <view class="water-top">
          <view>
            <text class="card-title">我的水卡</text>
            <text class="muted">消费记录</text>
          </view>
          <view class="stats">
            <text class="big">{{ cardVolume }}</text>
            <text class="muted small">ml</text>
          </view>
        </view>

        <view class="water-bottom">
          <view>
            <text class="muted">我的余额</text>
            <text class="balance">{{ balance }} 元</text>
          </view>
          <view class="actions">
            <button class="btn recharge" @click.stop>充值</button>
            <button class="btn history" @click.stop>明细</button>
          </view>
        </view>
      </view>

      <text class="section-title">位置</text>

      <view class="location-card" v-for="(loc, idx) in locations" :key="idx">
        <image class="loc-thumb" src="/static/school/main/facilities.png" mode="aspectFill" />
        <view class="loc-info">
          <text class="loc-name">{{ loc.name }}</text>
          <text v-if="loc.position && loc.position.indexOf('xxx') === -1" class="loc-pos">{{ loc.position }}</text>
        </view>
      </view>

      <text class="section-title">消费记录</text>
      <view class="records">
        <view v-for="r in records" :key="r.id || r.time || r.consumeTime" class="record-item">
          <view class="record-left">
            <text class="record-time">{{ formatDate(r.consumeTime || r.time || r.createdAt) }}</text>
            <text class="record-desc">{{ r.desc || r.note || r.location || '' }}</text>
          </view>
          <view class="record-right">
            <text :class="['amount', isDebit(r) ? 'debit' : 'credit']">{{ formatAmount(r) }}</text>
          </view>
        </view>
        <view v-if="records.length === 0" class="no-records">暂无消费记录</view>
      </view>

    </view>
  </view>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { getApiBaseUrl } from '@/config.js'

const apiUrl = ref(getApiBaseUrl())
const locations = reactive([])
const records = ref([])
const cardVolume = ref('5600')
const balance = ref(56)

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

const formatDate = (iso) => {
  if (!iso) return ''
  // accept '2026-03-10T13:45:09' or '2026-03-10 13:45:09' or timestamp
  try {
    let s = String(iso)
    s = s.replace('T', ' ')
    // remove seconds if present
    const m = s.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})(:?\d{2})?/) 
    if (m) return `${m[1]} ${m[2]}`
    return s
  } catch (e) { return String(iso) }
}

const isDebit = (r) => {
  if (r.type) {
    const t = String(r.type).toLowerCase()
    return t === 'debit' || t === 'expense' || t === 'consume'
  }
  // fallback: negative amount implies debit
  if (typeof r.amount === 'number') return r.amount < 0
  const amt = parseFloat(r.amount)
  if (!isNaN(amt)) return amt < 0
  // if unknown, assume debit
  return true
}

const formatAmount = (r) => {
  const raw = (r.amount !== undefined) ? r.amount : (r.value !== undefined ? r.value : '')
  const num = parseFloat(raw)
  if (!isNaN(num)) {
    const abs = Math.abs(num).toFixed(2).replace(/\.00$/, '')
    return (num < 0 ? '-' : '+') + abs
  }
  // fallback to string
  return String(raw)
}

const fetchFacilities = async () => {
  const res = await apiGet('/facilities')
  if (res && res.data) {
    locations.splice(0, locations.length, ...res.data)
  } else {
    locations.splice(0, locations.length, { name: '45教三楼饮水机', position: '' }, { name: '校内打印机', position: '' })
  }
}

const fetchRecords = async () => {
  const res = await apiGet('/facilities/records')
  let list = []
  if (res && res.data) list = res.data
  else if (Array.isArray(res)) list = res
  else list = [{ id: 1, amount: -0.58, consumeTime: '2026-03-10T13:45:09' }, { id: 2, amount: -0.27, consumeTime: '2026-03-10T13:44:50' }]
  // normalize amounts and sort by time desc
  records.value = list.map(it => ({ ...it }))
}

onMounted(async () => {
  await fetchFacilities()
  await fetchRecords()
})

const goBack = () => { try{ if (typeof uni !== 'undefined' && uni.navigateBack) { uni.navigateBack({ delta: 1 }); return } } catch(e){} if (window && window.history) window.history.back() }
</script>

<style lang="scss" scoped>
.page { min-height: 100vh; background: #fff; padding-top: 24rpx; font-family: "PingFang SC", "Microsoft Yahei", Arial, sans-serif }
.header { display:flex; align-items:center; height:88rpx; padding:0 24rpx }
.back { font-size:48rpx; line-height:88rpx; width:88rpx; color:#111 }
.title { font-size:36rpx; font-weight:700; margin-left:8rpx }
.content { padding:24rpx }

.card { background:#BEEAFB; border-radius:20rpx; padding:18rpx; margin-bottom:18rpx }
.water-card { border-radius:20rpx; padding:18rpx }
.water-top { display:flex; justify-content:space-between; align-items:center }
.card-title { font-size:28rpx; font-weight:800 }
.muted { color:#666; display:block }
.stats { text-align:right }
.big { font-size:34rpx; font-weight:800; color:#0b3b45 }
.small { font-size:22rpx }
.water-bottom { display:flex; justify-content:space-between; align-items:center; margin-top:14rpx }
.balance { font-size:26rpx; font-weight:800; color:#0b3b45 }
.actions { display:flex; gap:12rpx }
.btn { padding:8rpx 18rpx; border-radius:20rpx; border:none }
.recharge { background:#4ecdc4; color:#fff }
.history { background:#fff; color:#4ecdc4; border:1px solid #4ecdc4 }

.section-title { font-size:30rpx; font-weight:700; margin:12rpx 0 }
.location-card { display:flex; align-items:center; background:#fff; border-radius:12rpx; padding:12rpx; box-shadow:0 8rpx 20rpx rgba(0,0,0,0.06); margin-bottom:12rpx }
.loc-thumb { width:120rpx; height:80rpx; border-radius:10rpx; margin-right:14rpx }
.loc-name { font-size:26rpx; font-weight:700 }
.loc-pos { color:#999; margin-top:6rpx }

.records { margin-top:12rpx }
.record-item { display:flex; justify-content:space-between; align-items:center; background:#fff; border-radius:12rpx; padding:14rpx; margin-bottom:10rpx; box-shadow:0 6rpx 16rpx rgba(0,0,0,0.03) }
.record-left { display:flex; flex-direction:column }
.record-time { color:#666; font-size:22rpx; margin-bottom:6rpx }
.record-desc { color:#333; font-size:24rpx }
.record-right { text-align:right }
.amount { font-size:26rpx; font-weight:800 }
.debit { color:#ff4d4f }
.credit { color:#28a745 }
.no-records { color:#999; padding:18rpx; text-align:center }
</style>
