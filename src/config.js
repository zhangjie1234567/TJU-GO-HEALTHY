/**
 * 全局配置
 *
 * 开发阶段：后端在 IDEA 本地运行，默认 http://127.0.0.1:8080
 * 真机调试：改为本机局域网 IP，例如 http://192.168.1.100:8080
 * 正式部署：改为服务器地址 http://120.53.88.78:8080
 */
const DEFAULT_BASE_URL = 'http://127.0.0.1:8080'

function readRuntimeBaseUrl() {
	try {
		const saved = uni.getStorageSync('api_base_url')
		if (saved && typeof saved === 'string') {
			const trimmed = saved.trim()
			if (trimmed) return trimmed
		}
	} catch (_) {}
	return DEFAULT_BASE_URL
}

export const BASE_URL = readRuntimeBaseUrl()
