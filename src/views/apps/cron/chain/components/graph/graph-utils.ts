// 图算法：前驱/后继/拓扑排序/环检测，供连线预检、本地校验与变量补全
// 纯函数，不依赖画布库

import type { Edge, FieldRule, Node, Rule } from '../../types/dsl'
import type { GraphEdgeLike, SpecResolver, VariableCandidate, VariableScope } from '../../types/graph'
import type { ConnectCheck, Issue } from '../../types/issue'
import { branchLabel, portLabel } from '../../utils/branch'
import {
  MAX_BRANCHES,
  MAX_CONDITIONS,
  MAX_EDGES,
  MAX_NODES,
  NODE_ID_PATTERN,
  OPERATORS,
  PORT_DEFAULT,
  RESERVED_OUTPUT_NAMES,
  TEMPLATE_FORBIDDEN_FIELDS
} from '../../utils/constants'

/** 邻接表 */
function adjacency(edges: GraphEdgeLike[], reverse = false): Map<string, string[]> {
  const adj = new Map<string, string[]>()
  for (const e of edges) {
    const from = reverse ? e.target : e.source
    const to = reverse ? e.source : e.target
    const list = adj.get(from)
    if (list) list.push(to)
    else adj.set(from, [to])
  }
  return adj
}

/** 从 start 出发可达的节点（不含 start） */
function reachable(start: string, adj: Map<string, string[]>): Set<string> {
  const seen = new Set<string>()
  const stack = [...(adj.get(start) || [])]
  while (stack.length) {
    const cur = stack.pop() as string
    if (seen.has(cur)) continue
    seen.add(cur)
    for (const next of adj.get(cur) || []) if (!seen.has(next)) stack.push(next)
  }
  return seen
}

/** 传递前驱 */
export function ancestors(nodeId: string, edges: GraphEdgeLike[]): Set<string> {
  return reachable(nodeId, adjacency(edges, true))
}

/** 传递后继 */
export function descendants(nodeId: string, edges: GraphEdgeLike[]): Set<string> {
  return reachable(nodeId, adjacency(edges))
}

/** 直接前驱 */
export function predecessors(nodeId: string, edges: GraphEdgeLike[]): string[] {
  return edges.filter((e) => e.target === nodeId).map((e) => e.source)
}

/** 直接后继 */
export function successors(nodeId: string, edges: GraphEdgeLike[]): string[] {
  return edges.filter((e) => e.source === nodeId).map((e) => e.target)
}

/** 拓扑排序；有环时返回 null */
export function topoSort(nodeIds: string[], edges: GraphEdgeLike[]): string[] | null {
  const { order, rest } = kahn(nodeIds, edges)
  return rest.length ? null : order
}

/** Kahn 算法：order 为可排序部分，rest 为环上或环下游的节点 */
function kahn(nodeIds: string[], edges: GraphEdgeLike[]): { order: string[]; rest: string[] } {
  const indeg = new Map<string, number>()
  nodeIds.forEach((id) => indeg.set(id, 0))
  const valid = edges.filter((e) => indeg.has(e.source) && indeg.has(e.target))
  valid.forEach((e) => indeg.set(e.target, (indeg.get(e.target) || 0) + 1))
  const adj = adjacency(valid)
  const queue = nodeIds.filter((id) => indeg.get(id) === 0)
  const order: string[] = []
  while (queue.length) {
    const cur = queue.shift() as string
    order.push(cur)
    for (const next of adj.get(cur) || []) {
      const d = (indeg.get(next) || 0) - 1
      indeg.set(next, d)
      if (d === 0) queue.push(next)
    }
  }
  const done = new Set(order)
  return { order, rest: nodeIds.filter((id) => !done.has(id)) }
}

/** 连线预检：自环、重复边（分支器按端口区分）、成环 */
export function checkConnect(source: string, target: string, edges: Edge[], port?: string): ConnectCheck {
  if (source === target) return { ok: false, reason: '不能连接到自身' }
  if (edges.some((e) => e.source === source && e.target === target && (e.sourcePort || '') === (port || '')))
    return { ok: false, reason: '两个节点之间已存在连线' }
  // target 能到达 source 时，新增 source→target 会成环
  if (descendants(target, edges).has(source)) return { ok: false, reason: '连线会形成环' }
  return { ok: true }
}

