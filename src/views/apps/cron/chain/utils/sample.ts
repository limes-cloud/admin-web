// 按 FieldRule 树生成示例数据（试运行入参模板、手动触发 body 模板）

import type { FieldRule } from '../types/dsl'

/** 单个字段的示例值 */
function sampleValue(r?: FieldRule): any {
  if (!r) return null
  if (r.enum?.length) return r.enum[0]
  switch (r.type) {
    case 'string':
      return ''
    case 'number':
    case 'integer':
      return r.min ?? 0
    case 'boolean':
      return false
    case 'object':
      return sampleObject(r.fields)
    case 'array':
      return []
    default:
      return null
  }
}

/** 字段规则对象 → 示例对象 */
export function sampleObject(rules?: Record<string, FieldRule>): Record<string, any> {
  const out: Record<string, any> = {}
  for (const [k, r] of Object.entries(rules || {})) out[k] = sampleValue(r)
  return out
}

/** 表单原始输入是否为空（未填 = 不传） */
function isBlank(v: any): boolean {
  return v === undefined || v === null || (typeof v === 'string' && v.trim() === '')
}

/** 单个字段：原始输入 → 入参值；不合法时写 errors[path] */
function buildValue(r: FieldRule, raw: any, path: string, errors: Record<string, string>): any {
  if (r.type === 'object' && r.fields) {
    // 可选对象整体未填时不检查下级必填；填了任一字段或对象本身必填时才检查
    const sub: Record<string, string> = {}
    const v = buildFieldValues(r.fields, raw && typeof raw === 'object' ? raw : {}, sub, path)
    const filled = Object.keys(v).length > 0
    if (filled || r.required) Object.assign(errors, sub)
    return filled ? v : undefined
  }
  if (isBlank(raw)) return undefined
  if (r.type === 'number' || r.type === 'integer') {
    const value = typeof raw === 'number' ? raw : Number(String(raw).trim())
    if (!Number.isFinite(value)) {
      errors[path] = '必须是数字'
      return undefined
    }
    if (r.type === 'integer' && !Number.isInteger(value)) {
      errors[path] = '必须是整数'
      return undefined
    }
    return value
  }
  if (r.type === 'boolean') {
    if (typeof raw === 'boolean') return raw
    if (raw === 'true') return true
    if (raw === 'false') return false
    errors[path] = '必须是布尔值'
    return undefined
  }
  if (r.enum?.length) return raw
  if (r.type === 'array' || r.type === 'object' || r.type === 'any') {
    let v: any
    try {
      v = JSON.parse(raw)
    } catch {
      // any 类型允许直接填字符串
      if (r.type === 'any') return raw
      errors[path] = '不是合法的 JSON'
      return undefined
    }
    if (r.type === 'array' && !Array.isArray(v)) errors[path] = '必须是 JSON 数组'
    if (r.type === 'object' && (typeof v !== 'object' || v === null || Array.isArray(v)))
      errors[path] = '必须是 JSON 对象'
    return v
  }
  return raw
}

/**
 * 试运行表单 → 入参对象：未填的字段不传；必填字段未填时记错误。
 * 只做必填与格式检查，长度、范围、正则等规则以后端校验为准
 */
export function buildFieldValues(
  rules: Record<string, FieldRule>,
  values: Record<string, any>,
  errors: Record<string, string>,
  prefix = ''
): Record<string, any> {
  const out: Record<string, any> = {}
  for (const [k, r] of Object.entries(rules)) {
    const path = prefix ? `${prefix}.${k}` : k
    const v = buildValue(r, values[k], path, errors)
    if (v === undefined) {
      if (r.required && !errors[path]) errors[path] = '必填'
      continue
    }
    out[k] = v
  }
  return out
}
