// 画布节点/边上下文、运行态叠加与编辑器状态类型

import type { Ref } from 'vue'
import type { ChainNodeStatus } from '@/api/cron/chain/type'
import type { Edge, Node, NodeMode, Rule, TaskType, PluginSpec, UIPosition } from './dsl'
import type { Issue } from './issue'

/** 被动节点待触发信息（时间均为 Unix 秒） */
export interface RunTriggerOverlay {
  status: 'waiting' | 'triggered'
  startedAt?: number
  deadlineAt?: number
  triggeredAt?: number
}

/** 运行详情中叠加到节点上的运行状态 */
export interface RunNodeOverlay {
  status: ChainNodeStatus
  error?: string
  /** 执行耗时（毫秒，含重试）；执行结束后才有 */
  costMs?: number
  trigger?: RunTriggerOverlay
}

/**
 * 画布渲染上下文：节点/边组件经 inject 读取 DSL 与叠加状态，
 * 状态变化只驱动组件重渲染，不重建 Vue Flow 节点列表
 */
export interface CanvasContext {
  getNode: (id: string) => Node | undefined
  getEdge: (id: string) => Edge | undefined
  nodeIssues: (id: string) => Issue[]
  edgeIssues: (id: string) => Issue[]
  /** 复制节点时手动 ID 加 _copy 后缀，需提示修改 */
  isWarnNode: (id: string) => boolean
  overlay: (id: string) => RunNodeOverlay | undefined
  /** 模板展示信息（编辑器与运行详情加载到模板列表时可用） */
  getPlugin: (keyword: string) => PluginBrief | undefined
  /** 当前时间（Unix 秒），每秒刷新，用于待触发计时 */
  now: Ref<number>
  /** 点击节点底部运行状态条 */
  openStatus: (id: string) => void
}

/** 按模板节点的 template + pluginVersion 取已缓存的模板定义；未加载返回 undefined */
export type SpecResolver = (node: Node) => PluginSpec | undefined

/** 节点库拖入画布的数据 */
export type PaletteDrop =
  | { kind: 'basic'; mode: NodeMode; type: TaskType | 'loop' }
  | { kind: 'selector' }
  | { kind: 'plugin'; keyword: string }

/** 新节点创建后自动连线的来源：source 节点的出端口（分支器为分支 id / default） */
export interface NodeLink {
  source: string
  port?: string
}

/** 快速添加节点：点击输出端口，或拖出连线后在空白处松手 */
export interface QuickAddRequest {
  link: NodeLink
  /** 新节点左上角画布坐标 */
  position: UIPosition
  /** 是否需要避开已有节点（点击端口时按推荐位置放，可能与已有节点重叠） */
  avoidOverlap: boolean
  /** 弹出面板的屏幕坐标 */
  client: { x: number; y: number }
}

/** 画布中节点模板的展示信息 */
export interface PluginBrief {
  keyword: string
  name: string
  icon?: string
  /** 图标背景色（hex 如 #2563eb）；空 = 默认背景 */
  iconBg?: string
  type?: TaskType
  /** 当前生效版本号 */
  currentVersionNo: number
}

/** 编辑器选中对象；null = 未选中（显示链设置） */
export type EditorSelection = { kind: 'node'; id: string } | { kind: 'edge'; id: string } | null

/** 变量补全候选 */
export interface VariableCandidate {
  /** 变量路径，如 request.body.uid */
  path: string
  /** 分组说明 */
  group: string
  /** 经过条件边才能产出，可能为 null */
  maybeNull?: boolean
}

/** 变量补全的编辑位置 */
export type VariableScope = { kind: 'task'; nodeId: string } | { kind: 'response' } | { kind: 'none' }

/** 本地草稿（localStorage） */
export interface ChainDraft {
  /** 草稿基于的版本 id；0 = 新链 */
  baseVersionId: number
  rule: Rule
  /** 暂存时间（毫秒） */
  savedAt: number
}

/** 连线预检使用的最小边结构 */
export interface GraphEdgeLike {
  source: string
  target: string
}

/** 撤销/重做快照栈 */
export interface History {
  /** 重置为初始状态，清空栈 */
  reset: (snapshot: string) => void
  /** 记录一次变更后的状态；与当前状态相同时忽略 */
  commit: (snapshot: string) => boolean
  /** 撤销，返回撤销后的状态；不可撤销时返回 null */
  undo: () => string | null
  /** 重做，返回重做后的状态；不可重做时返回 null */
  redo: () => string | null
  canUndo: () => boolean
  canRedo: () => boolean
}
