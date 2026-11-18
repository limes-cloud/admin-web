// 调度链页面通用格式化与工具函数

import type { Int64 } from '@/api/cron/chain/type'
import { parseTime } from '@/utils/time'

/** int64（protojson 字符串）转数字；空值返回 undefined */
export function toNum(v?: Int64 | null): number | undefined {
  if (v === undefined || v === null || v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

/** Unix 秒格式化为 yyyy-mm-dd hh:ii:ss */
export function formatTs(sec?: Int64 | null, format?: string): string {
  const n = toNum(sec)
  if (!n) return '-'
  return parseTime(n * 1000, format) || '-'
}

/** 秒数格式化为时长（天/小时/分钟/秒） */
export function formatDuration(sec?: number): string {
  if (sec === undefined || !Number.isFinite(sec)) return '-'
  let s = Math.max(0, Math.floor(sec))
  const d = Math.floor(s / 86400)
  s -= d * 86400
  const h = Math.floor(s / 3600)
  s -= h * 3600
  const m = Math.floor(s / 60)
  s -= m * 60
  const parts: string[] = []
  if (d) parts.push(`${d}天`)
  if (h) parts.push(`${h}小时`)
  if (m) parts.push(`${m}分`)
  if (!d && !h) parts.push(`${s}秒`)
  return parts.join('')
}

/** 毫秒耗时：<1s 显示 ms，<1min 显示秒（两位小数），更长按时长显示 */
export function formatCost(ms?: number): string {
  if (ms === undefined || !Number.isFinite(ms)) return '-'
  if (ms < 1000) return `${Math.round(ms)}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(2)}s`
  return formatDuration(ms / 1000)
}

/** 当前 Unix 秒 */
export function nowSec(): number {
  return Math.floor(Date.now() / 1000)
}

/** 随机 UUID（节点 id、trx） */
export function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  // 非安全上下文（http 访问）下 randomUUID 不可用，回退到 getRandomValues
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}

/** 是否为 UUID 形态（随机生成的节点 id） */
export function isUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}

/** JSON 美化；undefined 返回空串 */
export function pretty(v: unknown): string {
  if (v === undefined) return ''
  if (typeof v === 'string') {
    try {
      return JSON.stringify(JSON.parse(v), null, 2)
    } catch {
      return v
    }
  }
  return JSON.stringify(v, null, 2)
}

/** 解析 JSON 文本；空串返回 undefined，非法时抛出异常 */
export function parseJson(text: string): any {
  if (!text.trim()) return undefined
  return JSON.parse(text)
}

/** 深拷贝（规则对象均为 JSON 可序列化结构） */
export function clone<T>(v: T): T {
  return v === undefined ? v : JSON.parse(JSON.stringify(v))
}
