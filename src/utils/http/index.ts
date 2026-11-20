import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useUserStore } from '@/store/modules/user'
import { matchProxyHost } from '@/utils/proxyRules'
import { ApiStatus } from './status'
import { HttpError, handleError, showError, showSuccess } from './error'
import { RefreshToken } from '@/api/manager/authorize/api'
import { getAppKeyword } from '@/utils/app-context'
import { getAPIBaseURL } from '@/utils/runtime-config'

/** 请求配置常量 */
const REQUEST_TIMEOUT = 15000
const LOGOUT_DELAY = 500
const MAX_RETRIES = 0
const RETRY_DELAY = 1000
const UNAUTHORIZED_DEBOUNCE_TIME = 3000

/** 401防抖状态 */
let isUnauthorizedErrorShown = false
let unauthorizedTimer: NodeJS.Timeout | null = null

/** 扩展 AxiosRequestConfig */
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  showErrorMessage?: boolean
  showSuccessMessage?: boolean
}

const { VITE_WITH_CREDENTIALS } = import.meta.env
export const APP_KEY = getAppKeyword()

/** Axios实例 */
const axiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: getAPIBaseURL(),
  withCredentials: VITE_WITH_CREDENTIALS === 'true',
  validateStatus: (status) => status >= 200 && status <= 403,
  transformResponse: [
    (data, headers) => {
      const contentType = headers?.['content-type']
      const text = typeof data === 'string' ? data.trim() : data
      // 网关等中间层转发非 200 响应时可能丢失/改写 content-type，
      // 因此 body 以 JSON 起始字符开头时也按 JSON 解析，避免拿不到 code/reason。
      const looksLikeJSON = typeof text === 'string' && (text.startsWith('{') || text.startsWith('['))
      if (contentType?.includes('application/json') || looksLikeJSON) {
        try {
          return JSON.parse(data)
        } catch {
          return data
        }
      }
      return data
    }
  ]
})

/** 请求拦截器 */
axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const { accessToken } = useUserStore()
    if (accessToken) request.headers.set('Authorization', accessToken)
    // 允许单次请求显式指定应用（如跨应用的固定提示词），未指定时沿用当前登录应用
    if (!request.headers.get('X-App-Key')) request.headers.set('X-App-Key', getAppKeyword())

    // 代理规则劫持：匹配则替换 baseURL
    if (request.url) {
      const proxyHost = matchProxyHost(request.url)
      if (proxyHost) request.baseURL = proxyHost
    }

    if (!request.data) {
      request.data = {}
    }

    if (request.data && !(request.data instanceof FormData) && !request.headers['Content-Type']) {
      request.headers.set('Content-Type', 'application/json')
      request.data = JSON.stringify(request.data)
    }

    return request
  },
  (error) => {
    showError(createHttpError('请求配置错误', ApiStatus.error))
    return Promise.reject(error)
  }
)

// 是否正在刷新的标记
let isRefresh = false
// 重试队列，每一项将是一个待执行的函数形式
let requests: Array<(token: string) => void> = []

