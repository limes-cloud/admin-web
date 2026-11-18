import type { RetryPolicy } from '../types/dsl'

/** 规范化可输入的状态码：转数字、去重、过滤非法值 */
export function normalizeRetryStatuses(policy: RetryPolicy) {
  const statuses = (policy.statuses || [])
    .map((value) => Number(value))
    .filter(
      (value, index, list) => Number.isInteger(value) && value >= 100 && value <= 599 && list.indexOf(value) === index
    )
  policy.statuses = statuses.length ? statuses : undefined
}

/** 规范化响应包含文本：去空白、去重、过滤空值 */
export function normalizeRetryContains(policy: RetryPolicy) {
  const parts = (policy.contains || [])
    .map((value) => value.trim())
    .filter((value, index, list) => value !== '' && list.indexOf(value) === index)
  policy.contains = parts.length ? parts : undefined
}
