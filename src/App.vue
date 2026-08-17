<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
    
    // 检查是否已完成问卷且已有登录 token
    try {
      const questionnaireCompleted = uni.getStorageSync('questionnaireCompleted')
      const token = uni.getStorageSync('token') || uni.getStorageSync('auth_token') || uni.getStorageSync('access_token')
      
      // 如果已完成问卷且已登录，直接跳转到首页
      if (questionnaireCompleted === 'true' && token) {
        console.log('用户已完成问卷且已登录，跳转到首页')
        setTimeout(() => {
          const switchTask = uni.switchTab({
            url: '/pages/home/home',
            fail: (err) => {
              console.warn('switchTab失败，改用reLaunch兜底:', err)
              uni.reLaunch({
                url: '/pages/home/home',
                fail: (reErr) => {
                  console.error('reLaunch也失败:', reErr)
                }
              })
            }
          })
          if (switchTask && typeof switchTask.catch === 'function') {
            switchTask.catch(() => {})
          }
        }, 120)
      } else {
        console.log('用户首次使用或未登录，保持在登录页')
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
