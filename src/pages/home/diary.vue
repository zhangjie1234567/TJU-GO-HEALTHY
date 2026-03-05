<template>
  <view class="diary-bg">
    <view class="diary-header">
      <button class="add-btn" @click="openAddPopup">+ 新建日记</button>
    </view>
    <view v-if="diaryList.length === 0" class="empty-tip">
      <text>暂无日记，快来记录你的生活吧！</text>
    </view>
    <view v-else class="diary-list">
      <view v-for="(item, idx) in diaryList" :key="item.id" class="diary-item">
        <view class="diary-main">
          <view class="diary-header-info">
            <text class="diary-date">{{ item.date }}</text>
            <view class="diary-mood">
              <text class="mood-emoji">{{ getMoodEmoji(item.mood) }}</text>
            </view>
          </view>
          <text v-if="item.title" class="diary-title">{{ item.title }}</text>
          <text class="diary-text">{{ item.content }}</text>
          <view v-if="item.images && item.images.length > 0" class="diary-images">
            <image v-for="(img, imgIdx) in item.images" :key="imgIdx" :src="img" class="diary-image" mode="aspectFill" @click="previewImage(item.images, imgIdx)"></image>
          </view>
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
        
        <!-- 标题输入 -->
        <view class="form-item">
          <text class="form-label">标题（可选）</text>
          <input v-model="inputTitle" class="diary-title-input" placeholder="给日记取个标题吧~" maxlength="50" />
        </view>

        <!-- 心情选择 -->
        <view class="form-item">
          <text class="form-label">今天心情</text>
          <view class="mood-selector">
            <view 
              v-for="m in moodOptions" 
              :key="m.value" 
              class="mood-option" 
              :class="{ active: inputMood === m.value }"
              @click="inputMood = m.value"
            >
              <text class="mood-emoji-large">{{ m.emoji }}</text>
              <text class="mood-label">{{ m.label }}</text>
            </view>
          </view>
        </view>

        <!-- 内容输入 -->
        <view class="form-item">
          <text class="form-label">日记内容</text>
          <textarea v-model="inputText" class="diary-input" placeholder="记录今天的点点滴滴..." maxlength="2000"></textarea>
        </view>

        <!-- 图片上传 -->
        <view class="form-item">
          <text class="form-label">添加图片（最多3张）</text>
          <view class="image-upload-area">
            <view v-for="(img, idx) in inputImages" :key="idx" class="image-item">
              <image :src="img" class="uploaded-image" mode="aspectFill"></image>
              <view class="image-delete" @click="removeImage(idx)">×</view>
            </view>
            <view v-if="inputImages.length < 3" class="add-image-btn" @click="chooseImage">
              <text class="add-icon">+</text>
              <text class="add-text">添加图片</text>
            </view>
          </view>
        </view>

        <view class="popup-btn-row">
          <view class="popup-btn" @click="closePopup">取消</view>
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
  const inputTitle = ref('')
  const inputText = ref('')
  const inputMood = ref(3)
  const inputImages = ref([])
  const editIdx = ref(null)

  // 心情选项
  const moodOptions = [
    { value: 1, emoji: '😢', label: '很差' },
    { value: 2, emoji: '😕', label: '较差' },
    { value: 3, emoji: '😐', label: '一般' },
    { value: 4, emoji: '😊', label: '较好' },
    { value: 5, emoji: '😄', label: '很好' }
  ]

  // 获取心情emoji
  function getMoodEmoji(mood) {
    const option = moodOptions.find(m => m.value === mood)
    return option ? option.emoji : '😐'
  }

  // 加载日记
  function loadDiary() {
    try {
      diaryList.value = JSON.parse(uni.getStorageSync('diaryList') || '[]')
    } catch {
      diaryList.value = []
    }
  }
  onMounted(loadDiary)

  // 打开新建弹窗
  function openAddPopup() {
    resetForm()
    showAddPopup.value = true
  }

  // 关闭弹窗
  function closePopup() {
    showAddPopup.value = false
    resetForm()
  }

  // 重置表单
  function resetForm() {
    inputTitle.value = ''
    inputText.value = ''
    inputMood.value = 3
    inputImages.value = []
    editIdx.value = null
  }

  // 选择图片
  function chooseImage() {
    uni.chooseImage({
      count: 3 - inputImages.value.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        inputImages.value = [...inputImages.value, ...res.tempFilePaths]
      }
    })
  }

  // 删除图片
  function removeImage(idx) {
    inputImages.value.splice(idx, 1)
  }

  // 预览图片
  function previewImage(images, current) {
    uni.previewImage({
      urls: images,
      current: current
    })
  }

  // 保存日记
  function saveDiary() {
    const text = inputText.value.trim()
    if (!text) {
      uni.showToast({
        title: '内容不能为空',
        icon: 'none',
        duration: 2000
      })
      return
    }
    
    const now = new Date()
    const dateStr =
      `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
    
    const diaryData = {
      id: editIdx.value === null ? Date.now() : diaryList.value[editIdx.value].id,
      date: dateStr,
      title: inputTitle.value.trim(),
      content: text,
      mood: inputMood.value,
      images: [...inputImages.value]
    }

    if (editIdx.value === null) {
      // 新建
      diaryList.value.unshift(diaryData)
    } else {
      // 编辑
      diaryList.value[editIdx.value] = diaryData
    }
    
    uni.setStorageSync('diaryList', JSON.stringify(diaryList.value))
    
    uni.showToast({
      title: editIdx.value === null ? '日记已保存' : '日记已更新',
      icon: 'success',
      duration: 1500
    })
    
    closePopup()
  }

  // 编辑日记
  function editDiary(idx) {
    const diary = diaryList.value[idx]
    inputTitle.value = diary.title || ''
    inputText.value = diary.content || diary.text || ''
    inputMood.value = diary.mood || 3
    inputImages.value = diary.images ? [...diary.images] : []
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
          uni.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 1500
          })
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

  .diary-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .diary-header-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  .diary-date {
    font-size: 14px;
    color: #53B1EF;
  }

  .diary-mood {
    display: flex;
    align-items: center;
  }

  .mood-emoji {
    font-size: 20px;
  }

  .diary-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }

  .diary-text {
    font-size: 15px;
    color: #666;
    line-height: 1.6;
    word-break: break-all;
  }

  .diary-images {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }

  .diary-image {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    object-fit: cover;
  }

  .diary-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-left: 12px;
  }

  .popup-mask {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .popup-content {
    background: #fff;
    border-radius: 16px;
    width: 85vw;
    max-width: 500px;
    max-height: 80vh;
    padding: 24px 20px 20px 20px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .popup-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 20px;
    text-align: center;
    color: #333;
  }

  .form-item {
    margin-bottom: 18px;
  }

  .form-label {
    display: block;
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .diary-title-input {
    width: 100%;
    height: 40px;
    border-radius: 8px;
    border: 1px solid #e3f2fd;
    padding: 0 12px;
    font-size: 15px;
    background: #f7f7fa;
    box-sizing: border-box;
  }

  .mood-selector {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }

  .mood-option {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 8px;
    border-radius: 10px;
    background: #f5f5f5;
    border: 2px solid transparent;
    transition: all 0.3s;
  }

  .mood-option.active {
    background: #e3f2fd;
    border-color: #53B1EF;
  }

  .mood-emoji-large {
    font-size: 28px;
    margin-bottom: 4px;
  }

  .mood-label {
    font-size: 12px;
    color: #666;
  }

  .diary-input {
    width: 100%;
    min-height: 120px;
    border-radius: 8px;
    border: 1px solid #e3f2fd;
    padding: 12px;
    font-size: 15px;
    background: #f7f7fa;
    color: #333;
    line-height: 1.6;
    box-sizing: border-box;
  }

  .image-upload-area {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .image-item {
    position: relative;
    width: 80px;
    height: 80px;
  }

  .uploaded-image {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    object-fit: cover;
  }

  .image-delete {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #ff4444;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    line-height: 1;
  }

  .add-image-btn {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    border: 2px dashed #ccc;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #fafafa;
  }

  .add-icon {
    font-size: 28px;
    color: #999;
    line-height: 1;
  }

  .add-text {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
  }

  .popup-btn-row {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    gap: 12px;
  }

  .popup-btn {
    flex: 1;
    text-align: center;
    padding: 12px 0;
    font-size: 16px;
    border-radius: 8px;
    background: #f0f0f0;
    cursor: pointer;
    font-weight: 500;
  }

  .popup-btn.confirm {
    background: #53B1EF;
    color: #fff;
    font-weight: 600;
  }
</style>