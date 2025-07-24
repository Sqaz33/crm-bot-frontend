import api from './index'

export async function refreshToken(refreshToken) {
  return axios.post('/api/auth/refresh', {
    refresh_token: refreshToken
  })
}