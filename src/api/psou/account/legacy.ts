import request from '@/utils/http'

export interface LegacyAccountExt {
  lastCheckAt?: number
  limitedAt?: number
  limitErrno?: string
  limitOp?: string
  nextCheckAt?: number
  enableTransfer?: boolean
}

export interface LegacyAccount {
  id: number
  platform: string
  name: string
  cookie: string
  defaultDir: string
  status: number
  priority: number
  remark?: string
  ext: string
  createdAt: number
  updatedAt: number
  storageTotal: number
  storageUsed: number
}

export interface LegacyListAccountRequest {
  page: number
  pageSize: number
  orderBy?: string
  order?: string
  platform?: string
  status?: number
}

export interface LegacyListAccountReply {
  list: LegacyAccount[]
  total: number
}

export interface LegacyCreateAccountRequest {
  platform: string
  name?: string
  cookie: string
  defaultDir?: string
  priority?: number
  remark?: string
}

export interface LegacyCreateAccountReply {
  id: number
}

export interface LegacyUpdateAccountRequest {
  accountId: number
  name: string
  cookie: string
  defaultDir?: string
  status?: number
  priority?: number
  remark?: string
}

export interface LegacyDeleteAccountRequest {
  accountId: number
}

export interface LegacyCheckAccountRequest {
  accountId: number
}

export interface LegacyRecoverAccountRequest {
  accountId: number
}

// ListLegacyAccounts 获取旧在线服务网盘账号列表。
export function ListLegacyAccounts(params: LegacyListAccountRequest) {
  return request.get<LegacyListAccountReply>({ url: '/psou/api/accounts', params })
}

// CreateLegacyAccount 创建旧在线服务网盘账号。
export function CreateLegacyAccount(data: LegacyCreateAccountRequest) {
  return request.post<LegacyCreateAccountReply>({ url: '/psou/api/accounts', data })
}

// UpdateLegacyAccount 更新旧在线服务网盘账号。
export function UpdateLegacyAccount(data: LegacyUpdateAccountRequest) {
  return request.put({ url: '/psou/api/accounts', data })
}

// DeleteLegacyAccount 删除旧在线服务网盘账号。
export function DeleteLegacyAccount(params: LegacyDeleteAccountRequest) {
  return request.del({ url: '/psou/api/accounts', params })
}

// CheckLegacyAccount 检测旧在线服务网盘账号登录态。
export function CheckLegacyAccount(data: LegacyCheckAccountRequest) {
  return request.post({ url: '/psou/api/accounts/check', data })
}

// RecoverLegacyAccount 恢复旧在线服务网盘账号限流状态。
export function RecoverLegacyAccount(data: LegacyRecoverAccountRequest) {
  return request.post({ url: '/psou/api/accounts/recover', data })
}
