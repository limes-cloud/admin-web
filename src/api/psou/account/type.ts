export interface AccountExt {
  lastCheckAt?: number
  limitedAt?: number
  limitErrno?: string
  limitOp?: string
  nextCheckAt?: number
  enableTransfer?: boolean
}

export interface Account {
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

export interface ListAccountRequest {
  page: number
  pageSize: number
  orderBy?: string
  order?: string
  platform?: string
  status?: number
}

export interface ListAccountReply {
  list: Account[]
  total: number
}

export interface CreateAccountRequest {
  platform: string
  name?: string
  cookie: string
  defaultDir?: string
  priority?: number
  remark?: string
}

export interface CreateAccountReply {
  id: number
}

export interface UpdateAccountRequest {
  accountId: number
  name: string
  cookie: string
  defaultDir?: string
  status?: number
  priority?: number
  remark?: string
}

export interface DeleteAccountRequest {
  accountId: number
}

export interface CheckAccountRequest {
  accountId: number
}

export interface RecoverAccountRequest {
  accountId: number
}
