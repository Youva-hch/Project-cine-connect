import type { User } from '@/api/types'

const USER_COOKIE_NAME = 'cineconnect_user'
const USER_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

function isBrowser() {
  return typeof document !== 'undefined'
}

function getCookieRaw(name: string): string | null {
  if (!isBrowser()) return null
  const cookies = document.cookie ? document.cookie.split('; ') : []
  const row = cookies.find((item) => item.startsWith(`${name}=`))
  if (!row) return null
  return row.slice(name.length + 1)
}

function buildCookieAttributes(maxAge: number) {
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'
  const secureAttribute = isHttps ? '; Secure' : ''
  return `path=/; max-age=${maxAge}; SameSite=Lax${secureAttribute}`
}

export function setUserCookie<T extends object>(user: T) {
  if (!isBrowser()) return
  const payload = encodeURIComponent(JSON.stringify(user))
  document.cookie = `${USER_COOKIE_NAME}=${payload}; ${buildCookieAttributes(USER_COOKIE_MAX_AGE)}`
}

export function getUserCookie<T = User>(): T | null {
  const raw = getCookieRaw(USER_COOKIE_NAME)
  if (!raw) return null

  try {
    return JSON.parse(decodeURIComponent(raw)) as T
  } catch {
    clearUserCookie()
    return null
  }
}

export function clearUserCookie() {
  if (!isBrowser()) return
  document.cookie = `${USER_COOKIE_NAME}=; ${buildCookieAttributes(0)}`
}
