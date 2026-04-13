import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

const devProxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8080'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
  //wanghaiye use proxy to solve cross-origin problems
  server: {
    proxy: {
      '/api': {
        target: devProxyTarget,
        changeOrigin: true,
      }
    }
  }
})
