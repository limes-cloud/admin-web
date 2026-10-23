export interface DistributeChannel {
  code: string
  name: string
  status: number
  sort: number
}

export interface DistributeAccountExt {
  lastCheckAt?: number
  limitedAt?: number
  limitErrno?: string
  nextCheckAt?: number
  banDays?: number
  lastRemainQuota?: number
  lastCheckError?: string
}

export interface DistributeAccount {
  id: number
  channelCode: string
  panAccountId?: number | null
  panAccountName?: string | null
  name: string
  uid?: string | null
  hasToken: boolean
  status: number
  reason?: string | null
  priority: number
  quota?: number | null
  ext: string
  remark?: string | null
  createdAt: number
  updatedAt: number
}

export interface ListDistributeChannelsRequest {
  onlyEnabled?: boolean
}

export interface ListDistributeChannelsReply {
  list: DistributeChannel[]
}

export interface ListDistributeAccountRequest {
  page: number
  pageSize: number
  orderBy?: string
  order?: string
  channelCode?: string
  status?: number
  name?: string
}

export interface ListDistributeAccountReply {
  list: DistributeAccount[]
  total: number
}

export interface CreateDistributeAccountRequest {
  channelCode: string
  panAccountId?: number
  name: string
  uid?: string
  token?: string
  status?: number
  reason?: string
  priority?: number
  quota?: number
  remark?: string
}

export interface CreateDistributeAccountReply {
  id: number
}

export interface UpdateDistributeAccountRequest {
  id: number
  channelCode?: string
  panAccountId?: number
  name?: string
  uid?: string
  token?: string
  status?: number
  reason?: string
  priority?: number
  quota?: number
  remark?: string
}

export interface DeleteDistributeAccountRequest {
  id: number
}

export interface CheckDistributeAccountRequest {
  id: number
}

export interface CheckDistributeAccountReply {
  valid: boolean
  hasPermission: boolean
  isBanned: boolean
  remainingQuota: number
  status: number
  reason?: string | null
  checkedAt: number
}
