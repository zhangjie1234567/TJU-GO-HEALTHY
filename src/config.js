/**
 * 环境与接口域名配置
 *
 * 说明：
 * 1) 接口路径只保留一套（如 /api/auth/login），通过 baseURL 区分环境。
 * 2) 可用 uni.setStorageSync('api_env', 'dev|test|prod') 手动切换环境。
 * 3) 可用 uni.setStorageSync('api_base_url', 'https://xxx') 临时覆盖地址。
 */

const STORAGE_ENV_KEY = 'api_env'
const STORAGE_BASE_URL_KEY = 'api_base_url'
const LEGACY_API_BASE_URL = 'http://127.0.0.1:3000'

const API_BASE_URL_MAP = {
    dev: '', // 本地开发环境，走 Vite 代理
    test: 'https://foodarrty.cn',
    prod: 'https://foodarrty.cn'
}

const normalizeEnv = (value) => {
	const env = String(value || '').trim().toLowerCase()
	return ['dev', 'test', 'prod'].includes(env) ? env : ''
}

const getModeDefaultEnv = () => {
	// 默认直接返回 prod，确保现在就是生产环境
	return 'prod'
}

export function getApiEnv() {
	try {
		const saved = normalizeEnv(uni.getStorageSync(STORAGE_ENV_KEY))
		if (saved) return saved
	} catch (_) {}
	return getModeDefaultEnv()
}

export function setApiEnv(env) {
	const normalized = normalizeEnv(env)
	if (!normalized) return
	uni.setStorageSync(STORAGE_ENV_KEY, normalized)
}

export function getApiBaseUrl() {
	try {
		const saved = String(uni.getStorageSync(STORAGE_BASE_URL_KEY) || '').trim()
		if (saved && saved !== LEGACY_API_BASE_URL) return saved
	} catch (_) {}

	const env = getApiEnv()
	const baseUrl = API_BASE_URL_MAP[env] || API_BASE_URL_MAP.dev
	uni.setStorageSync(STORAGE_BASE_URL_KEY, baseUrl)
	return baseUrl
}

export function setApiBaseUrl(baseUrl) {
	const next = String(baseUrl || '').trim()
	if (!next) return
	uni.setStorageSync(STORAGE_BASE_URL_KEY, next)
}

export const BASE_URL = API_BASE_URL_MAP['prod']