/** 字段是否未配置：undefined / null / '' / 空数组 / 空对象 */
function isBlank(v: unknown): boolean {
  if (v === undefined || v === null || v === '') return true
  if (Array.isArray(v)) return v.length === 0
  if (typeof v === 'object') return Object.keys(v as object).length === 0
  return false
}

/** 本地预检（同步）：节点 ID、唯一性、自环/重复边/环、必填项、规模上限 */
export function localCheck(rule: Rule): Issue[] {
  const issues: Issue[] = []
  const push = (target: Issue['target'], id: string, field: string, code: string, message: string) =>
    issues.push({ level: 'error', target, id, field, code, message })

  const starts = rule.nodes.filter((n) => n.type === 'start').length
  const ends = rule.nodes.filter((n) => n.type === 'end').length
  if (starts !== 1) push('rule', '', 'nodes', 'start_count', '必须有且只有一个开始节点')
  if (ends !== 1) push('rule', '', 'nodes', 'end_count', '必须有且只有一个结束节点')
  if (rule.nodes.length > MAX_NODES) push('rule', '', 'nodes', 'nodes_limit', `节点数不能超过 ${MAX_NODES}`)
  if (rule.edges.length > MAX_EDGES) push('rule', '', 'edges', 'edges_limit', `边数不能超过 ${MAX_EDGES}`)

  const ids = new Set<string>()
  const names = new Set<string>()
  const outputs = new Set<string>()
  for (const n of rule.nodes) {
    if (!NODE_ID_PATTERN.test(n.id))
      push('node', n.id, 'id', 'id_invalid', '节点 ID 只能包含字母、数字、_、-，长度 1～64')
    if (ids.has(n.id)) push('node', n.id, 'id', 'id_duplicate', `节点 ID ${n.id} 重复`)
    ids.add(n.id)
    if (!n.name) push('node', n.id, 'name', 'name_required', '节点名称必填')
    else if (names.has(n.name)) push('node', n.id, 'name', 'name_duplicate', `节点名称 ${n.name} 重复`)
    names.add(n.name)
    if (n.outputName) {
      if (RESERVED_OUTPUT_NAMES.includes(n.outputName))
        push('node', n.id, 'outputName', 'output_reserved', `输出名不能是 ${n.outputName}`)
      else if (outputs.has(n.outputName))
        push('node', n.id, 'outputName', 'output_duplicate', `输出名 ${n.outputName} 重复`)
      outputs.add(n.outputName)
    }
    if (n.plugin) {
      // 模板节点：任务字段由模板提供，节点上不能直接配置
      TEMPLATE_FORBIDDEN_FIELDS.filter((k) => !isBlank(n[k])).forEach((k) =>
        push('node', n.id, k, 'plugin_field_not_allowed', `插件节点不能配置 ${k}，由插件提供`)
      )
      if (!n.pluginVersion)
        push('node', n.id, 'pluginVersion', 'plugin_version_required', '插件节点必须指定 pluginVersion')
    } else if (n.type === 'selector') {
      checkBranches(n, push)
    } else if (n.type === 'loop') {
      if (!n.loop?.body?.nodes?.length) push('node', n.id, 'loop', 'loop_required', '循环节点必须配置循环体')
    } else if (
      n.type !== 'api' &&
      n.type !== 'script' &&
      n.type !== 'chain' &&
      n.type !== 'start' &&
      n.type !== 'end'
    ) {
      push('node', n.id, 'type', 'type_required', '请选择任务类型')
    }
    if (!n.plugin && n.files?.length) {
      if (n.requestType !== 'multipart') push('node', n.id, 'files', 'files_not_multipart', 'files 只能用于 multipart')
      const keys = n.input && typeof n.input === 'object' && !Array.isArray(n.input) ? Object.keys(n.input) : []
      n.files
        .filter((f) => !keys.includes(f))
        .forEach((f) => push('node', n.id, 'files', 'file_not_in_input', `文件字段 ${f} 不在 input 中`))
    }
    if (!n.plugin && n.type === 'chain' && !n.chain?.trim()) {
      push('node', n.id, 'chain', 'chain_required', '运行指定流程必须选择目标流程')
    }
    if (!n.plugin && n.type === 'api') {
      if (!n.method) push('node', n.id, 'method', 'method_required', 'api 节点必须填写 method')
      if (!n.url) push('node', n.id, 'url', 'url_required', 'api 节点必须填写 url')
    }
    if (!n.plugin && n.type === 'script' && !n.code?.trim())
      push('node', n.id, 'code', 'script_required', '脚本节点必须编写脚本')
    if (n.mode !== 'trigger') {
      const extra = (['body', 'waitTimeout', 'timeoutAction', 'timeoutOutput'] as const).filter(
        (k) => n[k] !== undefined && n[k] !== null
      )
      extra.forEach((k) => push('node', n.id, k, 'trigger_field_on_auto', `${k} 只在被动触发节点可用`))
    }
  }

  const pairs = new Set<string>()
  for (const e of rule.edges) {
    if (!ids.has(e.source) || !ids.has(e.target))
      push('edge', e.id, 'source', 'edge_dangling', '连线引用了不存在的节点')
    if (e.source === e.target) push('edge', e.id, 'target', 'self_loop', '不能连接到自身')
    const key = `${e.source}:${e.sourcePort || ''}→${e.target}`
    if (pairs.has(key)) push('edge', e.id, 'target', 'edge_duplicate', '两个节点之间存在重复连线')
    pairs.add(key)
  }

  checkLinks(rule, push)

  const { rest } = kahn(
    rule.nodes.map((n) => n.id),
    rule.edges.filter((e) => e.source !== e.target)
  )
  if (rest.length) {
    push('rule', '', 'edges', 'cycle', '图中存在环')
    rest.forEach((id) => push('node', id, 'id', 'cycle', '节点处于环上或环的下游'))
  }
  return issues
}

