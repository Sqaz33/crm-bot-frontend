import { defineStore } from 'pinia'
import api from '../api'
import { logger } from '../utils/logger'
import { stripHtml } from '../utils/stripHtml'

let _pending = null

export const useSalonStore = defineStore('salon', {
  state: () => ({
    name: '',
    description: '',
    aboutCompany: '',
    address: '',
    addressUrl: '',
    logoUrl: '',
    rating: '',
    telegramLink: '',
    telegramUsername: '',
    timezone: 'UTC',
    loaded: false,
    error: false,
  }),
  actions: {
    async fetch() {
      if (this.loaded && !this.error) return
      if (_pending) return _pending
      _pending = this._doFetch()
      try {
        await _pending
      } finally {
        _pending = null
      }
    },
    async _doFetch() {
      try {
        const response = await api.get('/salon/info/')
        if (response.status === 200) {
          const d = response.data
          this.name = stripHtml(d.name || '')
          this.description = stripHtml(d.description || '')
          this.aboutCompany = stripHtml(d.about_company || '')
          this.address = d.address || ''
          this.addressUrl = d.address_url || ''
          this.logoUrl = d.logo_url || ''
          this.rating = d.rating || ''
          this.telegramLink = d.telegram_link || ''
          this.telegramUsername = d.telegram_username || ''
          this.timezone = d.timezone || 'UTC'
          this.loaded = true
          this.error = false
        } else {
          logger.warn('Salon store: non-200 response', {
            status: response.status,
            url: '/salon/info/',
          })
          this.error = true
          this.loaded = true
        }
      } catch (err) {
        logger.error('Salon store: network error', {
          message: err.message,
          url: '/salon/info/',
        })
        this.error = true
        this.loaded = true
      }
    },
  },
})
