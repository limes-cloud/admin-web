// 调度链（流程调度）接口类型，对齐 api/cron/server/chain/*.proto
// int64 字段经 protojson 序列化为字符串，消费方用 Number() 转换；uint32 为数字

/** int64 字段（protojson 序列化为字符串） */
export type Int64 = string | number

// ---------- Chain ----------

export interface ChainInfo {
  id: number
  keyword: string
  name: string
  description?: string
  status: boolean
  currentVersion: number
  currentVersionNo: number
  createdAt: number
  updatedAt: number
}

export interface GetChainRequest {
  id: number
}

export interface GetChainReply {
  chain: ChainInfo
}

export interface ListChainRequest {
  page: number
  pageSize: number
  keyword?: string
  name?: string
  status?: boolean
  /** 按所属应用筛选（仅 manager 生效） */
  filterApp?: string
}

export interface ListChainReply {
  total: number
  list: ChainInfo[]
}

export interface CreateChainRequest {
  keyword: string
  name: string
  description?: string
}

export interface CreateChainReply {
  id: number
}

export interface UpdateChainRequest {
  id: number
  name: string
  description?: string
}

export interface DeleteChainRequest {
  id: number
}

export interface UpdateChainStatusRequest {
  id: number
  status: boolean
}

export interface ChainVersion {
  id: number
  chainId: number
  version: number
  remark?: string
  current: boolean
  createdAt: number
}

export interface CreateChainVersionRequest {
  chainId: number
  rule: string
  remark?: string
  publish: boolean
}

export interface CreateChainVersionReply {
  id: number
  version: number
}

export interface ListChainVersionRequest {
  chainId: number
  page: number
  pageSize: number
}

export interface ListChainVersionReply {
  total: number
  list: ChainVersion[]
}

export interface GetChainVersionRequest {
  id: number
}

export interface GetChainVersionReply {
  version: ChainVersion
  rule: string
}

export interface SwitchChainVersionRequest {
  chainId: number
  versionId: number
}

export interface RuleIssue {
  level: 'error' | 'warning'
  target: 'rule' | 'node' | 'edge'
  id: string
  field: string
  code: string
  message: string
}

export interface ValidateChainRuleRequest {
  rule: string
}

export interface ValidateChainRuleReply {
  valid: boolean
  issues?: RuleIssue[]
}

// ---------- ChainRun ----------

/** 运行状态 */
export type ChainRunStatus = 'running' | 'suspended' | 'success' | 'fail' | 'break' | 'abandoned'

/** 节点运行状态 */
export type ChainNodeStatus =
  | 'pending'
  | 'ready'
  | 'running'
  | 'success'
  | 'ignored'
  | 'skipped'
  | 'bypassed'
  | 'fail'
  | 'canceled'

export interface PendingTrigger {
  nid: string
  deadlineAt: Int64
}

export interface TestChainNodeRequest {
  /** 节点 JSON（编辑器当前内容） */
  node: string
  /** 变量池：request、trigger、各 outputName 的值 */
  vars?: Record<string, any>
}

export interface TestChainNodeReply {
  /** 节点校验问题；有 error 时不执行 */
  issues?: RuleIssue[]
  /** success | ignored | bypassed | fail | break；未执行为空 */
  status: string
  output?: any
  request?: string
  response?: string
  logs?: string
  /** 脚本 ctx.response 提前返回的数据 */
  respond?: any
  errorCode?: string
  errorMsg?: string
  retry: number
  costMs: number
}

export interface DebugRunChainRequest {
  keyword: string
  input: Record<string, any>
  mode?: 'sync' | 'async'
  trx: string
  /** 直接运行这份规则（编辑器当前内容）；不传 = 生效版本 */
  rule?: string
}

export interface RunChainReply {
  rid: string
  status: ChainRunStatus
  output?: any
  errorCode?: string
  errorMsg?: string
  pendingTriggers?: PendingTrigger[]
  duplicated?: boolean
}

export interface ChainRunInfo {
  id: string
  chainId: number
  chainVersionId: number
  origin: string
  trx: string
  mode: string
  status: ChainRunStatus
  errorCode?: string
  errorMsg?: string
  startedAt: Int64
  finishedAt?: Int64
  respondedAt?: Int64
  createdAt: Int64
}

export interface GetChainRunRequest {
  id: string
}

export interface GetChainRunReply {
  run: ChainRunInfo
  input?: any
  output?: any
}

export interface ListChainRunRequest {
  page: number
  pageSize: number
  chainId?: number
  status?: string
  trx?: string
  pendingTrigger?: boolean
  startTime?: number
  endTime?: number
}

export interface ListChainRunReply {
  total: number
  list: ChainRunInfo[]
}

export interface GetChainRunGraphRequest {
  id: string
  withRule?: boolean
}

