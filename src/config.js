const runtimeConfig = typeof window !== 'undefined' && window.__APP_CONFIG ? window.__APP_CONFIG : {}

export function getEnv(key, fallback) {
  const runtimeVal = runtimeConfig[key]
  if (runtimeVal !== undefined && runtimeVal !== '') {
    return runtimeVal
  }

  const viteKey = `VITE_${key}`
  const viteVal = import.meta.env[viteKey]
  if (viteVal !== undefined && viteVal !== '') {
    return viteVal
  }

  return fallback
}
