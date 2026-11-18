// 规则 DSL 类型，对齐后端 internal/server/chain/rule.go（chain_version.rule 的 JSON 结构）

/** 节点类型 */
export type NodeMode = 'auto' | 'trigger'

/** 任务类型 */
export type TaskType = 'api' | 'script' | 'chain'

/** 控制节点类型：在推进事务内完成，不派发执行 */
export type ControlType = 'start' | 'end' | 'selector' | 'loop'

/** 节点类型 */
export type NodeType = TaskType | ControlType

/** 分支条件运算符，对齐后端 chain/selector.go */
export type Operator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'len_gt'
  | 'len_gte'
  | 'len_lt'
  | 'len_lte'
  | 'contain'
  | 'not_contain'
  | 'contain_key'
  | 'not_contain_key'
  | 'empty'
  | 'not_empty'
  | 'true'
  | 'false'

/** 循环配置：循环体子图按模式反复执行（与后端 chain/rule.go 的 LoopConfig 一致） */
export interface Loop {
  mode: 'count' | 'each'
  times?: number
  items?: string
  itemVar?: string
  maxIterations?: number
  /** true = 每轮输出收集为数组（要求配置 output 映射）；false = 只保留最后一轮 */
  collect?: boolean
  body: { nodes: Node[]; edges: Edge[] }
}

/** 分支条件：left 变量 operator right */
export interface Condition {
  /** 变量路径，如 order.amount */
  left: string
  operator: Operator
  /** 比较值：字面量，或整串为 {path} 的变量引用；一元运算符不填 */
  right?: any
}

/** 分支器的一个分支（分支 id 即出边 sourcePort） */
export interface Branch {
  id: string
  name?: string
  /** and（默认）| or */
  logic?: 'and' | 'or'
  conditions: Condition[]
}

/** 被动节点待触发超时动作 */
export type TimeoutAction = 'fail' | 'break' | 'continue'

/** 请求格式 */
export type RequestType = 'json' | 'form' | 'text' | 'multipart'

/** 响应格式 */
export type ResponseType = 'json' | 'form' | 'text'

/** FieldRule 字段类型；空 = any */
export type FieldType = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'any'

/** 字段校验规则（树形） */
export interface FieldRule {
  type?: FieldType
  required?: boolean
  min?: number
  max?: number
  minLen?: number
  maxLen?: number
  enum?: any[]
  pattern?: string
  fields?: Record<string, FieldRule>
  items?: FieldRule
}

/** 入参校验规则 */
export interface RequestRule {
  body?: Record<string, FieldRule>
  header?: Record<string, FieldRule>
}

/** 返回模板 */
export interface ResponseRule {
  body?: any
  defaultBody?: any
}

/** 重试策略 */
export interface RetryPolicy {
  errors?: string[]
  /** 兼容旧规则；新规则用 condition 表达状态码 */
  statuses?: number[]
  /** 兼容旧规则；新规则用 condition 的 contains 语法 */
  contains?: string[]
  /** 基于 error.type/status/message/body 的匹配表达式 */
  condition?: string
  maxAttempts?: number
  interval?: number
  backoffRate?: number
  maxDelay?: number
  jitter?: 'NONE' | 'FULL'
}

/** 节点挂起策略：重试耗尽后命中错误时运行进入 suspended，延迟到期后重跑当前节点 */
export interface SuspendPolicy {
  /** 匹配的引擎错误名 */
  errors?: string[]
  /** 基于 error.type/status/message/body 的匹配表达式 */
  condition?: string
  /** 延迟重跑秒数，默认 300 */
  delay?: number
  /** 最长等待秒数，默认 7 天，最大 30 天 */
  maxWait?: number
}

/** 节点 */
export interface Node {
  id: string
  name: string
  /** 执行方式：只用于任务节点 */
  mode?: NodeMode
  /** 节点类型：普通节点必填；模板节点不写，由模板提供 */
  type?: NodeType
  outputName?: string

  // 控制节点
  /** start：入参校验 */
  request?: RequestRule
  /** end：返回模板 */
  response?: ResponseRule
  /** selector：分支，按顺序判断 */
  branches?: Branch[]
  /** loop：循环配置与循环体子图（type = 'loop' 时必填） */
  loop?: Loop

  // 插件节点（有 plugin 即为插件节点：提前配好的节点；input 只保存改过的参数值）
  plugin?: string
  pluginVersion?: number
  /** 只用于插件定义的编辑草稿：内部参数（保存时放到 spec.internal，不进 config） */
  internal?: string[]

  // 任务字段
  input?: any
  /** 输出映射：api 以 ${response...}、脚本以 ${output...} 引用执行结果；未配置 = 不写入变量池 */
  output?: any
  timeout?: number
  totalTimeout?: number
  retry?: RetryPolicy[]
  suspend?: SuspendPolicy
  ignoreError?: boolean
  fallbackOutput?: any
  nowResponse?: boolean
  /** 准入条件：为空 = 始终执行；不满足 = 当前节点按 bypassed 跳过，下游继续 */
  condition?: string
  /** 准入条件不满足时的输出模板；写入 outputName，下游可继续引用 */
  skipOutput?: any

  // chain 专属（运行指定流程）
  chain?: string

  // api 专属
  method?: string
  url?: string
  header?: Record<string, any>
  responseCondition?: string
  errorMsg?: string
  requestType?: RequestType
  responseType?: ResponseType
  /** multipart：input 中按文件上传的字段 */
  files?: string[]

  // script 专属
  /** 脚本源码（定义 function handler(ctx, input)），随链版本保存 */
  code?: string

  // 触发字段（mode=trigger）
  body?: Record<string, FieldRule>
  waitTimeout?: number
  timeoutAction?: TimeoutAction
  timeoutOutput?: any
}

/** 边 */
export interface Edge {
  id: string
  source: string
  target: string
  /** 起点端口：source 为分支器时必填（分支 id 或 default） */
  sourcePort?: string
}

/** 画布坐标 */
export interface UIPosition {
  x: number
  y: number
}

/** 画布视口 */
export interface UIViewport {
  x: number
  y: number
  zoom: number
}

/** 画布元数据（引擎忽略） */
export interface RuleUI {
  nodes?: Record<string, UIPosition>
  viewport?: UIViewport
}

/** 链规则 */
export interface Rule {
  /** 节点（含唯一的 start / end） */
  nodes: Node[]
  edges: Edge[]
  ui?: RuleUI
}

/** 节点插件定义（chain_node_version.spec），对齐后端 chain/node_plugin.go */
export interface PluginSpec {
  type: TaskType
  /** 提前配好的节点任务配置（与普通节点同字段；只能引用 run） */
  config: Record<string, any>
  /** 内部参数：config.input 中由插件固定的参数，使用插件的节点看不到、不能修改；其他应用看到的值为 ****** */
  internal?: string[]
}
