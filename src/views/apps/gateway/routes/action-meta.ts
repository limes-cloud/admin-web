import type { GatewayActionType } from '@/api/gateway/route/type'

type FieldKind = 'text' | 'textarea' | 'number' | 'select' | 'switch' | 'tags'

interface ActionField {
  key: string
  label: string
  kind: FieldKind
  placeholder?: string
  required?: boolean
  span?: number
  min?: number
  max?: number
  options?: { label: string; value: any }[]
  defaultValue?: any
}

interface ActionMeta {
  type: GatewayActionType
  label: string
  tip?: string
  fields: ActionField[]
}

export const ACTION_META: ActionMeta[] = [
  {
    type: 'HOST_SET',
    label: 'Host · 设置',
    fields: [
      { key: 'value', label: 'Host', kind: 'text', placeholder: 'upstream.example.com', required: true, span: 24 }
    ]
  },
  {
    type: 'PATH_SET',
    label: 'Path · 设置',
    fields: [
      {
        key: 'value',
        label: 'Path',
        kind: 'text',
        placeholder: '/manager/seo',
        required: true,
        span: 24,
        defaultValue: '/'
      }
    ]
  },
  {
    type: 'PATH_PREFIX_ADD',
    label: 'Path · 添加前缀',
    fields: [{ key: 'prefix', label: '前缀', kind: 'text', placeholder: '/sale', required: true, span: 24 }]
  },
  {
    type: 'PATH_PREFIX_TRIM',
    label: 'Path · 移除前缀',
    fields: [{ key: 'prefix', label: '前缀', kind: 'text', placeholder: '/api', required: true, span: 24 }]
  },
  {
    type: 'PATH_REGEX_REPLACE',
    label: 'Path · 正则替换',
    fields: [
      { key: 'pattern', label: 'Pattern', kind: 'text', placeholder: '^/v1/(.*)$', required: true, span: 12 },
      { key: 'replacement', label: 'Replacement', kind: 'text', placeholder: '/v2/$1', required: true, span: 12 }
    ]
  },
  {
    type: 'RAW_QUERY_ADD',
    label: 'Query · 添加参数',
    fields: [
      { key: 'key', label: '参数名', kind: 'text', placeholder: 'from', required: true, span: 12 },
      { key: 'value', label: '参数值', kind: 'text', placeholder: 'gateway', span: 12 }
    ]
  },
  {
    type: 'RAW_QUERY_RENAME',
    label: 'Query · 重命名参数',
    fields: [
      { key: 'key', label: '原参数名', kind: 'text', required: true, span: 12 },
      { key: 'newKey', label: '新参数名', kind: 'text', required: true, span: 12 }
    ]
  },
  {
    type: 'RAW_QUERY_DEL',
    label: 'Query · 删除参数',
    fields: [{ key: 'key', label: '参数名', kind: 'text', required: true, span: 24 }]
  },
  {
    type: 'RAW_QUERY_DEL_ALL_EXCEPT',
    label: 'Query · 仅保留参数',
    fields: [
      {
        key: 'keys',
        label: '保留参数名',
        kind: 'tags',
        placeholder: '输入参数名后回车',
        required: true,
        span: 24,
        defaultValue: []
      }
    ]
  },
  {
    type: 'RAW_QUERY_CLEAR',
    label: 'Query · 清空',
    tip: '移除请求中的全部 Query 参数。',
    fields: []
  },
  {
    type: 'REQUEST_HEADER_SET',
    label: '请求头 · 设置',
    fields: [
      { key: 'key', label: 'Header', kind: 'text', placeholder: 'X-Env', required: true, span: 12 },
      { key: 'value', label: '值', kind: 'text', placeholder: 'prod', span: 12 }
    ]
  },
  {
    type: 'REQUEST_HEADER_ADD',
    label: '请求头 · 追加',
    fields: [
      { key: 'key', label: 'Header', kind: 'text', required: true, span: 12 },
      { key: 'value', label: '值', kind: 'text', span: 12 }
    ]
  },
  {
    type: 'REQUEST_HEADER_DEL',
    label: '请求头 · 删除',
    fields: [{ key: 'key', label: 'Header', kind: 'text', required: true, span: 24 }]
  },
  {
    type: 'RESPONSE_HEADER_SET',
    label: '响应头 · 设置',
    fields: [
      { key: 'key', label: 'Header', kind: 'text', placeholder: 'Cache-Control', required: true, span: 12 },
      { key: 'value', label: '值', kind: 'text', placeholder: 'no-store', span: 12 }
    ]
  },
  {
    type: 'RESPONSE_HEADER_ADD',
    label: '响应头 · 追加',
    fields: [
      { key: 'key', label: 'Header', kind: 'text', required: true, span: 12 },
      { key: 'value', label: '值', kind: 'text', span: 12 }
    ]
  },
  {
    type: 'RESPONSE_HEADER_DEL',
    label: '响应头 · 删除',
    fields: [{ key: 'key', label: 'Header', kind: 'text', required: true, span: 24 }]
  },
  {
    type: 'REDIRECT',
    label: '重定向',
    tip: 'REDIRECT 必须是当前规则最后一个动作；支持 ${request.scheme}、${request.host}、${request.path}、${request.query}。',
    fields: [
      {
        key: 'statusCode',
        label: '状态码',
        kind: 'select',
        required: true,
        span: 8,
        defaultValue: 302,
        options: [301, 302, 303, 307, 308].map((code) => ({ label: String(code), value: code }))
      },
      { key: 'preserveQuery', label: '保留 Query', kind: 'switch', span: 16, defaultValue: true },
      {
        key: 'location',
        label: 'Location',
        kind: 'textarea',
        required: true,
        span: 24,
        placeholder: 'https://${request.host}${request.path}'
      }
    ]
  }
]

const ACTION_META_MAP = new Map(ACTION_META.map((item) => [item.type, item]))

export const ACTION_OPTIONS = ACTION_META.map((item) => ({ label: item.label, value: item.type }))

export function actionMeta(type: GatewayActionType): ActionMeta {
  return ACTION_META_MAP.get(type) ?? ACTION_META[0]
}

export function defaultActionParams(type: GatewayActionType): Record<string, any> {
  const params: Record<string, any> = {}
  for (const field of actionMeta(type).fields) {
    if (field.defaultValue !== undefined) {
      params[field.key] = Array.isArray(field.defaultValue) ? [...field.defaultValue] : field.defaultValue
    }
  }
  return params
}

export function actionFieldValue(params: Record<string, any> | null | undefined, field: ActionField): any {
  const value = params?.[field.key]
  if (value === undefined && field.defaultValue !== undefined) {
    return Array.isArray(field.defaultValue) ? [...field.defaultValue] : field.defaultValue
  }
  if (field.kind === 'tags') return Array.isArray(value) ? value : []
  if (field.kind === 'switch') return value === true
  return value
}

export function validateActionParams(
  type: GatewayActionType,
  params: Record<string, any> | null | undefined
): string | undefined {
  for (const field of actionMeta(type).fields) {
    if (!field.required) continue
    const value = params?.[field.key]
    if (field.kind === 'tags') {
      if (!Array.isArray(value) || value.length === 0) return `请填写${field.label}`
      continue
    }
    if (value === undefined || value === null || String(value).trim() === '') {
      return `请填写${field.label}`
    }
  }
  return undefined
}
