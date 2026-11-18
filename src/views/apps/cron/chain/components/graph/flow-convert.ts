// Rule ⇄ Vue Flow 节点/边（含 ui 坐标）；更换画布库时只改此文件与画布组件

import { MarkerType } from '@vue-flow/core'
import type { Edge as FlowEdge, Node as FlowNode } from '@vue-flow/core'
import type { Node, Rule, PluginSpec, UIViewport } from '../../types/dsl'
import { uuid } from '../../utils/format'
import { normalizeRetryContains, normalizeRetryStatuses } from '../../utils/retry'

/** 任务节点组件类型名 */
export const FLOW_NODE_TYPE = 'chain'

/** 开始 / 结束节点组件类型名 */
export const FLOW_TERMINAL_TYPE = 'terminal'

/** 分支器节点组件类型名 */
export const FLOW_SELECTOR_TYPE = 'selector'

/** 画布边组件类型名 */
export const FLOW_EDGE_TYPE = 'chain'

/** 连线与箭头颜色（箭头 marker 不支持 CSS 变量，用固定色） */
export const EDGE_COLOR = '#8f95a3'

/** 是否为开始 / 结束节点（每条链固定各一个，不能删除、复制） */
export function isTerminal(n?: Node): boolean {
  return n?.type === 'start' || n?.type === 'end'
}

/** 是否为控制节点（开始 / 结束 / 分支器） */
export function isControl(n?: Node): boolean {
  return isTerminal(n) || n?.type === 'selector'
}

/**
 * 补齐开始 / 结束节点（新链或缺失时），返回是否有修改：
 * 新建的开始节点连向全部入度为 0 的节点，全部出度为 0 的节点连向新建的结束节点
 */
export function ensureTerminals(rule: Rule): boolean {
  const hasStart = rule.nodes.some((n) => n.type === 'start')
  const hasEnd = rule.nodes.some((n) => n.type === 'end')
  if (hasStart && hasEnd) return false
  const hasIn = new Set(rule.edges.map((e) => e.target))
  const hasOut = new Set(rule.edges.map((e) => e.source))
  const others = rule.nodes.slice()
  if (!hasStart) {
    const id = uniqueId(rule, 'start')
    rule.nodes.unshift({ id, name: '开始', type: 'start' })
    others.filter((n) => !hasIn.has(n.id)).forEach((n) => rule.edges.push({ id: uuid(), source: id, target: n.id }))
  }
  if (!hasEnd) {
    const id = uniqueId(rule, 'end')
    rule.nodes.push({ id, name: '结束', type: 'end' })
    others.filter((n) => !hasOut.has(n.id)).forEach((n) => rule.edges.push({ id: uuid(), source: n.id, target: id }))
  }
  if (!others.length) {
    const start = rule.nodes.find((n) => n.type === 'start')!
    const end = rule.nodes.find((n) => n.type === 'end')!
    rule.edges.push({ id: uuid(), source: start.id, target: end.id })
  }
  return true
}

/** 规则内未被占用的节点 id */
function uniqueId(rule: Rule, base: string): string {
  const ids = new Set(rule.nodes.map((n) => n.id))
  let id = base
  let i = 2
  while (ids.has(id)) id = `${base}_${i++}`
  return id
}

/** false 即默认值、导出时省略的节点开关字段 */
const FALSE_DEFAULT_FLAGS = ['ignoreError', 'nowResponse'] as const

/** 解析规则 JSON；空串返回空规则 */
export function parseRule(raw?: string): Rule {
  if (!raw || !raw.trim()) return { nodes: [], edges: [] }
  const r = JSON.parse(raw) as Rule
  r.nodes = Array.isArray(r.nodes) ? r.nodes : []
  r.edges = Array.isArray(r.edges) ? r.edges : []
  return r
}

