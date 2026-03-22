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
  import { BASE_URL } from '@/config.js'

  const diaryList = ref([])
  const showAddPopup = ref(false)
  const inputTitle = ref('')
  const inputText = ref('')
  const inputMood = ref(3)
  const editIdx = ref(null)
  const editDiaryId = ref(null)  // 编辑时记录日记ID
  const loading = ref(false)

  // API基础URL，从config.js中获取
  const API_BASE_URL = BASE_URL
  const API_BASE = API_BASE_URL + '/api/diary'

  // 获取token
  function getToken() {
    return uni.getStorageSync('token') || ''
  }

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

  // 加载日记列表
  function loadDiary() {
    loading.value = true
    uni.request({
      url: `${API_BASE}/list`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        console.log('日记列表响应:', res)
        if (res.statusCode === 200 && res.data.code === 200) {
          // 后端返回的格式为 { code: 200, message: '成功', data: [...] }
          const diaries = res.data.data || []
          // 转换后端数据格式为前端显示格式
          diaryList.value = diaries.map(item => ({
            id: item.id,
            date: item.diaryDate || formatDateTime(item.createTime),  // 使用diaryDate
            title: item.title || '',
            content: item.content,
            mood: item.mood || 3,
            _createTime: item.createTime,
            _updateTime: item.updateTime
          }))
        } else {
          uni.showToast({
            title: res.data.message || '加载日记失败',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: (err) => {
        console.error('日记列表请求失败:', err)
        uni.showToast({
          title: '日记加载失败: ' + (err.errMsg || '网络错误'),
          icon: 'none',
          duration: 2000
        })
      },
      complete: () => {
        loading.value = false
      }
    })
  }

  // 格式化日期时间
  function formatDateTime(dateStr) {
    if (!dateStr) return ''
    // 后端返回 "2026-03-16 10:30:00" 格式
    return dateStr
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
    editIdx.value = null
    editDiaryId.value = null
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
    
    const requestData = {
      title: inputTitle.value.trim(),
      content: text,
      mood: inputMood.value
    }

    if (editDiaryId.value === null) {
      // 新增日记
      uni.request({
        url: `${API_BASE}/add`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        data: requestData,
        success: (res) => {
          console.log('日记保存响应:', res)
          if (res.statusCode === 200 && res.data.code === 200) {
            const diary = res.data.data
            // 在列表顶部添加新日记
            diaryList.value.unshift({
              id: diary.id,
              date: diary.diaryDate || formatDateTime(diary.createTime),
              title: diary.title || '',
              content: diary.content,
              mood: diary.mood || 3,
              _createTime: diary.createTime,
              _updateTime: diary.updateTime
            })
            
            uni.showToast({
              title: '日记已保存',
              icon: 'success',
              duration: 1500
            })
            closePopup()
          } else {
            uni.showToast({
              title: res.data.message || '保存失败',
              icon: 'none',
              duration: 2000
            })
          }
        },
        fail: (err) => {
          console.error('日记保存请求失败:', err)
          uni.showToast({
            title: '保存失败: ' + (err.errMsg || '网络错误'),
            icon: 'none',
            duration: 2000
          })
        }
      })
    } else {
      // 编辑日记
      uni.request({
        url: `${API_BASE}/${editDiaryId.value}/edit`,
        method: 'PUT',
        header: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        data: requestData,
        success: (res) => {
          console.log('日记更新响应:', res)
          if (res.statusCode === 200 && res.data.code === 200) {
            const diary = res.data.data
            // 更新列表中的日记
            const index = diaryList.value.findIndex(d => d.id === editDiaryId.value)
            if (index !== -1) {
              diaryList.value[index] = {
                id: diary.id,
                date: diary.diaryDate || formatDateTime(diary.updateTime),
                title: diary.title || '',
                content: diary.content,
                mood: diary.mood || 3,
                _createTime: diary.createTime,
                _updateTime: diary.updateTime
              }
            }
            
            uni.showToast({
              title: '日记已更新',
              icon: 'success',
              duration: 1500
            })
            closePopup()
          } else {
            uni.showToast({
              title: res.data.message || '更新失败',
              icon: 'none',
              duration: 2000
            })
          }
        },
        fail: (err) => {
          console.error('日记更新请求失败:', err)
          uni.showToast({
            title: '保存失败: ' + (err.errMsg || '网络错误'),
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
  }

  // 编辑日记
  function editDiary(idx) {
    const diary = diaryList.value[idx]
    inputTitle.value = diary.title || ''
    inputText.value = diary.content || diary.text || ''
    inputMood.value = diary.mood || 3
    editIdx.value = idx
    editDiaryId.value = diary.id
    showAddPopup.value = true
  }

  // 删除日记
  function deleteDiary(idx) {
    const diaryId = diaryList.value[idx].id
    
    uni.showModal({
      title: '确认删除',
      content: '确定要删除这条日记吗？',
      success: res => {
        if (res.confirm) {
          uni.request({
            url: `${API_BASE}/${diaryId}/delete`,
            method: 'DELETE',
            header: {
              'Authorization': `Bearer ${getToken()}`,
              'Content-Type': 'application/json'
            },
            success: (response) => {
              console.log('日记删除响应:', response)
              if (response.statusCode === 200 && response.data.code === 200) {
                diaryList.value.splice(idx, 1)
                uni.showToast({
                  title: '删除成功',
                  icon: 'success',
                  duration: 1500
                })
              } else {
                uni.showToast({
                  title: response.data.message || '删除失败',
                  icon: 'none',
                  duration: 2000
                })
              }
            },
            fail: (err) => {
              console.error('日记删除请求失败:', err)
              uni.showToast({
                title: '网络错误',
                icon: 'none',
                duration: 2000
              })
            }
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