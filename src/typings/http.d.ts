declare namespace Http {
  /** 基础响应 */
  interface BaseResponse<T = unknown> {
    // 状态码
    code: number
    // 消息
    message: string
    // 数据
    data: T
    // 错误原因
    reason: string
    // 链路ID
    traceId?: string
  }
}
