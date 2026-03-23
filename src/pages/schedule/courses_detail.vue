<template>
  <view class="container">
    <!-- 课程图片 -->
    <view class="image-section">
      <image class="course-image" :src="course.image" mode="aspectFill"></image>
      <view class="badge" v-if="course.badge">{{ course.badge }}</view>
    </view>

    <!-- 基本信息卡片 -->
    <view class="info-card">
      <view class="info-header">
        <text class="course-title">{{ course.title }}</text>
        <text class="level-tag" :class="'level-' + course.level">{{ getLevelLabel(course.level) }}</text>
      </view>

      <view class="stats-row">
        <view class="stat-box">
          <text class="stat-icon">👨‍🏫</text>
          <text class="stat-label">讲师</text>
          <text class="stat-value">{{ course.instructor }}</text>
        </view>
        <view class="stat-box">
          <text class="stat-icon">⭐</text>
          <text class="stat-label">评分</text>
          <text class="stat-value">{{ course.rating }}</text>
        </view>
        <view class="stat-box">
          <text class="stat-icon">👥</text>
          <text class="stat-label">学生</text>
          <text class="stat-value">{{ course.students }}</text>
        </view>
        <view class="stat-box">
          <text class="stat-icon">⏱️</text>
          <text class="stat-label">时长</text>
          <text class="stat-value">{{ course.duration }}</text>
        </view>
      </view>

      <text class="course-desc">{{ course.desc }}</text>
    </view>

    <!-- 详细内容 -->
    <view class="detail-sections">
      <!-- 课程介绍 -->
      <view class="section">
        <text class="section-title">📖 课程介绍</text>
        <text class="section-content">{{ course.introduction }}</text>
      </view>

      <!-- 学习内容 -->
      <view class="section">
        <text class="section-title">🎯 学习内容</text>
        <view class="content-list">
          <view class="content-item" v-for="(item, index) in course.learningContent" :key="index">
            <text class="item-number">{{ index + 1 }}</text>
            <text class="item-text">{{ item }}</text>
          </view>
        </view>
      </view>

      <!-- 适合人群 -->
      <view class="section">
        <text class="section-title">👤 适合人群</text>
        <view class="audience-box">
          <view v-for="(audience, index) in course.targetAudience" :key="index" class="audience-item">
            <text class="audience-text">{{ audience }}</text>
          </view>
        </view>
      </view>

      <!-- 课程特点 -->
      <view class="section">
        <text class="section-title">✨ 课程特点</text>
        <view class="features-box">
          <view v-for="(feature, index) in course.features" :key="index" class="feature-item">
            <text class="feature-icon">{{ feature.icon }}</text>
            <text class="feature-text">{{ feature.text }}</text>
          </view>
        </view>
      </view>

      <!-- 课程大纲 -->
      <view class="section">
        <text class="section-title">📚 课程大纲</text>
        <view class="outline-box">
          <view v-for="(section, index) in course.outline" :key="index" class="outline-item">
            <text class="outline-title">{{ section.title }}</text>
            <text class="outline-lessons">{{ section.lessons }}课时</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作 -->
    <view class="action-bar">
      <button class="action-btn favorite-btn" @click="toggleFavorite(course.id)">
        {{ isFavorited(course.id) ? '已收藏' : '+ 收藏' }}
      </button>
      <button class="action-btn enroll-btn">💳 立即报名</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { apiRequest } from '../../utils/request'

const favorites = ref([])
const loading = ref(false)
let courseId = null

const defaultCourse = {
  id: 1,
  title: '7天瑜伽入门课',
  desc: '零基础瑜伽课程，适合初学者。通过系统的教学，让你快速掌握瑜伽基础动作，改善身体柔韧性和平衡能力。',
  level: 'beginner',
  duration: '7天',
  instructor: '瑜伽教练',
  rating: '4.8',
  students: '2.3万',
  badge: '热门',
  price: '199元',
  image: 'https://via.placeholder.com/600x300/9370DB/FFFFFF?text=瑜伽',
  introduction: '这是一门为零基础学员设计的瑜伽入门课程。课程涵盖瑜伽的基础理论、正确的姿态调整、呼吸技巧等内容。通过7天的系统学习，你将能够掌握基本的瑜伽动作，并建立良好的练习习惯。',
  learningContent: [
    '瑜伽基础理论和哲学',
    '基础体式的正确做法',
    '呼吸调节技巧',
    '冥想和放松方法',
    '日常瑜伽练习计划'
  ],
  targetAudience: [
    '完全没有瑜伽经验的初学者',
    '想要提升身体柔韧性的人群',
    '寻求身心放松的人群',
    '想要改善睡眠质量的人群'
  ],
  features: [
    { icon: '🎥', text: '高清视频教学，支持离线下载' },
    { icon: '👨‍🏫', text: '专业教练一对一指导' },
    { icon: '📱', text: '随时随地学习，灵活安排' },
    { icon: '📊', text: '学习进度追踪和评估' }
  ],
  outline: [
    { title: '瑜伽基础入门', lessons: 3 },
    { title: '站立体式系列', lessons: 2 },
    { title: '坐姿和前向弯曲', lessons: 2 },
    { title: '冥想和放松', lessons: 1 }
  ]
}