export interface ChainRunGraphRun {
  id: string
  status: ChainRunStatus
  executing: boolean
  errorCode?: string
  errorMsg?: string
  chainId: number
  chainVersionId: number
}

export interface ChainRunGraphNode {
  nid: string
  mode: string
  type: string
  status: ChainNodeStatus
  executor?: string
  error?: string
  startedAt?: Int64
  finishedAt?: Int64
  retry: number
  costMs: number
}

export interface ChainRunGraphTrigger {
  nid: string
  status: 'waiting' | 'triggered'
  startedAt?: Int64
  deadlineAt?: Int64
  triggeredAt?: Int64
}

export interface GetChainRunGraphReply {
  run: ChainRunGraphRun
  rule?: string
  nodes?: ChainRunGraphNode[]
  triggers?: ChainRunGraphTrigger[]
}

export interface ListChainRunNodeRequest {
  rid: string
  nid?: string
}

export interface ChainRunNode {
  nid: string
  mode: string
  type: string
  status: ChainNodeStatus
  execId: number
  executor?: string
  output?: any
  error?: string
  retry: number
  costMs: number
  /** JSON 字符串 */
  request?: string
  /** JSON 字符串 */
  response?: string
  /** JSON 字符串数组：[{level,msg,time}] */
  logs?: string
  deadlineAt?: Int64
  trx?: string
  body?: any
  caller?: string
  triggeredAt?: Int64
  startedAt?: Int64
  finishedAt?: Int64
}

export interface ListChainRunNodeReply {
  list: ChainRunNode[]
}

export interface GetChainRunContextRequest {
  id: string
}

export interface GetChainRunContextReply {
  context?: any
}

export interface AbandonChainRunRequest {
  id: string
}

export interface TriggerChainRunNodeRequest {
  rid: string
  nid: string
  trx: string
  body: Record<string, any>
}

export interface TriggerChainRunNodeReply {
  rid: string
  status: string
}

export interface ListChainTriggerRequest {
  page: number
  pageSize: number
  chainId?: number
}

export interface ChainTrigger {
  rid: string
  nid: string
  chainId: number
  deadlineAt: Int64
  startedAt?: Int64
}

export interface ListChainTriggerReply {
  total: number
  list: ChainTrigger[]
}

// ---------- ChainNode ----------

export interface ChainNodeInfo {
  id: number
  keyword: string
  name: string
  /** 所属分组；未分组时为空 */
  groupId?: number
  groupName?: string
  /** 分组排序（越大越靠前） */
  groupWeight?: number
  icon?: string
  /** 图标背景色（hex 如 #2563eb）；空 = 默认背景 */
  iconBg?: string
  description?: string
  status: boolean
  currentVersion: number
  currentVersionNo: number
  /** 生效版本的任务类型 */
  type?: 'api' | 'script'
  /** 生效版本的 spec JSON（ListChainNode withSpec=true 时返回） */
  spec?: string
  createdAt: number
  updatedAt: number
  /** 所属应用 */
  app: string
  /** 私有：仅所属应用与 apps 可用；false = 全局 */
  private: boolean
  /** 私有插件的授权应用（只对所属应用返回） */
  apps?: string[]
  /** 当前应用是否为所属应用：只有所属应用能改定义、发版、启停、删除 */
  owned: boolean
}

export interface GetChainNodeRequest {
  id: number
}

export interface GetChainNodeReply {
  node: ChainNodeInfo
}

export interface ListChainNodeRequest {
  page: number
  /** 上限 200 */
  pageSize: number
  keyword?: string
  name?: string
  /** 所属分组；0 / 不传 = 未分组 */
  groupId?: number
  status?: boolean
  withSpec?: boolean
}

export interface ListChainNodeReply {
  total: number
  list: ChainNodeInfo[]
}

export interface CreateChainNodeRequest {
  keyword: string
  name: string
  /** 所属分组；0 / 不传 = 未分组 */
  groupId?: number
  icon?: string
  /** 图标背景色（hex 如 #2563eb） */
  iconBg?: string
  description?: string
  /** 仅 manager 可设为 false（全局）；其他应用强制私有 */
  private?: boolean
  /** 私有插件的授权应用（仅 manager 可设置） */
  apps?: string[]
}

export interface CreateChainNodeReply {
  id: number
}

export interface UpdateChainNodeRequest {
  id: number
  name: string
  /** 所属分组；0 / 不传 = 未分组 */
  groupId?: number
  icon?: string
  /** 图标背景色（hex 如 #2563eb） */
  iconBg?: string
  description?: string
  /** 仅 manager 可设为 false（全局）；其他应用强制私有 */
  private?: boolean
  /** 私有插件的授权应用（仅 manager 可设置） */
  apps?: string[]
}

