<template>
  <view class="diary-bg">
    <view class="diary-header">
      <button class="add-btn" @click="showAddPopup = true">+ 新建日记</button>
    </view>
    <view v-if="diaryList.length === 0" class="empty-tip">
      <text>暂无日记，快来记录你的生活吧！</text>
    </view>
    <view v-else class="diary-list">
      <view v-for="(item, idx) in diaryList" :key="item.id" class="diary-item">
        <view class="diary-content">
          <text class="diary-date">{{ item.date }}</text>
          <text class="diary-text">{{ item.text }}</text>
        </view>
        <view class="diary-actions">
          <button size="mini" @click="editDiary(idx)">编辑</button>
          <button size="mini" type="warn" @click="deleteDiary(idx)">删除</button>
        </view>
      </view>
    </view>

    <!-- 新建/编辑弹窗 -->
    <view v-if="showAddPopup" class="popup-mask">
      <view class="popup-content">
        <view class="popup-title">{{ editIdx === null ? '新建日记' : '编辑日记' }}</view>
        <textarea v-model="inputText" class="diary-input" placeholder="请输入你的日记..." maxlength="500" auto-focus="true"></textarea>
        <view class="popup-btn-row">
          <view class="popup-btn" @click="showAddPopup = false">取消</view>
          <view class="popup-btn confirm" @click="saveDiary">保存</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
  import {
    ref,
    onMounted
  } from 'vue'

  const diaryList = ref([])
  const showAddPopup = ref(false)
  const inputText = ref('')
  const editIdx = ref(null)

  // 加载日记
  function loadDiary() {
    try {
      diaryList.value = JSON.parse(uni.getStorageSync('diaryList') || '[]')
    } catch {
      diaryList.value = []
    }
  }
  onMounted(loadDiary)

  // 保存日记
  function saveDiary() {
    const text = inputText.value.trim()
    if (!text) {
      uni.showToast({
        title: '内容不能为空',
        icon: 'none'
      })
      return
    }
    const now = new Date()
    const dateStr =
      `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    if (editIdx.value === null) {
      // 新建
      diaryList.value.unshift({
        id: Date.now(),
        date: dateStr,
        text
      })
    } else {
      // 编辑
      diaryList.value[editIdx.value].text = text
      diaryList.value[editIdx.value].date = dateStr
    }
    uni.setStorageSync('diaryList', JSON.stringify(diaryList.value))
    showAddPopup.value = false
    inputText.value = ''
    editIdx.value = null
  }

  // 编辑日记
  function editDiary(idx) {
    inputText.value = diaryList.value[idx].text
    editIdx.value = idx
    showAddPopup.value = true
  }

  // 删除日记
  function deleteDiary(idx) {
    uni.showModal({
      title: '确认删除',
      content: '确定要删除这条日记吗？',
      success: res => {
        if (res.confirm) {
          diaryList.value.splice(idx, 1)
          uni.setStorageSync('diaryList', JSON.stringify(diaryList.value))
        }
      }
    })
  }
</script>

<style>
  .diary-bg {
    min-height: 100vh;
    background: linear-gradient(135deg, #E3F2FD 0%, #F0F9FF 100%);
    padding: 24rpx;
    box-sizing: border-box;
  }

  .diary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
  }

  .add-btn {
    background: #53B1EF;
    color: #fff;
    border-radius: 8px;
    font-size: 16px;
    padding: 6px 18px;
    font-weight: 600;
    border: none;
  }

  .empty-tip {
    text-align: center;
    color: #999;
    font-size: 16px;
    margin-top: 32px;
  }

  .diary-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .diary-item {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(79, 161, 242, 0.08);
    padding: 18px 16px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .diary-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .diary-date {
    font-size: 14px;
    color: #53B1EF;
    margin-bottom: 4px;
  }

  .diary-text {
    font-size: 16px;
    color: #333;
    word-break: break-all;
  }

  .diary-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

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

  .diary-input {
    min-height: 80px;
    border-radius: 8px;
    border: 1px solid #e3f2fd;
    padding: 10px;
    font-size: 15px;
    margin-bottom: 12px;
    background: #f7f7fa;
    color: #333;
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
</style>