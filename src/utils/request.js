import { getApiBaseUrl, setApiBaseUrl } from '@/config.js'

export { getApiBaseUrl, setApiBaseUrl }

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
          // 兼容旧约定(code=0)与当前后端约定(code=200)
          if (body.code !== 0 && body.code !== 200) {
            reject(new Error(body.message || body.msg || 'API error'))
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
