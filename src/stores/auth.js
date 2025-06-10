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
      localStorage.setItem('refresh_token', refresh_token)
    },
    logout() {
      this.accessToken = null
      this.refreshToken = null
      this.telegramId = null
      localStorage.removeItem('refresh_token')
    },
  },
})
