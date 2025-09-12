import { defineStore } from 'pinia'
import { logoutWithToken } from '../api/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,   
    telegramId: null,
  }),
  actions: {
    setAccess(access_token) {
      this.accessToken = access_token || null
      if (access_token) {
        sessionStorage.setItem('access_token', access_token)
      } else {
        sessionStorage.removeItem('access_token')
      }
    },
    setTelegramId(id) {
      this.telegramId = id ?? null
    },
    async logout({ server = true, silent = false } = {}) {
      const token = this.accessToken || sessionStorage.getItem('access_token')
      if (server && token) {
        try { await logoutWithToken(token) } catch (e) { if (!silent) console.warn('logout API:', e) }
      }
      this.accessToken = null
      this.telegramId = null
      sessionStorage.removeItem('access_token')
    },
    initFromSession() {
      const at = sessionStorage.getItem('access_token')
      if (at) this.accessToken = at
    },
  },
})