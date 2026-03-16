import { defineConfig, loadEnv } from "vite"
import vue from "@vitejs/plugin-vue"
import tailwindcss from "@tailwindcss/vite"
import { fileURLToPath, URL } from "node:url"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const usePolling =
    env.VITE_USE_POLLING === "true" || process.env.CHOKIDAR_USEPOLLING === "true"
  const watchOptions = usePolling
    ? {
        usePolling: true,
        interval: Number(env.VITE_POLLING_INTERVAL || process.env.CHOKIDAR_INTERVAL || 1000),
      }
    : undefined

  return {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    server: {
      host: env.VITE_DEV_HOST || "localhost",
      allowedHosts: env.VITE_DEV_HOST ? [env.VITE_DEV_HOST] : [],
      watch: watchOptions,
      proxy: {
        "/api": {
          target: env.VITE_API_BASE,
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/api/, ""),
        },
      },
    },
  }
})
