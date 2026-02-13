import { defineConfig, loadEnv } from "vite"
import vue from "@vitejs/plugin-vue"
import tailwindcss from "@tailwindcss/vite"
import { fileURLToPath, URL } from "node:url"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

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
