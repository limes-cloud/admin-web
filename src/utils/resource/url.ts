import { matchProxyHost } from '@/utils/proxyRules'
import { getAPIBaseURL } from '@/utils/runtime-config'

const normalizeHost = (host: string) => host.replace(/\/$/, '')

// isRemoteResourceURL 判断资源地址是否为可直接访问的远端 URL。
export const isRemoteResourceURL = (value: string) => /^https?:\/\//i.test(String(value).trim())

// resolveResourceUrl 拼接资源服务完整地址（含 API 域名/代理规则），供 fetch 等直接请求使用
export const resolveResourceUrl = (path: string) => {
  const defaultHost = normalizeHost(getAPIBaseURL())
  const proxyHost = matchProxyHost(path) || matchProxyHost(`${defaultHost}${path}`)
  return `${proxyHost || defaultHost}${path}`
}

// rurl 生成图片展示地址：远端 URL 原样返回，对象 key 走 resource 的 302 快速展示接口
// w/h 参数保留兼容旧调用方；后端不处理裁剪，展示尺寸由调用方 CSS 控制
export const rurl = (key: string, w?: number, h?: number) => {
  if (!key) {
    return ''
  }
  if (isRemoteResourceURL(key)) {
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
