const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8080'
const LEGACY_API_BASE_URL = 'http://127.0.0.1:3000'

export const getApiBaseUrl = () => {
  const saved = uni.getStorageSync('api_base_url')
  if (!saved || saved === LEGACY_API_BASE_URL) {
    uni.setStorageSync('api_base_url', DEFAULT_API_BASE_URL)
    return DEFAULT_API_BASE_URL
  }
  return saved
}

export const setApiBaseUrl = (baseUrl) => {
  if (!baseUrl) return
  uni.setStorageSync('api_base_url', baseUrl)
}

export const apiRequest = ({ url, method = 'GET', data = {}, header = {} }) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${getApiBaseUrl()}${url}`,
      method,
      data,
      header,
      success: (res) => {
        const statusCode = res.statusCode || 500
        if (statusCode < 200 || statusCode >= 300) {
          reject(new Error(`HTTP ${statusCode}`))
          return
        }

        const body = res.data
        if (body && typeof body === 'object' && 'code' in body) {
          if (body.code !== 0) {
            reject(new Error(body.msg || 'API error'))
            return
          }
          resolve(body.data)
          return
        }

        resolve(body)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}