type Push = (target: Issue['target'], id: string, field: string, code: string, message: string) => void

/** 分支器：分支数、条件左值与运算符、比较值 */
function checkBranches(n: Node, push: Push) {
  const branches = n.branches || []
  if (!branches.length || branches.length > MAX_BRANCHES)
    push('node', n.id, 'branches', 'branch_count', `分支数必须在 1～${MAX_BRANCHES} 之间`)
  branches.forEach((b, i) => {
    const field = `branches.${i}`
    if (!b.conditions?.length || b.conditions.length > MAX_CONDITIONS)
      push('node', n.id, `${field}.conditions`, 'condition_count', `每个分支的条件数必须在 1～${MAX_CONDITIONS} 之间`)
    b.conditions?.forEach((c, j) => {
      const cf = `${field}.conditions.${j}`
      if (!c.left?.trim()) push('node', n.id, `${cf}.left`, 'condition_left', `${branchLabel(b, i)}：请选择变量`)
      const op = OPERATORS.find((o) => o.value === c.operator)
      if (op?.right && (c.right === undefined || c.right === null || c.right === ''))
        push('node', n.id, `${cf}.right`, 'condition_right_required', `${branchLabel(b, i)}：请填写比较值`)
    })
  })
}

/** 开始 / 结束与端口：每个节点都在开始到结束的路径上，分支器每个端口都要连线 */
function checkLinks(rule: Rule, push: Push) {
  const hasIn = new Set(rule.edges.map((e) => e.target))
  const hasOut = new Set(rule.edges.map((e) => e.source))
  for (const n of rule.nodes) {
    if (n.type !== 'start' && !hasIn.has(n.id))
      push('node', n.id, '', 'node_no_input', `节点 ${n.name} 没有前驱，需要从开始节点连过来`)
    if (n.type !== 'end' && !hasOut.has(n.id))
      push('node', n.id, '', 'node_no_output', `节点 ${n.name} 没有后继，需要连到结束节点`)
    if (n.type !== 'selector') continue
    const used = new Set(rule.edges.filter((e) => e.source === n.id).map((e) => e.sourcePort))
    const ports = [...(n.branches || []).map((b) => b.id), PORT_DEFAULT]
    ports
      .filter((p) => !used.has(p))
      .forEach((p) =>
        push('node', n.id, 'branches', 'selector_port_unlinked', `分支「${portLabel(n.branches, p)}」没有连线`)
      )
  }
}

/** FieldRule 树展开为路径列表 */
export function fieldPaths(prefix: string, rules?: Record<string, FieldRule>): string[] {
  if (!rules) return []
  const out: string[] = []
  for (const [k, r] of Object.entries(rules)) {
    const p = `${prefix}.${k}`
    out.push(p)
    if (r?.fields) out.push(...fieldPaths(p, r.fields))
  }
  return out
}

