import axios from 'axios'

export async function refreshToken(refreshToken) {
  return axios.post('/api/auth/refresh', {
    refresh_token: refreshToken
  })
  }