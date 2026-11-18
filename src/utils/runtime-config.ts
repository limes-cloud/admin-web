interface AdminWebRuntimeConfig {
  apiBaseUrl?: string
}

declare global {
  interface Window {
    __ADMIN_WEB_CONFIG__?: AdminWebRuntimeConfig
  }
}

const normalizeBaseURL = (value?: string) => (value ?? '').trim().replace(/\/+$/, '')

export const getAPIBaseURL = () => {
  const runtimeConfig = typeof window === 'undefined' ? undefined : window.__ADMIN_WEB_CONFIG__
  if (runtimeConfig && typeof runtimeConfig.apiBaseUrl === 'string') {
    return normalizeBaseURL(runtimeConfig.apiBaseUrl)
  }
  return normalizeBaseURL(import.meta.env.VITE_API_URL)
}
