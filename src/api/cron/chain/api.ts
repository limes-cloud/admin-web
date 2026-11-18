import request from '@/utils/http'
import type {
  GetChainRequest,
  GetChainReply,
  ListChainRequest,
  ListChainReply,
  CreateChainRequest,
  CreateChainReply,
  UpdateChainRequest,
  DeleteChainRequest,
  UpdateChainStatusRequest,
  CreateChainVersionRequest,
  CreateChainVersionReply,
  ListChainVersionRequest,
  ListChainVersionReply,
  GetChainVersionRequest,
  GetChainVersionReply,
  SwitchChainVersionRequest,
  ValidateChainRuleRequest,
  ValidateChainRuleReply,
  DebugRunChainRequest,
  TestChainNodeRequest,
  TestChainNodeReply,
  RunChainReply,
  GetChainRunRequest,
  GetChainRunReply,
  ListChainRunRequest,
  ListChainRunReply,
  GetChainRunGraphRequest,
  GetChainRunGraphReply,
  ListChainRunNodeRequest,
  ListChainRunNodeReply,
  GetChainRunContextRequest,
  GetChainRunContextReply,
  AbandonChainRunRequest,
  TriggerChainRunNodeRequest,
  TriggerChainRunNodeReply,
  ListChainTriggerRequest,
  ListChainTriggerReply,
  GetChainNodeRequest,
  GetChainNodeReply,
  ListChainNodeRequest,
  ListChainNodeReply,
  CreateChainNodeRequest,
  CreateChainNodeReply,
  UpdateChainNodeRequest,
  DeleteChainNodeRequest,
  UpdateChainNodeStatusRequest,
  CreateChainNodeVersionRequest,
  CreateChainNodeVersionReply,
  ListChainNodeVersionRequest,
  ListChainNodeVersionReply,
  GetChainNodeVersionRequest,
  GetChainNodeVersionReply,
  SwitchChainNodeVersionRequest,
  ListChainNodeGroupRequest,
  ListChainNodeGroupReply,
  CreateChainNodeGroupRequest,
  UpdateChainNodeGroupRequest,
  // ---------- ChainBatch ----------
  UploadChainBatchReply,
  GetChainBatchRequest,
  GetChainBatchReply,
  ListChainBatchRequest,
  ListChainBatchReply,
  ListChainBatchItemRequest,
  ListChainBatchItemReply,
  GetChainBatchItemRequest,
  GetChainBatchItemReply,
  RerunChainBatchItemRequest,
  RerunChainBatchItemReply,
  CancelChainBatchRequest
} from './type'

// ---------- Chain ----------

export function GetChain(params: GetChainRequest) {
  return request.get<GetChainReply>({ url: '/cron/api/v1/chain', params })
}

export function ListChain(params: ListChainRequest) {
  return request.get<ListChainReply>({ url: '/cron/api/v1/chains', params })
}

export function CreateChain(data: CreateChainRequest) {
  return request.post<CreateChainReply>({ url: '/cron/api/v1/chain', data })
}

export function UpdateChain(data: UpdateChainRequest) {
  return request.put({ url: '/cron/api/v1/chain', data })
}

export function DeleteChain(params: DeleteChainRequest) {
  return request.del({ url: '/cron/api/v1/chain', params })
}

export function UpdateChainStatus(data: UpdateChainStatusRequest) {
  return request.put({ url: '/cron/api/v1/chain/status', data })
}

export function CreateChainVersion(data: CreateChainVersionRequest) {
  return request.post<CreateChainVersionReply>({ url: '/cron/api/v1/chain_version', data })
}

export function ListChainVersion(params: ListChainVersionRequest) {
  return request.get<ListChainVersionReply>({ url: '/cron/api/v1/chain_versions', params })
}

export function GetChainVersion(params: GetChainVersionRequest) {
  return request.get<GetChainVersionReply>({ url: '/cron/api/v1/chain_version', params })
}

export function SwitchChainVersion(data: SwitchChainVersionRequest) {
  return request.put({ url: '/cron/api/v1/chain_version/switch', data })
}

/** 编辑器实时校验：防抖高频调用，失败不弹全局错误提示 */
export function ValidateChainRule(data: ValidateChainRuleRequest) {
  return request.post<ValidateChainRuleReply>({
    url: '/cron/api/v1/chain/rule/validate',
    data,
    showErrorMessage: false
  })
}

// ---------- ChainRun ----------

export function DebugRunChain(data: DebugRunChainRequest) {
  return request.post<RunChainReply>({ url: '/cron/api/v1/chain_run', data })
}

export function TestChainNode(data: TestChainNodeRequest) {
  return request.post<TestChainNodeReply>({ url: '/cron/api/v1/chain_run/node', data })
}

/** 插件页测试插件定义（与 TestChainNode 同一实现，权限独立） */
export function TestChainNodeVersion(data: TestChainNodeRequest) {
  return request.post<TestChainNodeReply>({ url: '/cron/api/v1/chain_node_version/test', data })
}

export function GetChainRun(params: GetChainRunRequest) {
  return request.get<GetChainRunReply>({ url: '/cron/api/v1/chain_run', params })
}

export function ListChainRun(params: ListChainRunRequest) {
  return request.get<ListChainRunReply>({ url: '/cron/api/v1/chain_runs', params })
}