/** 输出映射（对象）展开为路径列表：{ user: { id } } → prefix.user、prefix.user.id；字符串映射没有下级字段 */
function mappingPaths(prefix: string, mapping: unknown): string[] {
  if (!mapping || typeof mapping !== 'object' || Array.isArray(mapping)) return []
  const out: string[] = []
  for (const [k, v] of Object.entries(mapping as Record<string, unknown>)) {
    const p = `${prefix}.${k}`
    out.push(p, ...mappingPaths(p, v))
  }
  return out
}

/** 是否配置了输出映射（空串、空对象视为未配置，与后端一致） */
function hasMapping(v: unknown): boolean {
  if (v === undefined || v === null) return false
  if (typeof v === 'string') return v.trim() !== ''
  if (typeof v === 'object' && !Array.isArray(v)) return Object.keys(v as object).length > 0
  return true
}

/**
 * 被引用节点是否可能未执行（输出为 null）：其自身或任一传递前驱有来自分支器的入边，
 * 即它所在的路径可能被剪枝；后端校验的警告是最终依据，这里只做补全提示
 */
function maybeNull(nodeId: string, edges: Edge[]): boolean {
  const up = ancestors(nodeId, edges)
  up.add(nodeId)
  return edges.some((e) => !!e.sourcePort && up.has(e.target))
}

/**
 * 节点输出的候选路径：被动节点按 body.* / result 展开；
 * 任务结果按输出映射的字段展开，插件节点按插件的输出映射展开；
 * 普通节点未配置输出映射时结果不写入变量池，没有结果候选
 */
function outputCandidates(
  rule: Rule,
  nodeId: string,
  group: string,
  mayNull: boolean,
  specOf?: SpecResolver
): VariableCandidate[] {
  const n = rule.nodes.find((x) => x.id === nodeId)
  if (!n?.outputName) return []
  const base = n.outputName
  const c = (path: string) => ({ path, group, maybeNull: mayNull })
  const output = n.plugin ? specOf?.(n)?.config?.output : n.output
  const mapped = !!n.plugin || hasMapping(n.output)
  const resultPaths = (prefix: string) => mappingPaths(prefix, output)
  if (n.mode !== 'trigger') return mapped ? [c(base), ...resultPaths(base).map(c)] : []
  return [
    c(base),
    c(`${base}.body`),
    ...fieldPaths(`${base}.body`, n.body).map(c),
    ...(mapped ? [c(`${base}.result`), ...resultPaths(`${base}.result`).map(c)] : [])
  ]
}

/** 通用候选：request（开始节点声明的入参）/ run */
function baseCandidates(rule: Rule): VariableCandidate[] {
  const request = rule.nodes.find((n) => n.type === 'start')?.request
  return [
    { path: 'request.body', group: '链入参' },
    ...fieldPaths('request.body', request?.body).map((path) => ({ path, group: '链入参' })),
    { path: 'request.header', group: '请求头' },
    ...fieldPaths('request.header', request?.header).map((path) => ({ path, group: '请求头' })),
    { path: 'run.id', group: '运行' },
    { path: 'run.attempt', group: '运行' },
    { path: 'run.app', group: '运行' }
  ]
}

/** 前驱输出候选 */
function ancestorCandidates(rule: Rule, nodeId: string, specOf?: SpecResolver): VariableCandidate[] {
  const out: VariableCandidate[] = []
  for (const a of ancestors(nodeId, rule.edges)) {
    out.push(...outputCandidates(rule, a, '前驱输出', maybeNull(a, rule.edges), specOf))
  }
  return out
}

/** 变量补全候选（与后端引用范围一致，13-静态校验 第 4 条） */
export function variableCandidates(rule: Rule, scope: VariableScope, specOf?: SpecResolver): VariableCandidate[] {
  if (scope.kind === 'none') return []
  if (scope.kind === 'response') {
    return rule.nodes.flatMap((n) => outputCandidates(rule, n.id, '节点输出', false, specOf))
  }
  const n = rule.nodes.find((x) => x.id === scope.nodeId)
  const list = [...baseCandidates(rule), ...ancestorCandidates(rule, scope.nodeId, specOf)]
  if (n?.mode === 'trigger') {
    list.push(
      { path: 'trigger.body', group: '触发数据' },
      ...fieldPaths('trigger.body', n.body).map((path) => ({ path, group: '触发数据' }))
    )
  }
  return list
}
