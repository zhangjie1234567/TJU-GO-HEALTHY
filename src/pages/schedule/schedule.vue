<template>
  <view class="container">
    <!-- 1. 顶部搜索栏 -->
    <view class="search-box">
      <view class="search-bar">
        <text class="search-icon">🔍</text>
        <input v-model="searchQuery" @input="performSearch" type="text" class="search-input" placeholder="请输入菜品或饮品"/>
        <text class="menu-icon" @click="clearSearch">✕</text>
      </view>
    </view>

    <!-- 搜索结果板块 -->
    <view v-if="searchQuery" class="search-results">
      <view class="results-header">
        <text class="results-title">搜索结果</text>
        <text class="results-count" v-if="!isSearching">(共{{ searchResults.length }}个)</text>
        <text class="results-count" v-else>搜索中...</text>
      </view>
      <view v-if="searchResults.length > 0" class="results-grid">
        <view v-for="(item, index) in searchResults" :key="index" class="result-item" @click="handleSearchItemClick(item)">
          <text class="result-emoji">{{ item.emoji || '📦' }}</text>
          <text class="result-name">{{ item.name }}</text>
          <text class="result-category">{{ item.category }}</text>
        </view>
      </view>
      <view v-else-if="!isSearching" class="empty-results">
        <text>未找到匹配的内容</text>
      </view>
    </view>

    <!-- 2. 热门入口 (Grid布局) -->
    <view class="grid-section">
      <view class="grid-item drink-bg" @click="goToPage('/pages/schedule/drinks')">
        <text class="grid-emoji">🧋</text>
        <text class="card-title">热门饮品</text>
      </view>
      <view class="grid-item recipe-bg" @click="goToPage('/pages/schedule/recipes')">
        <text class="grid-emoji">👨‍🍳</text>
        <text class="card-title">热门食谱</text>
      </view>
    </view>

    <!-- 3. 每日打卡任务（完善版） -->
    <view class="task-card">
      <view class="task-header">
        <text class="task-title">📋 每日打卡任务</text>
        <text class="add-btn" @click="showAddTaskModal = true">+ 添加</text>
      </view>

      <!-- 今日打卡情况 -->
      <view class="punch-stats">
        <view class="stat-item">
          <text class="stat-num">{{ completedCount }}/{{ tasks.length }}</text>
          <text class="stat-label">已完成</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ punchTodayCount }}</text>
          <text class="stat-label">今日打卡</text>
        </view>
      </view>

      <!-- 任务列表 -->
      <view class="task-list">
        <view class="task-row" v-for="(task, index) in tasks" :key="index">
          <view class="task-left">
            <view class="checkbox" :class="{ checked: task.done }" @click="toggleTask(index)">
              <text v-if="task.done" class="check-mark">✔</text>
            </view>
            <view class="task-info">
              <text class="task-name" :class="{ completed: task.done }">{{ task.name }}</text>
              <text class="task-time" v-if="task.punchTime">{{ task.punchTime }}</text>
            </view>
          </view>
          <view class="task-actions">
            <text class="punch-btn" @click="punchTask(index)" v-if="!task.punchedToday">打卡</text>
            <text class="punch-btn cancel-punch" @click="cancelPunch(index)" v-else>✓已打卡</text>
            <text class="edit-btn" @click="editTask(index)">编辑</text>
            <text class="delete-btn" @click="deleteTask(index)">删除</text>
          </view>
        </view>
      </view>

      <!-- 无任务提示 -->
      <view class="empty-state" v-if="tasks.length === 0">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无任务，点击上方"+ 添加"创建任务</text>
      </view>
    </view>

    <!-- 4. 计划与课程入口 -->
    <view class="grid-section">
      <view class="grid-item fasting-bg" @click="goToPage('/pages/schedule/fasting')">
        <text class="grid-emoji">⏳</text>
        <text class="card-title">断食计划</text>
      </view>
      <view class="grid-item course-bg" @click="goToPage('/pages/schedule/courses')">
        <text class="grid-emoji">🎓</text>
        <text class="card-title">课程推荐</text>
      </view>
    </view>

    <!-- 5. 健康小知识 (Swiper滚动) -->
    <view class="info-card">
      <view class="info-header">
        <text class="info-icon">💡</text>
        <text class="info-title">健康小知识</text>
      </view>
      <swiper class="info-swiper" vertical autoplay circular :interval="3000">
        <swiper-item v-for="(item, index) in healthTips" :key="index">
          <view class="info-content">{{ item }}</view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 6. 运动游戏入口 -->
    <view class="game-card" @click="goToGames">
      <view class="game-bg">
        <view class="game-header">🎮 运动游戏</view>
        <view class="game-figure">🏃</view>
      </view>
      <view class="game-content">
        <view class="game-icons">
          <view class="game-icon-item">🏋️</view>
          <view class="game-icon-item">🧘</view>
          <view class="game-icon-item">🥊</view>
        </view>
        <view class="game-desc">智能深蹲 · 平衡挑战 · 拳击训练</view>
      </view>
    </view>

    <!-- 底部占位，防止被TabBar遮挡 -->
    <view style="height: 100rpx;"></view>

    <!-- 添加/编辑任务弹窗 -->
    <view v-if="showAddTaskModal" class="modal-overlay" @click="showAddTaskModal = false">
      <view class="modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingIndex !== null ? '编辑任务' : '添加任务' }}</text>
          <text class="close-btn" @click="showAddTaskModal = false">✕</text>
        </view>
        <view class="modal-body">
          <input v-model="newTaskName" class="modal-input" placeholder="请输入任务名称" maxlength="20"/>
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="showAddTaskModal = false">取消</button>
          <button class="confirm-btn" @click="confirmAddTask">{{ editingIndex !== null ? '更新' : '添加' }}</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 任务数据
