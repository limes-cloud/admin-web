// 链编辑器状态：图（规则）、选中对象、历史、脏标记、校验结果、本地草稿
// 列表页不进 store；画布组件通过 rule 渲染，属性面板直接编辑 rule 中的节点/边

import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { GetChainNodeVersion, ListChainNode, ValidateChainRule } from '@/api/cron/chain/api'
import type { ChainNodeInfo } from '@/api/cron/chain/type'
import { getAppKeyword } from '@/utils/app-context'
import type {
  Edge,
  Node,
  NodeMode,
  Rule,
  TaskType,
  PluginSpec,
  UIPosition,
  UIViewport
} from '@/views/apps/cron/chain/types/dsl'
import type { ChainDraft, EditorSelection, NodeLink, SpecResolver } from '@/views/apps/cron/chain/types/graph'
import type { Issue } from '@/views/apps/cron/chain/types/issue'
import { checkConnect, localCheck } from '@/views/apps/cron/chain/components/graph/graph-utils'
import { createHistory } from '@/views/apps/cron/chain/components/graph/history'
import { fillMissingPositions, layoutRule } from '@/views/apps/cron/chain/components/graph/layout'
import {
  ensureTerminals,
  isTerminal,
  parseSpec,
  stringifyRule
} from '@/views/apps/cron/chain/components/graph/flow-convert'
import { newBranch } from '@/views/apps/cron/chain/utils/branch'
import {
  CONTROL_LABEL,
  DRAFT_DEBOUNCE_MS,
  MODE_LABEL,
  SCRIPT_TEMPLATE,
  TYPE_LABEL,
  VALIDATE_DEBOUNCE_MS
} from '@/views/apps/cron/chain/utils/constants'
import { clone, isUuid, uuid } from '@/views/apps/cron/chain/utils/format'

/** 属性编辑合并为一步历史的防抖时间 */
const COMMIT_DEBOUNCE_MS = 400

/** 本地草稿键 */
function draftKey(chainId: number): string {
  return `chain-draft:${getAppKeyword()}:${chainId}`
}

/** 模板版本缓存键 */
function specKey(keyword: string, version: number): string {
  return `${keyword}@${version}`
}

/** 问题定位键 */
function issueKey(i: Issue): string {
  return `${i.target}|${i.id}|${i.field}`
}

