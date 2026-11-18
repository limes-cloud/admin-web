// 调度链页面常量

import type { ChainNodeStatus, ChainRunStatus } from '@/api/cron/chain/type'
import type { ControlType, FieldType, NodeMode, Operator, TaskType } from '../types/dsl'

/** 节点 id 规则（与后端一致） */
export const NODE_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/

/** 节点库拖入画布的 dataTransfer 类型 */
export const DRAG_MIME = 'application/x-chain-node'

/** 节点数上限 */
export const MAX_NODES = 200

/** 边数上限 */
export const MAX_EDGES = 500

/** outputName 保留字 */
export const RESERVED_OUTPUT_NAMES = ['request', 'run', 'trigger', 'input', 'param', 'config']

/** 重试策略可用的错误名（23-错误名与重试），Chain.ALL 只能单独出现在最后一个策略 */
export const ERROR_NAMES = [
  'Chain.Timeout',
  'Chain.Network',
  'Chain.Http5xx',
  'Chain.Http4xx',
  'Chain.RateLimited',
  'Chain.Business',
  'Chain.Script',
  'Chain.File',
  'Chain.ALL'
]

/** 轮询间隔：有节点在执行（executing=true） */
export const POLL_EXECUTING_MS = 3000

/** 轮询间隔：运行中但无节点在执行（只剩被动节点待触发） */
export const POLL_WAITING_MS = 15000

/** 校验防抖 */
export const VALIDATE_DEBOUNCE_MS = 500

/** 草稿防抖 */
export const DRAFT_DEBOUNCE_MS = 2000

/** 节点卡片宽度（布局与组件共用） */
export const NODE_WIDTH = 360

/** 节点卡片标题栏高度：输入端口对齐标题栏中线 */
export const NODE_HEAD_HEIGHT = 48

/** 卡片内一行字段的高度与行距（布局估算用，实际高度由内容撑开） */
export const NODE_FIELD_HEIGHT = 22
export const NODE_FIELD_GAP = 6

/** 分支器每个分支的条件框：首行高度与追加条件的行高 */
export const BRANCH_BOX_HEIGHT = 32
export const BRANCH_COND_HEIGHT = 22

/** 节点类型主题色（参考 Coze 节点配色），用于图标底色 */
export const NODE_COLOR = {
  start: '#2BB673',
  end: '#2BB673',
  selector: '#FF811A',
  script: '#4096FF',
  api: '#14B8C8',
  chain: '#7C3AED',
  plugin: '#14B8C8',
  trigger: '#F0567E'
} as const

/** 新建脚本节点的默认代码 */
export const SCRIPT_TEMPLATE = `function handler(ctx, input) {

}
`

/** 分支器"否则"端口 */
export const PORT_DEFAULT = 'default'

/** 控制节点的展示名 */
export const CONTROL_LABEL: Record<ControlType, string> = {
  start: '开始',
  end: '结束',
  selector: '分支器',
  loop: '循环'
}

/** 分支条件运算符：展示名与是否需要比较值，对齐后端 chain/selector.go */
export const OPERATORS: { value: Operator; label: string; right: boolean }[] = [
  { value: 'eq', label: '等于', right: true },
  { value: 'ne', label: '不等于', right: true },
  { value: 'gt', label: '大于', right: true },
  { value: 'gte', label: '大于等于', right: true },
  { value: 'lt', label: '小于', right: true },
  { value: 'lte', label: '小于等于', right: true },
  { value: 'len_gt', label: '长度大于', right: true },
  { value: 'len_gte', label: '长度大于等于', right: true },
  { value: 'len_lt', label: '长度小于', right: true },
  { value: 'len_lte', label: '长度小于等于', right: true },
  { value: 'contain', label: '包含', right: true },
  { value: 'not_contain', label: '不包含', right: true },
  { value: 'contain_key', label: '包含键', right: true },
  { value: 'not_contain_key', label: '不包含键', right: true },
  { value: 'empty', label: '为空', right: false },
  { value: 'not_empty', label: '不为空', right: false },
  { value: 'true', label: '为真', right: false },
  { value: 'false', label: '为假', right: false }
]

/** 分支数与单分支条件数上限（与后端一致） */
export const MAX_BRANCHES = 20
export const MAX_CONDITIONS = 20

export const MODE_LABEL: Record<NodeMode, string> = {
  auto: '自动执行',
  trigger: '被动触发'
}

export const TYPE_LABEL: Record<TaskType, string> = {
  api: 'API',
  script: '脚本',
  chain: '流程'
}

type TagType = 'primary' | 'success' | 'info' | 'warning' | 'danger'

export const RUN_STATUS: Record<ChainRunStatus, { label: string; type: TagType }> = {
  running: { label: '运行中', type: 'primary' },
  suspended: { label: '挂起', type: 'warning' },
  success: { label: '成功', type: 'success' },
  fail: { label: '失败', type: 'danger' },
  break: { label: '中断', type: 'info' },
  abandoned: { label: '已作废', type: 'info' }
}

export const RUN_TERMINAL: ChainRunStatus[] = ['success', 'fail', 'break', 'abandoned']

export const NODE_STATUS: Record<ChainNodeStatus, { label: string; type: TagType }> = {
  pending: { label: '未开始', type: 'info' },
  ready: { label: '排队中', type: 'primary' },
  running: { label: '执行中', type: 'primary' },
  success: { label: '成功', type: 'success' },
  ignored: { label: '已忽略', type: 'warning' },
  skipped: { label: '已跳过', type: 'info' },
  bypassed: { label: '条件跳过', type: 'info' },
  fail: { label: '失败', type: 'danger' },
  canceled: { label: '已取消', type: 'info' }
}

/** 已完成（恢复时不再调度）的节点状态 */
export const NODE_DONE: ChainNodeStatus[] = ['success', 'ignored', 'skipped', 'bypassed']

export const FIELD_TYPES: FieldType[] = ['string', 'number', 'integer', 'boolean', 'object', 'array', 'any']

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

/** 响应格式：json 解析为对象（非 JSON 时为原文），text 保留原文 */
export const BODY_TYPES = ['json', 'text']

/** 请求格式（multipart 支持文件上传） */
export const REQUEST_TYPES = ['json', 'form', 'text', 'multipart']

/** 模板节点不允许直接配置的字段（由模板提供） */
export const TEMPLATE_FORBIDDEN_FIELDS = [
  'type',
  'method',
  'url',
  'header',
  'requestType',
  'responseType',
  'files',
  'responseCondition',
  'errorMsg',
  'code',
  'output'
] as const

/** 节点单次超时上限（秒） */
export const DEFAULT_MAX_TIMEOUT = 300

export const RUN_ORIGIN_LABEL: Record<string, string> = {
  open: '开放接口',
  debug: '测试执行'
}