const tasks = ref([])
const showAddTaskModal = ref(false)
const newTaskName = ref('')
const editingIndex = ref(null)

// 搜索数据
const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)

// 搜索函数
const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  isSearching.value = true
  try {
    // 使用本地mock数据（不需要后端）
    const mockSearchResults = [
      { id: 1, name: '经典绿茶', type: 'drink', category: '茶类', emoji: '🍵' },
      { id: 2, name: '咖啡拿铁', type: 'drink', category: '咖啡', emoji: '☕' },
      { id: 3, name: '三文鱼沙拉', type: 'recipe', category: '鱼类', emoji: '🥗' },
      { id: 4, name: '番茄鸡蛋面', type: 'recipe', category: '面食', emoji: '🍜' },
      { id: 5, name: '健身鸡胸肉', type: 'recipe', category: '禽肉', emoji: '🍗' },
      { id: 6, name: '7天瑜伽入门', type: 'course', category: '瑜伽', emoji: '🧘' },
      { id: 7, name: '30分钟HIIT训练', type: 'course', category: '有氧', emoji: '💪' },
      { id: 8, name: '新鲜果汁', type: 'drink', category: '果汁', emoji: '🧃' }
    ]
    
    // 搜索过滤
    const filtered = mockSearchResults.filter(item => 
      item.name.includes(searchQuery.value) || 
      item.category.includes(searchQuery.value) ||
      item.type.includes(searchQuery.value)
    )
    
    searchResults.value = filtered.slice(0, 8)
  } catch (error) {
    console.error('搜索请求失败:', error)
    uni.showToast({ title: '搜索出错', icon: 'none' })
    searchResults.value = []
  } finally {
    isSearching.value = false
  }
}

// 清除搜索
const clearSearch = () => {
  searchQuery.value = ''
}

// 处理搜索结果点击
const handleSearchItemClick = (item) => {
  if (item.type === 'drink') {
    goToPage('/pages/schedule/drinks')
  } else if (item.type === 'recipe') {
    goToPage('/pages/schedule/recipes')
  }
  clearSearch()
}

// 打卡统计
const completedCount = computed(() => tasks.value.filter(t => t.done).length)
const punchTodayCount = computed(() => tasks.value.filter(t => t.punchedToday).length)

// 健康小知识
const healthTips = ref([
  "💧 成年人建议每天喝1500-2000毫升温水，少量多次饮用。",
  "🍽️ 饭后30分钟不要剧烈运动，静坐休息有助消化。",
  "😴 每天保持7-8小时充足睡眠，有助于新陈代谢。",
  "🥗 早餐要吃好，午餐要吃饱，晚餐要吃少，均衡最重要。",
  "🏃 每周至少进行150分钟有氧运动，增强心肺功能。",
  "🚴 坚持运动与健康饮食相结合，养成良好生活习惯。",
  "💪 循序渐进锻炼，避免过度运动，科学健身最有效。"
])

// 加载本地数据
onMounted(() => {
  loadTasks()
})