/** 运行回显（轮询），轮询失败不弹全局错误提示 */
export function GetChainRunGraph(params: GetChainRunGraphRequest, showErrorMessage = true) {
  return request.get<GetChainRunGraphReply>({ url: '/cron/api/v1/chain_run/graph', params, showErrorMessage })
}

export function ListChainRunNode(params: ListChainRunNodeRequest) {
  return request.get<ListChainRunNodeReply>({ url: '/cron/api/v1/chain_run/nodes', params })
}

export function GetChainRunContext(params: GetChainRunContextRequest) {
  return request.get<GetChainRunContextReply>({ url: '/cron/api/v1/chain_run/context', params })
}

export function AbandonChainRun(data: AbandonChainRunRequest) {
  return request.post({ url: '/cron/api/v1/chain_run/abandon', data })
}

/** 手动触发被动节点：ChainTriggerError 由调用方给出专门提示，不弹全局错误 */
export function TriggerChainRunNode(data: TriggerChainRunNodeRequest) {
  return request.post<TriggerChainRunNodeReply>({
    url: '/cron/api/v1/chain_run/trigger',
    data,
    showErrorMessage: false
  })
}

export function ListChainTrigger(params: ListChainTriggerRequest) {
  return request.get<ListChainTriggerReply>({ url: '/cron/api/v1/chain_triggers', params })
}

// ---------- ChainNode ----------

export function GetChainNode(params: GetChainNodeRequest) {
  return request.get<GetChainNodeReply>({ url: '/cron/api/v1/chain_node', params })
}

export function ListChainNode(params: ListChainNodeRequest, showErrorMessage = true) {
  return request.get<ListChainNodeReply>({ url: '/cron/api/v1/chain_nodes', params, showErrorMessage })
}

export function CreateChainNode(data: CreateChainNodeRequest) {
  return request.post<CreateChainNodeReply>({ url: '/cron/api/v1/chain_node', data })
}

export function UpdateChainNode(data: UpdateChainNodeRequest) {
  return request.put({ url: '/cron/api/v1/chain_node', data })
}

export function DeleteChainNode(params: DeleteChainNodeRequest) {
  return request.del({ url: '/cron/api/v1/chain_node', params })
}

export function UpdateChainNodeStatus(data: UpdateChainNodeStatusRequest) {
  return request.put({ url: '/cron/api/v1/chain_node/status', data })
}

export function CreateChainNodeVersion(data: CreateChainNodeVersionRequest) {
  return request.post<CreateChainNodeVersionReply>({ url: '/cron/api/v1/chain_node_version', data })
}

export function ListChainNodeVersion(params: ListChainNodeVersionRequest) {
  return request.get<ListChainNodeVersionReply>({ url: '/cron/api/v1/chain_node_versions', params })
}

/** 编辑器按节点固定版本取 spec 时不弹全局错误 */
export function GetChainNodeVersion(params: GetChainNodeVersionRequest, showErrorMessage = true) {
  return request.get<GetChainNodeVersionReply>({
    url: '/cron/api/v1/chain_node_version',
    params,
    showErrorMessage
  })
}

export function SwitchChainNodeVersion(data: SwitchChainNodeVersionRequest) {
  return request.put({ url: '/cron/api/v1/chain_node_version/switch', data })
}

// ---------- ChainNodeGroup ----------

export function ListChainNodeGroup(params: ListChainNodeGroupRequest = {}, showErrorMessage = true) {
  return request.get<ListChainNodeGroupReply>({ url: '/cron/api/v1/chain_node_groups', params, showErrorMessage })
}

export function CreateChainNodeGroup(data: CreateChainNodeGroupRequest) {
  return request.post<{ id: number }>({ url: '/cron/api/v1/chain_node_group', data })
}

export function UpdateChainNodeGroup(data: UpdateChainNodeGroupRequest) {
  return request.put({ url: '/cron/api/v1/chain_node_group', data })
}

export function DeleteChainNodeGroup(params: { id: number }) {
  return request.del({ url: '/cron/api/v1/chain_node_group', params })
}

// ---------- ChainBatch：批量执行 ----------

/** 上传 xlsx 创建批量（multipart）：校验通过后返回 202，行数据后台分段写入；校验失败返回行级 issues */
export function UploadChainBatch(data: FormData) {
  return request.post<UploadChainBatchReply>({
    url: '/cron/api/v1/chain_batch/upload',
    data,
    timeout: 5 * 60 * 1000
  })
}

export function GetChainBatch(params: GetChainBatchRequest) {
  return request.get<GetChainBatchReply>({ url: '/cron/api/v1/chain_batch', params })
}

export function ListChainBatch(params: ListChainBatchRequest) {
  return request.get<ListChainBatchReply>({ url: '/cron/api/v1/chain_batches', params })
}

export function ListChainBatchItem(params: ListChainBatchItemRequest) {
  return request.get<ListChainBatchItemReply>({ url: '/cron/api/v1/chain_batch/items', params })
}

export function GetChainBatchItem(params: GetChainBatchItemRequest) {
  return request.get<GetChainBatchItemReply>({ url: '/cron/api/v1/chain_batch/item', params })
}

export function RerunChainBatchItem(data: RerunChainBatchItemRequest) {
  return request.post<RerunChainBatchItemReply>({ url: '/cron/api/v1/chain_batch/item/rerun', data })
}

export function CancelChainBatch(data: CancelChainBatchRequest) {
  return request.post({ url: '/cron/api/v1/chain_batch/cancel', data })
}
