const TOKEN_KEYS = ['token', 'auth_token', 'access_token', 'my_token']

export const getAuthToken = () => {
  for (const key of TOKEN_KEYS) {
    const token = uni.getStorageSync(key)
    if (token) return token
  }
  return ''
}

export const getAuthHeaders = (extra = {}) => {
  const headers = { ...(extra || {}) }
  const token = getAuthToken()

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export const isAuthError = (error) => {
  const message = String(error?.message || '')
  return /未登录|token|401|unauthorized|forbidden|登录失效/i.test(message)
}

export const handleAuthError = (error, title = '登录已失效，请重新登录') => {
  if (!isAuthError(error)) return false
  uni.showToast({ title, icon: 'none' })
  return true
}