// 加载任务
const loadTasks = () => {
  try {
    const saved = uni.getStorageSync('schedule_tasks')
    if (saved) {
      tasks.value = saved
    } else {
      // 默认任务
      tasks.value = [
        { name: '早起', done: true, punchedToday: true, punchTime: '06:30' },
        { name: '喝水', done: true, punchedToday: false, punchTime: '' },
        { name: '跑步', done: false, punchedToday: false, punchTime: '' }
      ]
    }
  } catch (e) {
    console.error('加载任务失败', e)
  }
}

// 保存任务到本地
const saveTasks = () => {
  try {
    uni.setStorageSync('schedule_tasks', tasks.value)
  } catch (e) {
    console.error('保存任务失败', e)
  }
}

// 切换任务完成状态 - 同时进行打卡
const toggleTask = (index) => {
  tasks.value[index].done = !tasks.value[index].done
  
  // 如果勾选完成，则自动打卡
  if (tasks.value[index].done) {
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    tasks.value[index].punchedToday = true
    tasks.value[index].punchTime = timeStr
    uni.showToast({ title: '打卡成功！', icon: 'success' })
  } else {
    // 如果取消完成，则取消打卡
    tasks.value[index].punchedToday = false
    tasks.value[index].punchTime = ''
    uni.showToast({ title: '已取消打卡', icon: 'success' })
  }
  
  saveTasks()
}

// 打卡任务
const punchTask = (index) => {
  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  
  tasks.value[index].punchedToday = true
  tasks.value[index].punchTime = timeStr
  tasks.value[index].done = true
  
  uni.showToast({ title: '打卡成功！', icon: 'success' })
  saveTasks()
}

// 取消打卡
const cancelPunch = (index) => {
  uni.showModal({
    title: '取消打卡',
    content: '确定要取消本次打卡吗？',
    success: (res) => {
      if (res.confirm) {
        tasks.value[index].punchedToday = false
        tasks.value[index].punchTime = ''
        tasks.value[index].done = false
        uni.showToast({ title: '已取消打卡', icon: 'success' })
        saveTasks()
      }
    }
  })
}

// 编辑任务
const editTask = (index) => {
  editingIndex.value = index
  newTaskName.value = tasks.value[index].name
  showAddTaskModal.value = true
}

// 删除任务
const deleteTask = (index) => {
  uni.showModal({
    title: '删除任务',
    content: '确定要删除此任务吗？',
    success: (res) => {
      if (res.confirm) {
        tasks.value.splice(index, 1)
        saveTasks()
        uni.showToast({ title: '删除成功', icon: 'success' })
      }
    }
  })
}

// 确认添加/更新任务
const confirmAddTask = () => {
  if (!newTaskName.value.trim()) {
    uni.showToast({ title: '请输入任务名称', icon: 'none' })
    return
  }

  if (editingIndex.value !== null) {
    // 编辑模式
    tasks.value[editingIndex.value].name = newTaskName.value
    editingIndex.value = null
    uni.showToast({ title: '更新成功', icon: 'success' })
  } else {
    // 添加模式
    tasks.value.push({
      name: newTaskName.value,
      done: false,
      punchedToday: false,
      punchTime: ''
    })
    uni.showToast({ title: '添加成功', icon: 'success' })
  }

  saveTasks()
  showAddTaskModal.value = false
  newTaskName.value = ''
}

// 页面跳转
const goToPage = (url) => {
  uni.navigateTo({ url: url })
}

// 进入游戏页面
const goToGames = () => {
  uni.navigateTo({ url: '/pages/schedule/games' })
}
</script>

<style lang="scss" scoped>
$main-blue: #4FA1F2;
$light-blue: #80D0FF;
$bg-blue: #E3F2FD;
$text-title: #333;

.container {
  background: linear-gradient(135deg, #E3F2FD 0%, #F0F9FF 100%);
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
}

// 搜索栏
.search-box {
  margin-bottom: 30rpx;
  .search-bar {
    background: white;
    border-radius: 50rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    padding: 0 24rpx;
    gap: 12rpx;
    box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.15);
    
    .search-icon {
      font-size: 32rpx;
    }
    
    .search-input {
      flex: 1;
      font-size: 28rpx;
      background: transparent;
      border: none;
      outline: none;
    }
    
    .menu-icon {
      font-size: 28rpx;
      color: $main-blue;
      cursor: pointer;
    }
  }
}

