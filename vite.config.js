import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

const devProxyTarget = 'http://120.53.88.78:8082'
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
