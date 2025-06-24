import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: true, 
    allowedHosts: [
      'www.crm-bot.dev.groza1338.ru'
    ],
    proxy: {
      '/api': {
        target: 'https://api.crm-bot.dev.groza1338.ru',
        changeOrigin: true,
        secure: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
})