/** 是否为空值：undefined / null / '' / 空数组 / 空对象 */
function isEmpty(v: unknown): boolean {
  if (v === undefined || v === null || v === '') return true
  if (Array.isArray(v)) return v.length === 0
  if (typeof v === 'object') return Object.keys(v as object).length === 0
  return false
}

/** 递归去掉对象中的空值字段（模板值内部原样保留，只清理 DSL 结构层） */
function prune<T extends Record<string, any>>(obj: T, keepKeys: string[] = []): T {
  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (keepKeys.includes(k)) {
      out[k] = v
      continue
    }
    if (isEmpty(v)) continue
    out[k] = v
  }
  return out as T
}

/** 导出规则：清理空字段、写入视口，得到提交给后端的 JSON 字符串 */
export function stringifyRule(rule: Rule, viewport?: UIViewport): string {
  const nodes = rule.nodes.map((n) => {
    // fallbackOutput 的 [] / {} / null 都是显式配置，不能被当成空值裁掉
    const node = prune({ ...n }, ['id', 'name', 'type', 'fallbackOutput'])
    if (node.request) {
      const req = prune({ ...node.request })
      if (isEmpty(req)) delete node.request
      else node.request = req
    }
    if (node.response) {
      const resp = prune({ ...node.response })
      if (isEmpty(resp)) delete node.response
      else node.response = resp
    }
    // 开关类字段 false 即默认值，不写入
    FALSE_DEFAULT_FLAGS.forEach((k) => {
      if (node[k] === false) delete node[k]
    })
    if (node.retry) {
      node.retry = node.retry.map((p) => {
        normalizeRetryStatuses(p)
        normalizeRetryContains(p)
        return prune({ ...p }, ['errors'])
      })
    }
    if (node.suspend) {
      node.suspend = prune({ ...node.suspend }, ['errors'])
    }
    if (n.plugin) {
      // 插件节点：不写 type，由插件提供
      delete node.type
    }
    return node
  })
  const edges = rule.edges.map((e) => prune({ ...e }, ['id', 'source', 'target']))
  const out: Rule = { nodes, edges }
  // 只保留现存节点的坐标
  const pos: Record<string, { x: number; y: number }> = {}
  for (const n of rule.nodes) {
    const p = rule.ui?.nodes?.[n.id]
    if (p) pos[n.id] = { x: Math.round(p.x), y: Math.round(p.y) }
  }
  out.ui = { nodes: pos }
  const vp = viewport || rule.ui?.viewport
  if (vp) out.ui.viewport = { x: Math.round(vp.x), y: Math.round(vp.y), zoom: Number(vp.zoom.toFixed(3)) }
  return JSON.stringify(out)
}

/** 解析模板 spec JSON；非法时返回 undefined */
export function parseSpec(raw?: string): PluginSpec | undefined {
  if (!raw) return undefined
  try {
    const s = JSON.parse(raw) as PluginSpec
    return s && typeof s === 'object' ? s : undefined
  } catch {
    return undefined
  }
}

/** 节点对应的画布组件类型 */
function flowType(n: Node): string {
  if (isTerminal(n)) return FLOW_TERMINAL_TYPE
  if (n.type === 'selector') return FLOW_SELECTOR_TYPE
  return FLOW_NODE_TYPE
}

/** 规则节点 → Vue Flow 节点（只带 id 与坐标，属性由节点组件从规则读取） */
export function toFlowNodes(rule: Rule): FlowNode[] {
  return rule.nodes.map((n) => {
    const p = rule.ui?.nodes?.[n.id]
    return {
      id: n.id,
      type: flowType(n),
      position: { x: p?.x ?? 0, y: p?.y ?? 0 },
      data: {},
      deletable: !isTerminal(n)
    }
  })
}

/** 规则边 → Vue Flow 边（分支器出边挂在对应分支的端口上） */
export function toFlowEdges(rule: Rule): FlowEdge[] {
  return rule.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourcePort || undefined,
    type: FLOW_EDGE_TYPE,
    markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLOR, width: 18, height: 18 }
  }))
}
