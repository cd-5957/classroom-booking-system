import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/classroom-booking-system/', // 添加这一行，与GitHub仓库名称匹配
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})