export const useChainEditorStore = defineStore('chainEditorStore', () => {
  const chainId = ref(0)
  /** 当前编辑基于的版本 id；0 = 尚无版本 */
  const baseVersionId = ref(0)
  const rule = ref<Rule>({ nodes: [], edges: [] })
  /** 当前编辑的循环节点 id；null = 主链（编辑：循环体子图） */
  const editingLoopId = ref<string | null>(null)

  /** 当前编辑作用域的节点/边（主链或循环体子图，同一引用） */
  const activeNodes = computed<Array<Node>>(() => {
    if (editingLoopId.value) {
      const n = findNode(editingLoopId.value)
      if (n?.loop?.body) return n.loop.body.nodes
    }
    return rule.value.nodes
  })
  const activeEdges = computed<Array<Edge>>(() => {
    if (editingLoopId.value) {
      const n = findNode(editingLoopId.value)
      if (n?.loop?.body) return n.loop.body.edges
    }
    return rule.value.edges
  })
  /** 当前编辑作用域的规则视图（画布 / 校验使用；引用与根共享） */
  const activeRule = computed<Rule>(() => ({ ...rule.value, nodes: activeNodes.value, edges: activeEdges.value }))

  function findNode(id: string): Node | undefined {
    return rule.value.nodes.find((n) => n.id === id)
  }

  /** 进入循环体子图编辑模式 */
  function enterLoop(loopId: string): void {
    const n = findNode(loopId)
    if (!n?.loop?.body) return
    editingLoopId.value = loopId
    // 子图节点缺位置时自动布局（位置复用主 ui.nodes，节点 id 全局唯一）
    const ui = rule.value.ui || (rule.value.ui = {})
    if (n.loop.body.nodes.some((bn) => !ui.nodes?.[bn.id])) {
      ui.nodes = {
        ...(ui.nodes || {}),
        ...layoutRule({ ...rule.value, nodes: n.loop.body.nodes, edges: n.loop.body.edges, ui })
      }
    }
    selection.value = null
    historyTick.value++
    scheduleValidate()
  }

  /** 返回主链编辑 */
  function exitLoop(): void {
    if (!editingLoopId.value) return
    editingLoopId.value = null
    selection.value = null
    historyTick.value++
    scheduleValidate()
  }

  const selection = ref<EditorSelection>(null)
  /** 后端校验结果（最近一次有效响应） */
  const remoteIssues = ref<Issue[]>([])
  const validating = ref(false)
  /** 是否有未保存修改 */
  const dirty = ref(false)
  /** 最近一次草稿暂存时间（毫秒） */
  const draftSavedAt = ref(0)
  /** 复制出的、ID 需要提示修改的节点 */
  const warnNodes = ref<string[]>([])
  /** 可用的节点模板（启用中，含生效版本 spec） */
  const plugins = ref<ChainNodeInfo[]>([])
  /** 模板版本 spec 缓存（keyword@version → spec；null = 取不到） */
  const specCache = ref<Record<string, PluginSpec | null>>({})
  const specLoading = new Map<string, Promise<PluginSpec | null>>()
  /** 视口读取函数，由画布注册（保存时写入 ui.viewport） */
  let viewportGetter: (() => UIViewport) | null = null

  const history = createHistory(50)
  /** 历史栈变化计数，驱动撤销/重做按钮状态 */
  const historyTick = ref(0)
  let commitTimer: ReturnType<typeof setTimeout> | null = null
  let validateTimer: ReturnType<typeof setTimeout> | null = null
  let draftTimer: ReturnType<typeof setTimeout> | null = null
  /** 校验请求序号：在途时再次变更则丢弃旧响应 */
  let validateSeq = 0

  const localIssues = computed(() => localCheck(activeRule.value))

  /** 合并问题：后端结果为准，本地预检补充后端尚未覆盖的位置 */
  const issues = computed<Issue[]>(() => {
    const covered = new Set(remoteIssues.value.map(issueKey))
    const local = localIssues.value.filter((i) => !covered.has(issueKey(i)))
    return [...local, ...remoteIssues.value]
  })

  const hasError = computed(() => issues.value.some((i) => i.level === 'error'))
  const canUndo = computed(() => historyTick.value >= 0 && history.canUndo())
  const canRedo = computed(() => historyTick.value >= 0 && history.canRedo())

  const selectedNode = computed<Node | undefined>(() => {
    const s = selection.value
    return s?.kind === 'node' ? activeNodes.value.find((n) => n.id === s.id) : undefined
  })

  const selectedEdge = computed<Edge | undefined>(() => {
    const s = selection.value
    return s?.kind === 'edge' ? activeEdges.value.find((e) => e.id === s.id) : undefined
  })

  // ---------- 加载 ----------

  /** 载入规则（打开链 / 恢复草稿 / 以某版本为底），清空历史 */
  function load(id: number, versionId: number, r: Rule, isDirty = false) {
    chainId.value = id
    baseVersionId.value = versionId
    const next = clone(r)
    next.nodes = next.nodes || []
    next.edges = next.edges || []
    // 新链或旧规则缺少开始 / 结束节点时补齐（补齐即为未保存修改）
    if (ensureTerminals(next)) isDirty = true
    fillMissingPositions(next)
    rule.value = next
    editingLoopId.value = null
    selection.value = null
    remoteIssues.value = []
    warnNodes.value = []
    dirty.value = isDirty
    history.reset(snapshot())
    historyTick.value++
    validateNow()
    // 预取模板节点所引用版本的 spec（参数表单、变量补全用）
    next.nodes.forEach((n) => {
      if (n.plugin && n.pluginVersion) ensureSpec(n.plugin, n.pluginVersion)
    })
  }

  // ---------- 节点模板 ----------

  /** 加载可用模板列表（启用中，含生效版本 spec），并写入 spec 缓存 */
  async function loadPlugins() {
    try {
      const res = await ListChainNode({ page: 1, pageSize: 200, status: true, withSpec: true }, false)
      plugins.value = (res?.list || []).filter((t) => t.currentVersion)
      plugins.value.forEach((t) => {
        const spec = parseSpec(t.spec)
        if (spec) specCache.value[specKey(t.keyword, t.currentVersionNo)] = spec
      })
    } catch {
      plugins.value = []
    }
  }

  function pluginOf(keyword?: string): ChainNodeInfo | undefined {
    return keyword ? plugins.value.find((t) => t.keyword === keyword) : undefined
  }

  /** 按 keyword + version 取模板 spec（缓存，同一版本只请求一次） */
  function ensureSpec(keyword: string, version: number): Promise<PluginSpec | null> {
    const key = specKey(keyword, version)
    if (key in specCache.value) return Promise.resolve(specCache.value[key])
    const pending = specLoading.get(key)
    if (pending) return pending
    const p = GetChainNodeVersion({ keyword, version }, false)
      .then((res) => parseSpec(res?.spec) || null)
      .catch(() => null)
      .then((spec) => {
        specCache.value[key] = spec
        specLoading.delete(key)
        return spec
      })
    specLoading.set(key, p)
    return p
  }

  /** 同步读取模板节点的 spec（未加载时触发加载并返回 undefined） */
  const specOf: SpecResolver = (n) => {
    if (!n.plugin || !n.pluginVersion) return undefined
    const key = specKey(n.plugin, n.pluginVersion)
    if (!(key in specCache.value)) {
      ensureSpec(n.plugin, n.pluginVersion)
      return undefined
    }
    return specCache.value[key] || undefined
  }

  /** 升级模板节点到模板当前生效版本 */
  function upgradePlugin(id: string) {
    const n = activeNodes.value.find((x) => x.id === id)
    const t = pluginOf(n?.plugin)
    if (!n || !t || !t.currentVersionNo || n.pluginVersion === t.currentVersionNo) return
    n.pluginVersion = t.currentVersionNo
    ensureSpec(t.keyword, t.currentVersionNo)
    commit()
  }

  /** 当前规则快照 */
  function snapshot(): string {
    return JSON.stringify(rule.value)
  }

  // ---------- 历史与副作用 ----------

  /** 立即提交一步历史，并安排校验与草稿 */
  function commit() {
    if (commitTimer) {
      clearTimeout(commitTimer)
      commitTimer = null
    }
    if (history.commit(snapshot())) {
      historyTick.value++
      dirty.value = true
      scheduleValidate()
      scheduleDraft()
    }
  }

  // 属性面板直接改 rule：深度监听，防抖合并为一步；
  // 加载与撤销后的触发会因快照与栈顶相同被 history.commit 忽略
  watch(
    rule,
    () => {
      if (commitTimer) clearTimeout(commitTimer)
      commitTimer = setTimeout(commit, COMMIT_DEBOUNCE_MS)
      // 校验按最后一次变更起算 500ms，不等历史合并
      scheduleValidate()
    },
    { deep: true }
  )

  /** 用快照替换当前规则（撤销/重做） */
  function restore(snap: string) {
    rule.value = JSON.parse(snap)
    const s = selection.value
    if (s?.kind === 'node' && !activeNodes.value.some((n) => n.id === s.id)) selection.value = null
    if (s?.kind === 'edge' && !activeEdges.value.some((e) => e.id === s.id)) selection.value = null
    historyTick.value++
    dirty.value = true
    scheduleValidate()
    scheduleDraft()
  }

  function undo() {
    commit()
    const snap = history.undo()
    if (snap !== null) restore(snap)
  }

  function redo() {
    const snap = history.redo()
    if (snap !== null) restore(snap)
  }

  // ---------- 校验 ----------

  function scheduleValidate() {
    if (validateTimer) clearTimeout(validateTimer)
    validateTimer = setTimeout(validateNow, VALIDATE_DEBOUNCE_MS)
  }

  /** 调后端 ValidateChainRule；按请求序号丢弃过期响应 */
  async function validateNow() {
    if (validateTimer) {
      clearTimeout(validateTimer)
      validateTimer = null
    }
    const seq = ++validateSeq
    if (!activeNodes.value.length) {
      remoteIssues.value = []
      return
    }
    validating.value = true
    try {
      const res = await ValidateChainRule({ rule: exportRule() })
      if (seq !== validateSeq) return
      remoteIssues.value = (res?.issues || []).map((i) => ({ ...i, id: i.id || '', field: i.field || '' }))
    } catch {
      // 校验接口失败时保留本地预检结果，不阻断编辑
    } finally {
      if (seq === validateSeq) validating.value = false
    }
  }

  // ---------- 草稿 ----------

  function scheduleDraft() {
    if (!chainId.value) return
    if (draftTimer) clearTimeout(draftTimer)
    draftTimer = setTimeout(saveDraft, DRAFT_DEBOUNCE_MS)
  }

  function saveDraft() {
    if (!chainId.value || !dirty.value) return
    const d: ChainDraft = { baseVersionId: baseVersionId.value, rule: rule.value, savedAt: Date.now() }
    try {
      localStorage.setItem(draftKey(chainId.value), JSON.stringify(d))
      draftSavedAt.value = d.savedAt
    } catch {
      // localStorage 写满时忽略，不影响编辑
    }
  }

  function readDraft(id: number): ChainDraft | null {
    try {
      const raw = localStorage.getItem(draftKey(id))
      if (!raw) return null
      const d = JSON.parse(raw) as ChainDraft
      return d && d.rule && Array.isArray(d.rule.nodes) ? d : null
    } catch {
      return null
    }
  }

  function clearDraft(id = chainId.value) {
    if (draftTimer) clearTimeout(draftTimer)
    localStorage.removeItem(draftKey(id))
    draftSavedAt.value = 0
  }

  /** 保存成功：清草稿、记录新基线 */
  function markSaved(versionId: number) {
    baseVersionId.value = versionId
    dirty.value = false
    clearDraft()
  }

  /** 离开编辑页：停止所有定时器 */
  function dispose() {
    ;[commitTimer, validateTimer, draftTimer].forEach((t) => t && clearTimeout(t))
    commitTimer = validateTimer = draftTimer = null
    validateSeq++
    viewportGetter = null
  }

  // ---------- 图操作 ----------

  function positions(): Record<string, UIPosition> {
    const ui = rule.value.ui || (rule.value.ui = {})
    return ui.nodes || (ui.nodes = {})
  }

  /** 新节点名称：前缀 + 序号，链内唯一 */
  function nextName(prefix: string): string {
    const names = new Set(activeNodes.value.map((n) => n.name))
    let i = 1
    while (names.has(`${prefix}${i}`)) i++
    return `${prefix}${i}`
  }

  /** 拖入节点 */
  function addNode(mode: NodeMode, type: TaskType, pos: UIPosition, link?: NodeLink): Node {
    const prefix = mode === 'trigger' ? `${MODE_LABEL.trigger}${TYPE_LABEL[type]}` : TYPE_LABEL[type]
    const node: Node = { id: uuid(), name: nextName(prefix), mode, type }
    if (type === 'api') node.method = 'POST'
    if (type === 'script') node.code = SCRIPT_TEMPLATE
    if (type === 'chain') node.chain = '' 
    return insertNode(node, pos, link)
  }

  /** 拖入循环：默认循环体为空（start → end），模式为次数循环 */
  function addLoop(pos: UIPosition, link?: NodeLink): Node {
    const body = {
      nodes: [
        { id: uuid(), name: '开始', type: 'start' as const },
        { id: uuid(), name: '循环体', type: 'api' as const, method: 'POST', url: '' },
        { id: uuid(), name: '结束', type: 'end' as const }
      ],
      edges: [] as Edge[]
    }
    body.edges.push({ id: uuid(), source: body.nodes[0].id, target: body.nodes[1].id })
    body.edges.push({ id: uuid(), source: body.nodes[1].id, target: body.nodes[2].id })
    const node: Node = {
      id: uuid(),
      name: nextName(CONTROL_LABEL.loop),
      type: 'loop',
      loop: { mode: 'count', times: 3, body }
    }
    return insertNode(node, pos, link)
  }

  /** 拖入分支器：默认一个"如果"分支 */
  function addSelector(pos: UIPosition, link?: NodeLink): Node {
    const node: Node = { id: uuid(), name: nextName(CONTROL_LABEL.selector), type: 'selector', branches: [] }
    node.branches!.push(newBranch(node.branches!))
    return insertNode(node, pos, link)
  }

  /** 删除分支：同时删除该端口的出边 */
  function removeBranch(nodeId: string, branchId: string) {
    const n = activeNodes.value.find((x) => x.id === nodeId)
    if (!n?.branches) return
    n.branches = n.branches.filter((b) => b.id !== branchId)
    activeEdges.value.splice(
      0,
      activeEdges.value.length,
      ...activeEdges.value.filter((e) => !(e.source === nodeId && e.sourcePort === branchId))
    )
    commit()
  }

  /** 拖入模板节点：默认自动执行，取模板当前生效版本 */
  function addPluginNode(keyword: string, pos: UIPosition, link?: NodeLink): Node | undefined {
    const t = pluginOf(keyword)
    if (!t?.currentVersionNo) return undefined
    const node: Node = {
      id: uuid(),
      name: nextName(t.name),
      mode: 'auto',
      plugin: t.keyword,
      pluginVersion: t.currentVersionNo
    }
    ensureSpec(t.keyword, t.currentVersionNo)
    return insertNode(node, pos, link)
  }

  /** 插入节点；link 非空时同时从 link.source 的端口连到新节点，与插入合并为一步历史 */
  function insertNode(node: Node, pos: UIPosition, link?: NodeLink): Node {
    activeNodes.value.push(node)
    positions()[node.id] = { x: Math.round(pos.x), y: Math.round(pos.y) }
    if (link) {
      const isSelector = activeNodes.value.find((n) => n.id === link.source)?.type === 'selector'
      activeEdges.value.push(
        isSelector && link.port
          ? { id: uuid(), source: link.source, target: node.id, sourcePort: link.port }
          : { id: uuid(), source: link.source, target: node.id }
      )
    }
    selection.value = { kind: 'node', id: node.id }
    commit()
    return node
  }

  /** 复制节点：随机 ID 重新生成；手动 ID 加 _copy 后缀并标黄 */
  function duplicateNode(id: string) {
    const src = activeNodes.value.find((n) => n.id === id)
    if (!src || isTerminal(src)) return
    const ids = new Set(activeNodes.value.map((n) => n.id))
    const copy = clone(src)
    if (isUuid(src.id)) {
      copy.id = uuid()
    } else {
      let next = `${src.id}_copy`.slice(0, 64)
      let i = 2
      while (ids.has(next)) next = `${src.id}_copy${i++}`.slice(0, 64)
      copy.id = next
      warnNodes.value.push(copy.id)
    }
    const names = new Set(activeNodes.value.map((n) => n.name))
    let name = `${src.name}_副本`
    let i = 2
    while (names.has(name)) name = `${src.name}_副本${i++}`
    copy.name = name
    // outputName 链内唯一，副本清空避免冲突
    delete copy.outputName
    activeNodes.value.push(copy)
    const p = positions()[src.id] || { x: 0, y: 0 }
    positions()[copy.id] = { x: p.x + 40, y: p.y + 80 }
    selection.value = { kind: 'node', id: copy.id }
    commit()
  }

  /** 删除节点（连同相连的边）与边，合并为一步历史 */
  function removeElements(nodeIds: string[], edgeIds: string[] = []) {
    // 开始 / 结束节点不能删除
    const nodeSet = new Set(nodeIds.filter((id) => !isTerminal(activeNodes.value.find((n) => n.id === id))))
    const edgeSet = new Set(edgeIds)
    const nodes = activeNodes.value.filter((n) => !nodeSet.has(n.id))
    const edges = activeEdges.value.filter(
      (e) => !edgeSet.has(e.id) && !nodeSet.has(e.source) && !nodeSet.has(e.target)
    )
    if (nodes.length === activeNodes.value.length && edges.length === activeEdges.value.length) return
    activeNodes.value.splice(0, activeNodes.value.length, ...nodes)
    activeEdges.value.splice(0, activeEdges.value.length, ...edges)
    nodeSet.forEach((id) => delete positions()[id])
    warnNodes.value = warnNodes.value.filter((id) => !nodeSet.has(id))
    const s = selection.value
    if (s?.kind === 'node' && !nodes.some((n) => n.id === s.id)) selection.value = null
    if (s?.kind === 'edge' && !edges.some((e) => e.id === s.id)) selection.value = null
    commit()
  }

  /** 连线：本地预检通过才建立，失败返回原因；port 为分支器出端口 */
  function connect(source: string, target: string, port?: string): string | null {
    const check = checkConnect(source, target, activeEdges.value, port)
    if (!check.ok) return check.reason || '不允许的连线'
    const isSelector = activeNodes.value.find((n) => n.id === source)?.type === 'selector'
    activeEdges.value.push(
      isSelector && port ? { id: uuid(), source, target, sourcePort: port } : { id: uuid(), source, target }
    )
    commit()
    return null
  }

  /** 拖动松手：写入坐标并记一步历史 */
  function moveNodes(moved: { id: string; x: number; y: number }[]) {
    const pos = positions()
    let changed = false
    moved.forEach((m) => {
      const p = pos[m.id]
      const x = Math.round(m.x)
      const y = Math.round(m.y)
      if (!p || p.x !== x || p.y !== y) {
        pos[m.id] = { x, y }
        changed = true
      }
    })
    if (changed) commit()
  }

  /** 自动布局全部节点（可撤销） */
  function autoLayout() {
    const ui = rule.value.ui || (rule.value.ui = {})
    ui.nodes = { ...(ui.nodes || {}), ...layoutRule(activeRule.value) }
    commit()
  }

  /** 修改节点 ID：同步边、坐标与选中 */
  function renameNode(oldId: string, newId: string) {
    const n = rule.value.nodes.find((x) => x.id === oldId)
    if (!n || oldId === newId) return
    n.id = newId
    rule.value.edges.forEach((e) => {
      if (e.source === oldId) e.source = newId
      if (e.target === oldId) e.target = newId
    })
    const pos = positions()
    if (pos[oldId]) {
      pos[newId] = pos[oldId]
      delete pos[oldId]
    }
    warnNodes.value = warnNodes.value.filter((id) => id !== oldId)
    selection.value = { kind: 'node', id: newId }
    commit()
  }

  function select(s: EditorSelection) {
    selection.value = s
  }

  function registerViewport(getter: (() => UIViewport) | null) {
    viewportGetter = getter
  }

  /** 导出提交给后端的规则 JSON（含 ui 坐标与视口） */
  function exportRule(): string {
    return stringifyRule(rule.value, viewportGetter?.())
  }

  return {
    chainId,
    baseVersionId,
    rule,
    selection,
    remoteIssues,
    validating,
    dirty,
    draftSavedAt,
    warnNodes,
    issues,
    hasError,
    canUndo,
    canRedo,
    selectedNode,
    selectedEdge,
    load,
    commit,
    undo,
    redo,
    validateNow,
    readDraft,
    clearDraft,
    markSaved,
    dispose,
    plugins,
    editingLoopId,
    activeNodes,
    activeEdges,
    activeRule,
    enterLoop,
    exitLoop,
    specCache,
    loadPlugins,
    pluginOf,
    ensureSpec,
    specOf,
    upgradePlugin,
    addNode,
    addSelector,
    addLoop,
    removeBranch,
    addPluginNode,
    duplicateNode,
    removeElements,
    connect,
    moveNodes,
    autoLayout,
    renameNode,
    select,
    registerViewport,
    exportRule
  }
})
