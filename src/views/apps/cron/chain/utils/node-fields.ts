// 节点卡片的字段摘要：画布卡片展示与自动布局估高共用

import type { FieldRule, Node, TaskType } from '../types/dsl'
import { TYPE_LABEL } from './constants'

/** 字段中的一个标签：text 为主文本，sub 为灰色补充（如类型） */
export interface NodeTag {
  text: string
  sub?: string
  /** sub 显示在 text 之前（如请求方法） */
  subFirst?: boolean
}

/** 卡片中的一行字段：左侧标签，右侧标签列表；tags 为空时显示 empty */
export interface NodeField {
  label: string
  tags: NodeTag[]
  empty?: string
}

/** 任务节点字段：模板 / 请求 / 脚本、触发方式、输出名 */
export function taskFields(n: Node, pluginName?: string): NodeField[] {
  const out: NodeField[] = []
  if (n.plugin) {
    out.push({ label: '插件', tags: [{ text: pluginName || n.plugin, sub: `v${n.pluginVersion || '?'}` }] })
  } else if (n.type === 'api') {
    out.push({
      label: '请求',
      tags: n.url ? [{ text: n.url, sub: (n.method || 'POST').toUpperCase(), subFirst: true }] : [],
      empty: '未配置地址'
    })
  } else if (n.type === 'script') {
    const lines = n.code ? n.code.split('\n').filter((l) => l.trim()).length : 0
    const tags = n.code ? [{ text: 'JavaScript', sub: `${lines} 行` }] : []
    out.push({ label: '脚本', tags, empty: '未编写' })
  } else if (n.type === 'chain') {
    out.push({ label: '流程', tags: n.chain ? [{ text: n.chain }] : [], empty: '未选择目标流程' })
    out.push({ label: '模式', tags: [{ text: '同步调用' }] })
  } else if (n.type === 'loop') {
    const lc = n.loop
    const mode = lc?.mode === 'each' ? `遍历 ${lc?.items || '...'}` : `循环 ${lc?.times ?? 1} 次`
    const bodyCount = lc?.body?.nodes?.length || 0
    out.push({ label: '循环', tags: [{ text: mode }], empty: '未配置' })
    out.push({ label: '节点', tags: [{ text: `${bodyCount} 个` }], empty: '未配置' })
  } else {
    out.push({
      label: '类型',
      tags: n.type ? [{ text: TYPE_LABEL[n.type as TaskType] || n.type }] : [],
      empty: '未选择'
    })
  }
  if (n.mode === 'trigger') out.push({ label: '触发', tags: [{ text: '等待外部触发', sub: n.id }] })
  out.push({ label: '输出', tags: n.outputName ? [{ text: n.outputName }] : [], empty: '不挂载' })
  return out
}

/** 字段类型简写（与 Coze 的 str. / num. 前缀一致） */
const TYPE_ABBR: Record<string, string> = {
  string: 'str.',
  number: 'num.',
  integer: 'int.',
  boolean: 'bool.',
  object: 'obj.',
  array: 'arr.',
  any: 'any.'
}

/** 开始节点：入参字段及类型；结束节点：返回体的顶层字段 */
export function terminalFields(n: Node): NodeField[] {
  if (n.type === 'start') {
    const out: NodeField[] = [{ label: '输入', tags: flattenFieldTags(n.request?.body), empty: '无入参校验' }]
    const header = fieldTags(n.request?.header)
    if (header.length) out.push({ label: 'Header', tags: header })
    return out
  }
  const body = n.response?.body
  let tags: NodeTag[] = []
  if (body && typeof body === 'object' && !Array.isArray(body)) tags = Object.keys(body).map((k) => ({ text: k }))
  else if (body !== undefined && body !== null)
    tags = [{ text: String(typeof body === 'string' ? body : JSON.stringify(body)) }]
  return [{ label: '输出', tags, empty: '返回 null' }]
}

/** 开始节点入参：对象字段展开为点路径，数组对象展开为 path[]，保证卡片能看到全部字段 */
function flattenFieldTags(rules: Record<string, FieldRule> | undefined, prefix = ''): NodeTag[] {
  const out: NodeTag[] = []
  for (const [key, rule] of Object.entries(rules || {})) {
    const path = prefix ? `${prefix}.${key}` : key
    const type = rule?.type || 'any'
    if (type === 'object' && rule?.fields && Object.keys(rule.fields).length) {
      out.push(...flattenFieldTags(rule.fields, path))
      continue
    }
    if (type === 'array' && rule?.items?.type === 'object' && rule.items.fields) {
      out.push(...flattenFieldTags(rule.items.fields, `${path}[]`))
      continue
    }
    out.push({ text: path, sub: TYPE_ABBR[type], subFirst: true })
  }
  return out
}

function fieldTags(rules: Record<string, FieldRule> | undefined): NodeTag[] {
  return Object.entries(rules || {}).map(([key, rule]) => ({
    text: key,
    sub: TYPE_ABBR[rule?.type || 'any'],
    subFirst: true
  }))
}
