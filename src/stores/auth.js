import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null,
    refreshToken: null,
    telegramId: null,
  }),
  actions: {
    setTokens({ access_token, refresh_token }) {
      this.accessToken = access_token
      this.refreshToken = refresh_token
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
    },
    setTelegramId(id) {
      this.telegramId = id
    },
    logout() {
      this.accessToken = null
      this.refreshToken = null
      this.telegramId = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    },
    initFromLocal() {
      const at = localStorage.getItem('access_token')
      const rt = localStorage.getItem('refresh_token')
      if (at && rt) {
        this.accessToken = at
        this.refreshToken = rt
      }
    },
    initFromUrl() {
    
      const params = new URLSearchParams(window.location.search)
      const id = parseInt(params.get('user_id'))
      if (id) this.telegramId = id
    }
  },
})