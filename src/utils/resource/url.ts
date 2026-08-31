import { matchProxyHost } from '@/utils/proxyRules'

const normalizeHost = (host: string) => host.replace(/\/$/, '')

const resolveResourceUrl = (path: string) => {
  const { VITE_API_URL } = import.meta.env
  const defaultHost = normalizeHost(VITE_API_URL)
  const proxyHost = matchProxyHost(path) || matchProxyHost(`${defaultHost}${path}`)
  return `${proxyHost || defaultHost}${path}`
}

export const rurl = (key: string, w?: number, h?: number) => {
  if (!key) {
    return ''
  }
  if (key.startsWith('http')) {
    return key
  }
  if (!w) {
    w = 100
  }
  if (!h) {
    h = 100
  }
  const suffix = `?width=${w}&height=${h}&mode=fill`
  return resolveResourceUrl(`/resource/redirect/${key}${suffix}`)
}

export const durl = (key: string, name?: string) => {
  let url = resolveResourceUrl(`/resource/api/file/download?key=${key}`)
  if (name) url += `&saveName=${name}`
  return url
}