export interface DeleteChainNodeRequest {
  id: number
}

export interface UpdateChainNodeStatusRequest {
  id: number
  status: boolean
}

export interface ChainNodeVersion {
  id: number
  nodeId: number
  version: number
  type: 'api' | 'script'
  remark?: string
  current: boolean
  createdAt: number
}

export interface CreateChainNodeVersionRequest {
  nodeId: number
  spec: string
  remark?: string
  publish: boolean
}

export interface CreateChainNodeVersionReply {
  id: number
  version: number
}

export interface ListChainNodeVersionRequest {
  nodeId: number
  page: number
  pageSize: number
}

export interface ListChainNodeVersionReply {
  total: number
  list: ChainNodeVersion[]
}

/** 按 id，或按 keyword + version 查询 */
export interface GetChainNodeVersionRequest {
  id?: number
  keyword?: string
  version?: number
}

export interface GetChainNodeVersionReply {
  version: ChainNodeVersion
  keyword: string
  spec: string
}

export interface SwitchChainNodeVersionRequest {
  nodeId: number
  versionId: number
}

// ---------- ChainNodeGroup：插件分组（全平台共用，只有 manager 能维护） ----------

export interface ChainNodeGroupInfo {
  id: number
  name: string
  description?: string
  /** 排序（越大越靠前） */
  weight: number
  /** 组内插件数 */
  nodeCount: number
  createdAt: number
  updatedAt: number
}

export interface ListChainNodeGroupRequest {
  name?: string
}

export interface ListChainNodeGroupReply {
  list: ChainNodeGroupInfo[]
}

export interface CreateChainNodeGroupRequest {
  name: string
  description?: string
  weight: number
}

export interface UpdateChainNodeGroupRequest extends CreateChainNodeGroupRequest {
  id: number
}

// ---------- ChainBatch：批量执行（xlsx 上传、批次与行） ----------

/** 批次进度：preparing | pending | running | completed | canceled | failed */
export type ChainBatchStatus = 'preparing' | 'pending' | 'running' | 'completed' | 'canceled' | 'failed' | 'fail'
/** 行状态：pending | running | success | fail | canceled */
export type ChainBatchItemStatus = 'pending' | 'running' | 'success' | 'fail' | 'canceled'

export interface ChainBatchIssue {
  /** xlsx 数据行号（从 2 开始）；表头错误为 0 */
  row: number
  /** 字段路径（如 user.name） */
  field?: string
  /** 错误码（input_type / input_invalid / input_too_large ...） */
  code: string
  message: string
}

export interface ChainBatchInfo {
  id: number
  app: string
  chainId: number
  chainVersionId: number
  name?: string
  fileName: string
  rowCount: number
  maxConcurrent: number
  status: ChainBatchStatus
  successCount: number
  failCount: number
  canceledCount: number
  /** 执行中的行数（不含挂起） */
  runningCount: number
  /** 挂起的行数 */
  suspendedCount: number
  createdBy: string
  startedAt?: Int64
  finishedAt?: Int64
  createdAt: Int64
  updatedAt: Int64
}

export interface ChainBatchItemInfo {
  id: Int64
  batchId: number
  /** xlsx 数据行号（从 2 开始） */
  rowNo: number
  status: ChainBatchItemStatus
  runId?: string
  errorCode?: string
  errorMsg?: string
  startedAt?: Int64
  finishedAt?: Int64
  /** withInput=true 时返回 */
  input?: Record<string, any>
}

export interface GetChainBatchRequest {
  id: number
}

export interface GetChainBatchReply {
  batch: ChainBatchInfo
}

export interface ListChainBatchRequest {
  page: number
  pageSize: number
  chainId?: number
  status?: string
  name?: string
  /** 按所属应用筛选（仅 manager 生效） */
  filterApp?: string
}

export interface ListChainBatchReply {
  total: number
  list: ChainBatchInfo[]
}

export interface ListChainBatchItemRequest {
  page: number
  pageSize: number
  batchId: number
  status?: string
  rowNo?: number
  withInput?: boolean
}

export interface ListChainBatchItemReply {
  total: number
  list: ChainBatchItemInfo[]
}

export interface GetChainBatchItemRequest {
  batchId: number
  rowNo: number
}

export interface GetChainBatchItemReply {
  item: ChainBatchItemInfo
}

export interface RerunChainBatchItemRequest {
  batchId: number
  rowNo: number
}

export interface RerunChainBatchItemReply {
  runId: string
}

export interface CancelChainBatchRequest {
  id: number
}

/** 上传响应：valid=false 时带行级 issues */
export interface UploadChainBatchReply {
  valid: boolean
  /** true = 已接收，批次行正在后台写入 */
  accepted?: boolean
  id?: number
  total?: number
  issues?: ChainBatchIssue[]
}
