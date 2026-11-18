export type GatewayActionType =
  | 'HOST_SET'
  | 'PATH_SET'
  | 'PATH_PREFIX_ADD'
  | 'PATH_PREFIX_TRIM'
  | 'PATH_REGEX_REPLACE'
  | 'RAW_QUERY_ADD'
  | 'RAW_QUERY_RENAME'
  | 'RAW_QUERY_DEL'
  | 'RAW_QUERY_DEL_ALL_EXCEPT'
  | 'RAW_QUERY_CLEAR'
  | 'REQUEST_HEADER_SET'
  | 'REQUEST_HEADER_ADD'
  | 'REQUEST_HEADER_DEL'
  | 'RESPONSE_HEADER_SET'
  | 'RESPONSE_HEADER_ADD'
  | 'RESPONSE_HEADER_DEL'
  | 'REDIRECT'

export interface GatewayAction {
  type: GatewayActionType
  params: Record<string, any>
}

export interface Match {
  expression: string
  terminal?: boolean
}

export interface RewriteRule {
  name: string
  priority: number
  match: Match
  actions: GatewayAction[]
}

export interface Backend {
  target: string
  weight?: number | null
}

export interface GatewayMiddleware {
  name: string
  options?: Record<string, any> | null
  required?: boolean
}

export interface RetryCondition {
  statusCode?: string
  header?: { name: string; value: string }
}

export interface Retry {
  count: number
  timeoutMs?: number
  conditions?: RetryCondition[]
}

export interface HeaderPolicy {
  set?: Record<string, string> | null
  add?: Record<string, string> | null
  remove?: string[] | null
}

export interface Upstream {
  protocol: string
  timeoutMs: number
  backends: Backend[]
  retry?: Retry | null
}

export interface GatewayResponse {
  format: boolean
  headers: HeaderPolicy
}

export interface GatewayRoute {
  id: number
  name: string
  description: string
  enabled: boolean
  priority: number
  match: Match
  rewrites: RewriteRule[]
  upstream: Upstream
  response: GatewayResponse
  middlewares: GatewayMiddleware[]
  metadata: Record<string, string> | null
  createdAt: number
  updatedAt: number
}

export type SaveRouteRequest = Omit<GatewayRoute, 'id' | 'createdAt' | 'updatedAt'>

export interface ListRouteRequest {
  page: number
  size: number
  keyword?: string
  enabled?: string
}

export interface PublishRequest {
  remark: string
}

export interface RollbackRequest {
  version: number
  remark: string
}

export interface HistoryItem {
  version: number
  operator: string
  remark: string
  createdAt: number
}

export interface Paginated<T> {
  total: number
  list: T[]
}
