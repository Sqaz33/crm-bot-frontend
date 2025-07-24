import api from './index'

export async function refreshToken(refreshToken) {
  return api.post('/auth/refresh', {
    refresh_token: refreshToken
  })
}
