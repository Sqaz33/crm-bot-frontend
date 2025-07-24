import api from './index'

export async function refreshToken(refreshToken) {
  const initData = localStorage.getItem('telegram_init')
  return axios.post('/api/auth/refresh', {
    refresh_token: refreshToken,
    init_data: initData || null
  })
}