// 搜索结果
.search-results {
  background: white;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);

  .results-header {
    display: flex;
    gap: 12rpx;
    margin-bottom: 16rpx;

    .results-title {
      font-size: 28rpx;
      font-weight: 700;
      color: #333;
    }

    .results-count {
      font-size: 24rpx;
      color: #999;
    }
  }

  .results-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12rpx;

    .result-item {
      background: linear-gradient(135deg, rgba(79, 161, 242, 0.1), rgba(128, 208, 255, 0.1));
      border-radius: 12rpx;
      padding: 16rpx;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;

      &:active {
        transform: scale(0.95);
        background: rgba(79, 161, 242, 0.2);
      }

      .result-emoji {
        display: block;
        font-size: 40rpx;
        margin-bottom: 8rpx;
      }

      .result-name {
        display: block;
        font-size: 22rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 4rpx;
      }

      .result-category {
        display: block;
        font-size: 18rpx;
        color: #999;
      }
    }
  }

  .empty-results {
    text-align: center;
    padding: 32rpx 0;
    color: #999;
    font-size: 24rpx;
  }
}

// Grid布局
.grid-section {
  display: flex;
  gap: 16rpx;
  margin-bottom: 30rpx;

  .grid-item {
    flex: 1;
    height: 180rpx;
    border-radius: 20rpx;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    color: white;
    font-weight: 600;
    box-shadow: 0 6rpx 16rpx rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
    
    &:active {
      transform: scale(0.98);
    }

    &.drink-bg { 
      background: linear-gradient(135deg, #FF6B6B 0%, #FF8E72 100%);
    }
    &.recipe-bg { 
      background: linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%);
    }
    &.fasting-bg { 
      background: linear-gradient(135deg, #FFD93D 0%, #FFA07A 100%);
    }
    &.course-bg { 
      background: linear-gradient(135deg, #6BCB77 0%, #4D96FF 100%);
    }

    .grid-emoji {
      font-size: 64rpx;
      line-height: 1;
      margin-bottom: 4rpx;
    }

    .grid-icon {
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
    }

    .card-title {
      font-size: 28rpx;
      font-weight: 600;
      text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.2);
    }
  }
}

// 任务卡片
.task-card {
  background: white;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(79, 161, 242, 0.12);

  .task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    
    .task-title {
      font-size: 32rpx;
      font-weight: 700;
      color: $text-title;
    }
    
    .add-btn {
      background: $main-blue;
      color: white;
      padding: 8rpx 20rpx;
      border-radius: 20rpx;
      font-size: 24rpx;
      font-weight: 600;
    }
  }

  // 统计信息
  .punch-stats {
    display: flex;
    gap: 20rpx;
    margin-bottom: 24rpx;
    padding: 20rpx;
    background: rgba(79, 161, 242, 0.08);
    border-radius: 16rpx;
    
    .stat-item {
      flex: 1;
      text-align: center;
      
      .stat-num {
        display: block;
        font-size: 36rpx;
        font-weight: 700;
        color: $main-blue;
        margin-bottom: 4rpx;
      }
      
      .stat-label {
        display: block;
        font-size: 24rpx;
        color: #999;
      }
    }
  }

  // 任务列表
  .task-list {
    .task-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }

      .task-left {
        display: flex;
        align-items: center;
        gap: 16rpx;
        flex: 1;
        
        .checkbox {
          width: 44rpx;
          height: 44rpx;
          border-radius: 50%;
          border: 2rpx solid $light-blue;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          transition: all 0.2s ease;
          
          &.checked {
            background: $main-blue;
            border-color: $main-blue;
          }
          
          .check-mark {
            color: white;
            font-size: 24rpx;
            font-weight: bold;
          }
        }

        .task-info {
          display: flex;
          flex-direction: column;
          gap: 4rpx;
          
          .task-name {
            font-size: 28rpx;
            color: $text-title;
            font-weight: 500;
            
            &.completed {
              color: #999;
              text-decoration: line-through;
            }
          }
          
          .task-time {
            font-size: 20rpx;
            color: $main-blue;
          }
        }
      }

      .task-actions {
        display: flex;
        gap: 12rpx;
        
        .punch-btn,
        .punched,
        .edit-btn,
        .delete-btn {
          font-size: 20rpx;
          padding: 6rpx 12rpx;
          border-radius: 12rpx;
          text-align: center;
        }

        .punch-btn {
          background: $main-blue;
          color: white;
          font-weight: 600;

          &.cancel-punch {
            background: #e8f5e9;
            color: #4caf50;
          }
        }

        .punched {
          background: #e8f5e9;
          color: #4caf50;
          font-weight: 600;
        }

        .edit-btn {
          background: #fff3e0;
          color: #ff9800;
        }

        .delete-btn {
          background: #ffebee;
          color: #f44336;
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 60rpx 20rpx;
    
    .empty-icon {
      display: block;
      font-size: 80rpx;
      margin-bottom: 16rpx;
    }
    
    .empty-text {
      font-size: 26rpx;
      color: #999;
    }
  }
}

// 健康小知识
.info-card {
  background: linear-gradient(135deg, rgba(79, 161, 242, 0.08), rgba(128, 208, 255, 0.08));
  border: 2rpx solid rgba(79, 161, 242, 0.15);
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(79, 161, 242, 0.08);
  
  .info-header {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 20rpx;
    
    .info-icon {
      font-size: 40rpx;
      animation: pulse 2s ease-in-out infinite;
    }
    
    .info-title {
      font-size: 30rpx;
      font-weight: 700;
      color: $text-title;
      background: linear-gradient(135deg, #4FA1F2, #80D0FF);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
  
  .info-swiper {
    height: 160rpx;
    
    .info-content {
      padding: 28rpx 24rpx;
      font-size: 28rpx;
      color: #333;
      line-height: 1.8;
      background: white;
      border-radius: 16rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
      border-left: 6rpx solid #4FA1F2;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

// 游戏卡片
.game-card {
  border-radius: 24rpx;
  overflow: hidden;
  background: white;
  box-shadow: 0 6rpx 20rpx rgba(79, 161, 242, 0.12);
  margin-bottom: 30rpx;
  transition: all 0.3s ease;
  
  &:active {
    transform: translateY(-4rpx);
    box-shadow: 0 12rpx 28rpx rgba(79, 161, 242, 0.16);
  }
  
  .game-bg {
    position: relative;
    padding: 24rpx;
    background: linear-gradient(135deg, #FF6B6B 0%, rgba(255, 255, 255, 0.5) 100%); /* Even lighter right side */
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 110rpx;
    overflow: hidden;
    
    .game-header {
      font-size: 32rpx;
      font-weight: 700;
      z-index: 1;
    }
    
    .game-figure {
      font-size: 100rpx;
      opacity: 0.38;
      position: absolute;
      right: -10rpx;
      bottom: -30rpx;
    }
  }
  
  .game-content {
    padding: 20rpx 24rpx;
    
    .game-icons {
      display: flex;
      justify-content: center;
      gap: 20rpx;
      margin-bottom: 12rpx;
      
      .game-icon-item {
        font-size: 48rpx;
        animation: bounce 2s ease-in-out infinite;
        
        &:nth-child(2) {
          animation-delay: 0.2s;
        }
        &:nth-child(3) {
          animation-delay: 0.4s;
        }
      }
    }
    
    .game-desc {
      font-size: 26rpx;
      color: #666;
      text-align: center;
      font-weight: 600;
      letter-spacing: 2rpx;
    }
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12rpx);
  }
}

// 模态框
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 999;

  .modal {
    width: 100%;
    background: white;
    border-radius: 32rpx 32rpx 0 0;
    padding: 32rpx;
    animation: slideUp 0.3s ease;

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24rpx;
      
      .modal-title {
        font-size: 32rpx;
        font-weight: 700;
        color: $text-title;
      }
      
      .close-btn {
        font-size: 28rpx;
        color: #999;
      }
    }

    .modal-body {
      margin-bottom: 32rpx;
      
      .modal-input {
        width: 100%;
        height: 80rpx;
        border: 2rpx solid $light-blue;
        border-radius: 12rpx;
        padding: 0 20rpx;
        font-size: 28rpx;
        box-sizing: border-box;
      }
    }

    .modal-footer {
      display: flex;
      gap: 16rpx;
      
      .cancel-btn,
      .confirm-btn {
        flex: 1;
        height: 80rpx;
        border-radius: 12rpx;
        font-size: 28rpx;
        font-weight: 600;
        border: none;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .cancel-btn {
        background: #f0f0f0;
        color: #666;
      }

      .confirm-btn {
        background: $main-blue;
        color: white;
      }
    }
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>