import { matchProxyHost } from '@/utils/proxyRules'

const normalizeHost = (host: string) => host.replace(/\/$/, '')

// resolveResourceUrl 拼接资源服务完整地址（含 API 域名/代理规则），供 fetch 等直接请求使用
export const resolveResourceUrl = (path: string) => {
  const { VITE_API_URL } = import.meta.env
  const defaultHost = normalizeHost(VITE_API_URL)
  const proxyHost = matchProxyHost(path) || matchProxyHost(`${defaultHost}${path}`)
  return `${proxyHost || defaultHost}${path}`
}

// rurl 生成图片展示地址：走 resource 的 302 快速展示接口（对象按 md5 内容寻址，只需 key）
// w/h 参数保留兼容旧调用方；后端不处理裁剪，展示尺寸由调用方 CSS 控制
export const rurl = (key: string, w?: number, h?: number) => {
  if (!key) {
    return ''
  }
  if (key.startsWith('http')) {
    return key
  }
  void w
  void h
  return resolveResourceUrl(`/resource/api/file/object-by-key?key=${key}`)
}

export const durl = (key: string, name?: string) => {
  let url = resolveResourceUrl(`/resource/api/file/download?key=${key}`)
  if (name) url += `&saveName=${name}`
  return url
}
