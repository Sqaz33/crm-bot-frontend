import api from './index'

export const loginViaTelegram = initData =>
  api.post('/telegram/login', { init_data: initData })

export const exchangeToken = temporaryToken =>
  api.post('/telegram/exchange', { temporary_token: temporaryToken })

export const refreshToken = refreshToken =>
  api.post('/refresh', { refresh_token: refreshTokoken })