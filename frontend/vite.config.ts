import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000,
  },

  server: {
    port: 3000,
    proxy: {
      // 👉 Spring API (REST)
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },

      // 👉 Spring WebSocket
      '/ws': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
        secure: false,
      },

      // 👉 FastAPI AI 서버
      '/ai': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
