export type HermesSKStatus = 'enabled' | 'disabled'

export interface HermesSK {
  sk: string
  status: HermesSKStatus
  maxBindCount: number
  maxSearchCount: number
  maxTransferCount: number
  expiresAt: number
  createdAt: number
  expired: boolean
  activeDeviceCount: number
  searchUsedToday: number
  transferUsedToday: number
}

export interface HermesSKListRequest {
  page: number
  pageSize: number
  sk?: string
  status?: HermesSKStatus | ''
}

export interface HermesSKListReply {
  list: HermesSK[]
  total: number
}

export interface HermesSKCreateRequest {
  maxBindCount: number
  maxSearchCount: number
  maxTransferCount: number
  expiresAt: number
}

export interface HermesSKStatusRequest {
  sk: string
  status: HermesSKStatus
}

export interface HermesDevice {
  deviceId: string
  deviceName: string
  os: string
  arch: string
  appVersion: string
  createdAt: number
  lastSeenAt: number
  revokedAt: number
}

export interface HermesDeviceListReply {
  list: HermesDevice[]
}

export interface HermesDeviceRevokeRequest {
  sk: string
  deviceId: string
}

export interface HermesTransfer {
  id: number
  sk: string
  keyword: string
  accountId: number
  transferId: string
  expiresAt: number
  status: number
  statusText: string
  failReason: string
  createdAt: number
  updatedAt: number
}

// sk 为空时查询当前应用下全部转存记录。
export interface HermesTransferListRequest {
  sk?: string
  page: number
  pageSize: number
}

export interface HermesTransferListReply {
  list: HermesTransfer[]
  total: number
}
