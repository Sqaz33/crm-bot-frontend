import { useAuthStore } from './stores/auth'
import { loginViaTelegram } from './api/auth'
import { getInitDataString } from './utils/telegram'

export async function ensureAccess() {
  const store = useAuthStore()
  // уже есть в памяти
  if (store.accessToken) return store.accessToken
  // попытка восстановить из sessionStorage
  store.initFromSession()
  if (store.accessToken) return store.accessToken

  // нет токена — логинимся через Telegram
  const initStr = getInitDataString()
  if (!initStr) throw new Error('init_data отсутствует')
  const { data } = await loginViaTelegram(initStr) // { access_token }
  if (!data?.access_token) throw new Error('login не вернул access_token')

  store.setAccess(data.access_token)
  return data.access_token
}