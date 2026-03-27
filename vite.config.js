import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',
  server: {
    port: 5173,
    host: true,
    strictPort: true  // 如果端口被占用，直接报错而不是尝试其他端口
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-xlsx': ['xlsx'],
          'vendor-utils': ['jszip', 'qrcode'],
          'vendor-vue': ['vue']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false
  }
})