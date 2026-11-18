const DEFAULT_APP_KEYWORD = 'manager'

// getCurrentDomain 获取当前页面域名。
export function getCurrentDomain(): string {
  if (typeof window === 'undefined') return ''
  return String(window.location?.hostname || '').trim().toLowerCase()
}

// getExplicitAppKeyword 获取 URL 中显式指定的应用标识，兼容 Hash 路由。
export function getExplicitAppKeyword(): string {
  if (typeof window === 'undefined') return ''

  const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : ''
  const queryApp = new URLSearchParams(hashQuery).get('app') || new URLSearchParams(window.location.search).get('app')
  return String(queryApp || '').trim()
}

// resolveAppKeyword 解析当前应用：登录链接的 ?app= 优先（兼容 hash 路由），其次取登录页持久化的应用
export function resolveAppKeyword(): string {
  if (typeof window === 'undefined') return DEFAULT_APP_KEYWORD

  const queryApp = getExplicitAppKeyword()
  if (queryApp) return queryApp

  try {
    const saved = JSON.parse(localStorage.getItem('login-app') || '{}')
    if (saved?.app) return String(saved.app)
  } catch {
    // 本地存储损坏时忽略，回退默认应用
  }
  return DEFAULT_APP_KEYWORD
}

// 当前会话使用的应用标识，请求头 X-App-Key 与登录应用保持一致
let currentAppKeyword = resolveAppKeyword()

export const getAppKeyword = (): string => currentAppKeyword

export const setAppKeyword = (value?: string): void => {
  const next = String(value || '').trim()
  if (!next) return

  currentAppKeyword = next
  try {
    const saved = JSON.parse(localStorage.getItem('login-app') || '{}')
    localStorage.setItem('login-app', JSON.stringify({ ...saved, app: next }))
  } catch {
    // 本地存储不可用时仅保留内存态。
  }
}
