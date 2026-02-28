<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
    
    // ✅ 检查是否已完成问卷且记住了登录信息
    try {
      const questionnaireCompleted = uni.getStorageSync('questionnaireCompleted')
      const rememberedStudentId = uni.getStorageSync('login_remember_studentId')
      
      // 如果已完成问卷且记住了登录信息，直接跳转到首页
      if (questionnaireCompleted === 'true' && rememberedStudentId) {
        console.log('✅ 用户已完成问卷且已记住登录，跳转到首页')
        uni.switchTab({
          url: '/pages/home/home'
        })
      } else {
        console.log('⏩ 用户首次使用或未记住登录，保持在登录页')
      }
    } catch (e) {
      console.error('检查用户状态失败:', e)
    }
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style>
/*每个页面公共css */
</style>