/** 响应拦截器 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<Http.BaseResponse>) => {
    // 响应体可能未被解析成对象（例如网关丢失 content-type），此时回退用 HTTP 状态码判断
    const payload = response.data && typeof response.data === 'object' ? response.data : ({} as Http.BaseResponse)
    const code = payload.code ?? response.status
    const { message, reason } = payload
    if (code === ApiStatus.success) return response
    if (code === ApiStatus.unauthorized) {
      // 401未授权，存在登录过期情况
      const { accessToken } = useUserStore()
      const isRefreshRequest = response.config?.url?.includes('/manager/api/authorize/token/refresh')
      // reason 缺失说明响应体未被正确解析，此时 401 + 已登录同样应当尝试续期
      const shouldRefresh = response.status === 401 && accessToken && !isRefreshRequest
      if (shouldRefresh && (reason === 'UNAUTHORIZED' || !reason)) {
        if (!isRefresh) {
          isRefresh = true

          return RefreshToken()
            .then(async (res) => {
              isRefresh = false
              // 处理刷新成功
              const userStore = useUserStore()
              userStore.setToken(res.token)
              // 执行队列中的请求
              requests.forEach((cb) => cb(res.token))
              requests = []
              // 重新执行当前请求
              return axiosInstance(response.config) as any
            })
            .catch(() => {
              // 刷新失败，弹窗处理
              ElMessageBox.confirm('登录状态已失效，请重新登录', '温馨提示', {
                confirmButtonText: '确认',
                type: 'warning',
                showCancelButton: false
              }).then(async () => {
                isRefresh = false
                // 清空数据
                await useUserStore().logout()
                window.location.reload()
                return Promise.reject(message)
              })
            })
        }
        return new Promise((resolve) => {
          requests.push(() => {
            resolve(axiosInstance(response.config))
          })
        })
      }

      handleUnauthorizedError(message)
    }
    throw createHttpError(message || '请求失败', code, reason)
  },
  (error) => {
    console.log(error)
    if (error.response?.status === ApiStatus.unauthorized) handleUnauthorizedError()
    return Promise.reject(handleError(error))
  }
)

/** 统一创建HttpError */
function createHttpError(message: string, code: number, reason?: string) {
  return new HttpError(message, code, { reason })
}

/** 处理401错误（带防抖） */
function handleUnauthorizedError(message?: string): never {
  const error = createHttpError(message || '未授权访问，请重新登录', ApiStatus.unauthorized)

  if (!isUnauthorizedErrorShown) {
    isUnauthorizedErrorShown = true
    logOut()

    unauthorizedTimer = setTimeout(resetUnauthorizedError, UNAUTHORIZED_DEBOUNCE_TIME)

    showError(error, true)
    throw error
  }

  throw error
}

/** 重置401防抖状态 */
function resetUnauthorizedError() {
  isUnauthorizedErrorShown = false
  if (unauthorizedTimer) clearTimeout(unauthorizedTimer)
  unauthorizedTimer = null
}

/** 退出登录函数 */
function logOut() {
  setTimeout(() => {
    useUserStore().logout()
  }, LOGOUT_DELAY)
}

/** 是否需要重试 */
function shouldRetry(statusCode: number) {
  return [
    ApiStatus.requestTimeout,
    ApiStatus.internalServerError,
    ApiStatus.badGateway,
    ApiStatus.serviceUnavailable,
    ApiStatus.gatewayTimeout
  ].includes(statusCode)
}

/** 请求重试逻辑 */
async function retryRequest<T>(config: ExtendedAxiosRequestConfig, retries: number = MAX_RETRIES): Promise<T> {
  try {
    return await request<T>(config)
  } catch (error) {
    if (retries > 0 && error instanceof HttpError && shouldRetry(error.code)) {
      await delay(RETRY_DELAY)
      return retryRequest<T>(config, retries - 1)
    }
    throw error
  }
}

/** 延迟函数 */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 请求函数 */
async function request<T = any>(config: ExtendedAxiosRequestConfig): Promise<T> {
  // POST | PUT 参数自动填充
  if (['POST', 'PUT'].includes(config.method?.toUpperCase() || '') && config.params && !config.data) {
    config.data = config.params
    config.params = undefined
  }

  try {
    const res = await axiosInstance.request<Http.BaseResponse<T>>(config)

    // 显示成功消息
    if (config.showSuccessMessage && res.data.message) {
      showSuccess(res.data.message)
    }

    return res.data.data as T
  } catch (error) {
    if (error instanceof HttpError && error.code !== ApiStatus.unauthorized) {
      const showMsg = config.showErrorMessage !== false
      showError(error, showMsg)
    }
    return Promise.reject(error)
  }
}

/** API方法集合 */
const api = {
  get<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'GET' })
  },
  post<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'POST' })
  },
  put<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'PUT' })
  },
  del<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'DELETE' })
  },
  request<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>(config)
  }
}

export default api
