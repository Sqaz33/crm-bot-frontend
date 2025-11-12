import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [vue()],
    server: {
      host: env.VITE_DEV_HOST || 'localhost',
      allowedHosts: env.VITE_DEV_HOST ? [env.VITE_DEV_HOST] : [],
      proxy: {
        '/api/v2': {
          target: env.VITE_API_BASE,
          changeOrigin: true,
          secure: true,
          // rewrite: path => path.replace(/^\/api\/v2/, '/api/v2')
        }
      }
    }
  }
})
