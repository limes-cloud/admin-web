import { AxiosError } from 'axios'
import { ApiStatus } from './status'

// 错误响应接口
export interface ErrorResponse {
  code: number
  message: string
  reason?: string
  data?: unknown
}

// 错误日志数据接口
export interface ErrorLogData {
  code: number
  reason?: string
  message: string
  data?: unknown
  timestamp: string
  url?: string
  method?: string
  stack?: string
}

// 自定义 HttpError 类
export class HttpError extends Error {
  public readonly code: number
  public readonly reason?: string
  public readonly data?: unknown
  public readonly timestamp: string
  public readonly url?: string
  public readonly method?: string

  constructor(
    message: string,
    code: number,
    options?: {
      data?: unknown
      reason?: string
      url?: string
      method?: string
    }
  ) {
    super(message)
    this.name = 'HttpError'
    this.code = code
    this.reason = options?.reason
    this.data = options?.data
    this.timestamp = new Date().toISOString()
    this.url = options?.url
    this.method = options?.method
  }

  public toLogData(): ErrorLogData {
    return {
      code: this.code,
      reason: this.reason,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp,
      url: this.url,
      method: this.method,
      stack: this.stack
    }
  }
}

/**
 * 获取错误消息
 * @param status 错误状态码
 * @returns 错误消息
 */
const getErrorMessage = (status: number): string => {
  // HTTP 状态码到用户可见提示文案的映射表，未命中的状态码统一按服务器内部错误提示
  const errorMap: Record<number, string> = {
    [ApiStatus.unauthorized]: '未授权访问，请重新登录',
    [ApiStatus.forbidden]: '禁止访问该资源',
    [ApiStatus.notFound]: '请求的资源不存在',
    [ApiStatus.methodNotAllowed]: '请求方法不允许',
    [ApiStatus.requestTimeout]: '请求超时，请稍后重试',
    [ApiStatus.internalServerError]: '服务器内部错误，请稍后重试',
    [ApiStatus.badGateway]: '网关错误，请稍后重试',
    [ApiStatus.serviceUnavailable]: '服务暂时不可用，请稍后重试',
    [ApiStatus.gatewayTimeout]: '网关超时，请稍后重试'
  }

  return errorMap[status] || '服务器内部错误，请稍后重试'
}

/**
 * 处理错误
 * @param error 错误对象
 * @returns 错误对象
 */
export function handleError(error: AxiosError<ErrorResponse>): never {
  // 处理取消的请求
  if (error.code === 'ERR_CANCELED') {
    console.warn('Request cancelled:', error.message)
    throw new HttpError('请求已取消', ApiStatus.error)
  }

  const statusCode = error.response?.status
  const errorMessage = error.response?.data?.message || error.message
  const requestConfig = error.config

  // 处理网络错误
  if (!error.response) {
    throw new HttpError('网络连接异常，请检查网络连接', ApiStatus.error, {
      url: requestConfig?.url,
      method: requestConfig?.method?.toUpperCase()
    })
  }

  // 处理 HTTP 状态码错误
  const message = statusCode && !error.response?.data ? getErrorMessage(statusCode) : errorMessage || '请求失败'

  throw new HttpError(message, statusCode || ApiStatus.error, {
    data: error.response.data,
    url: requestConfig?.url,
    method: requestConfig?.method?.toUpperCase()
  })
}

/**
 * 显示错误消息
 * @param error 错误对象
 * @param showMessage 是否显示错误消息
 */
const isShow = ref(false)
export function showError(error: HttpError, showMessage: boolean = true): void {
  if (showMessage && !isShow.value) {
    isShow.value = true
    ElMessage.error(error.message)
    setTimeout(() => {
      isShow.value = false
    }, 1000)
  }
  // 记录错误日志
  console.error('[HTTP Error]', error.toLogData())
}

/**
 * 显示成功消息
 * @param message 成功消息
 * @param showMessage 是否显示消息
 */
export function showSuccess(message: string, showMessage: boolean = true): void {
  if (showMessage) {
    ElMessage.success(message)
  }
}

/**
 * 判断是否为 HttpError 类型
 * @param error 错误对象
 * @returns 是否为 HttpError 类型
 */
export const isHttpError = (error: unknown): error is HttpError => {
  return error instanceof HttpError
}