const course = ref({ ...defaultCourse })

const normalizeLevel = (level) => {
  const map = {
    beginner: 'beginner',
    intermediate: 'intermediate',
    advanced: 'advanced',
    入门级: 'beginner',
    进阶级: 'intermediate',
    高级: 'advanced'
  }
  return map[level] || 'beginner'
}

const normalizeCourseDetail = (payload = {}) => {
  return {
    id: payload.id || defaultCourse.id,
    title: payload.title || payload.name || defaultCourse.title,
    desc: payload.desc || defaultCourse.desc,
    level: normalizeLevel(payload.level),
    duration: payload.duration || defaultCourse.duration,
    instructor: payload.instructor || defaultCourse.instructor,
    rating: payload.rating || defaultCourse.rating,
    students: payload.students || defaultCourse.students,
    badge: payload.badge || '',
    price: payload.price || defaultCourse.price,
    image: payload.image || defaultCourse.image,
    introduction: payload.introduction || defaultCourse.introduction,
    learningContent: Array.isArray(payload.learningContent) ? payload.learningContent : defaultCourse.learningContent,
    targetAudience: Array.isArray(payload.targetAudience) ? payload.targetAudience : defaultCourse.targetAudience,
    features: Array.isArray(payload.features) ? payload.features : defaultCourse.features,
    outline: Array.isArray(payload.outline) ? payload.outline : defaultCourse.outline
  }
}

const loadCourseDetail = async () => {
  if (!courseId) {
    course.value = { ...defaultCourse }
    return
  }

  loading.value = true
  try {
    const data = await apiRequest({
      url: `/api/courses/${courseId}`,
      method: 'GET'
    })
    const root = data?.course || data
    course.value = normalizeCourseDetail(root)
  } catch (error) {
    console.error('课程详情加载异常:', error)
    course.value = { ...defaultCourse }
    uni.showToast({ title: '接口未就绪，已显示示例数据', icon: 'none', duration: 2000 })
  } finally {
    loading.value = false
  }
}

// 难度标签映射
const getLevelLabel = (level) => {
  const map = {
    'beginner': '入门级',
    'intermediate': '进阶级',
    'advanced': '高级'
  }
  return map[level] || level
}

// 加载收藏
onMounted(() => {
  try {
    const saved = uni.getStorageSync('course_favorites')
    if (saved) {
      favorites.value = saved
    }
  } catch (e) {
    console.error('加载收藏失败', e)
  }
})

onLoad((options) => {
  courseId = options?.id ? Number(options.id) : null
  loadCourseDetail()
})

// 切换收藏
const toggleFavorite = (id) => {
  const index = favorites.value.indexOf(id)
  if (index > -1) {
    favorites.value.splice(index, 1)
  } else {
    favorites.value.push(id)
  }

  try {
    uni.setStorageSync('course_favorites', favorites.value)
    uni.showToast({ title: isFavorited(id) ? '已收藏' : '已取消收藏', icon: 'success', duration: 1500 })
  } catch (e) {
    console.error('保存收藏失败', e)
  }
}

// 检查是否收藏
const isFavorited = (id) => {
  return favorites.value.includes(id)
}
</script>

<style lang="scss" scoped>
$main-blue: #4FA1F2;
$light-blue: #80D0FF;
$bg-blue: #E3F2FD;

