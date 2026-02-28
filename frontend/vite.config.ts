import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 최신 Vite 및 Rollup 환경에서 global 객체를 제공하기 위한 설정
export default defineConfig({
  plugins: [react()],
  define: {
    // 라이브러리의 global 참조 에러 방지용으로 globalThis 매핑
    global: 'globalThis',
  },
  build: {
    chunkSizeWarningLimit: 2000,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
        secure: false,
      },
      '/ai': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

