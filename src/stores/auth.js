import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    telegramId: null,
    me: null,              
  }),
  actions: {
    setTelegramId(id) { this.telegramId = id ?? null },
    setMe(data) { this.me = data || null; this.telegramId = data?.telegram_id ?? null },
    clear() { this.telegramId = null; this.me = null },
  },
})