.container {
  background: linear-gradient(135deg, $bg-blue 0%, #F0F9FF 100%);
  min-height: 100vh;
  padding-bottom: 120rpx;
}

.image-section {
  position: relative;
  width: 100%;
  height: 300rpx;
  overflow: hidden;

  .course-image {
    width: 100%;
    height: 100%;
  }

  .badge {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    background: rgba(255, 107, 107, 0.95);
    color: white;
    padding: 8rpx 16rpx;
    border-radius: 16rpx;
    font-size: 24rpx;
    font-weight: 600;
  }
}

.info-card {
  background: white;
  margin: -30rpx 16rpx 0;
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(79, 161, 242, 0.1);
  position: relative;
  z-index: 1;

  .info-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .course-title {
      font-size: 32rpx;
      font-weight: 700;
      color: #333;
    }

    .level-tag {
      padding: 6rpx 12rpx;
      border-radius: 12rpx;
      font-size: 20rpx;
      font-weight: 600;
      color: white;

      &.level-beginner {
        background: rgba(76, 203, 119, 0.9);
      }

      &.level-intermediate {
        background: rgba(255, 195, 0, 0.9);
      }

      &.level-advanced {
        background: rgba(244, 67, 54, 0.9);
      }
    }
  }

  .stats-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 8rpx;
    margin-bottom: 16rpx;

    .stat-box {
      background: rgba(79, 161, 242, 0.06);
      border-radius: 12rpx;
      padding: 12rpx 8rpx;
      text-align: center;

      .stat-icon {
        display: block;
        font-size: 24rpx;
        margin-bottom: 4rpx;
      }

      .stat-label {
        display: block;
        font-size: 18rpx;
        color: #999;
        margin-bottom: 4rpx;
      }

      .stat-value {
        display: block;
        font-size: 20rpx;
        font-weight: 600;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .course-desc {
    font-size: 26rpx;
    color: #666;
    line-height: 1.6;
  }
}

.detail-sections {
  padding: 0 16rpx;
  margin-top: 16rpx;

  .section {
    background: white;
    border-radius: 16rpx;
    padding: 20rpx;
    margin-bottom: 16rpx;
    box-shadow: 0 4rpx 12rpx rgba(79, 161, 242, 0.08);

    .section-title {
      display: block;
      font-size: 28rpx;
      font-weight: 700;
      color: #333;
      margin-bottom: 16rpx;
    }

    .section-content {
      font-size: 26rpx;
      color: #666;
      line-height: 1.8;
    }
  }
}

.content-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;

  .content-item {
    display: flex;
    align-items: flex-start;
    gap: 12rpx;

    .item-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32rpx;
      height: 32rpx;
      background: $main-blue;
      color: white;
      border-radius: 50%;
      font-size: 18rpx;
      font-weight: 600;
      flex-shrink: 0;
    }

    .item-text {
      flex: 1;
      font-size: 26rpx;
      color: #666;
      line-height: 1.6;
    }
  }
}

.audience-box {
  display: flex;
  flex-direction: column;
  gap: 10rpx;

  .audience-item {
    background: rgba(79, 161, 242, 0.06);
    padding: 12rpx 16rpx;
    border-radius: 8rpx;
    border-left: 4rpx solid $main-blue;

    .audience-text {
      font-size: 26rpx;
      color: #666;
    }
  }
}

.features-box {
  display: flex;
  flex-direction: column;
  gap: 12rpx;

  .feature-item {
    display: flex;
    align-items: center;
    gap: 12rpx;

    .feature-icon {
      font-size: 28rpx;
      flex-shrink: 0;
    }

    .feature-text {
      font-size: 26rpx;
      color: #666;
    }
  }
}

.outline-box {
  display: flex;
  flex-direction: column;
  gap: 12rpx;

  .outline-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12rpx 16rpx;
    background: rgba(79, 161, 242, 0.06);
    border-radius: 8rpx;

    .outline-title {
      font-size: 26rpx;
      font-weight: 600;
      color: #333;
    }

    .outline-lessons {
      font-size: 20rpx;
      color: $main-blue;
      font-weight: 600;
    }
  }
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12rpx;
  padding: 16rpx;
  background: white;
  box-shadow: 0 -4rpx 12rpx rgba(79, 161, 242, 0.1);
  z-index: 100;

  .action-btn {
    flex: 1;
    height: 88rpx;
    border-radius: 12rpx;
    font-size: 28rpx;
    font-weight: 600;
    border: none;

    &.favorite-btn {
      background: white;
      color: $main-blue;
      border: 2rpx solid $main-blue;
    }

    &.enroll-btn {
      background: $main-blue;
      color: white;
    }
  }
}
</style>
