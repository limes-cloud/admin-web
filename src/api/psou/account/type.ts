export type AccountStatus = -1 | 0 | 1

export type UInt64Value = number | string

export type AccountRouteKey = 'fixed' | 'transfer' | 'search' | 'manual'

export interface AccountDailyStat {
  date: string
  count: number
  limit: number
}

export interface AccountRouteExt {
  transferDir?: string
  dailyTransfer?: AccountDailyStat
  dailyShare?: AccountDailyStat
}

export interface AccountExt {
  lastCheckAt?: number
  limitedAt?: number
  limitOp?: string
  isVip?: boolean
  isUnzipAccount?: boolean
  unzipDir?: string
  fixed?: AccountRouteExt
  transfer?: AccountRouteExt
  search?: AccountRouteExt
  manual?: AccountRouteExt
}

export interface Account {
  id: UInt64Value
  platform: string
  name: string
  userId?: UInt64Value | null
  status: AccountStatus
  priority: number
  errorCode?: string | null
  storageTotal?: string | null
  storageUsed?: string | null
  remark?: string | null
  ext: AccountExt
  createdAt: number
  updatedAt: number
}

export interface AccountRouteConfig {
  transferDir?: string
  dailyTransferLimit?: number // -1 不限，0 不参与，正数为每日上限
  dailyShareLimit?: number // -1 不限，0 不参与，正数为每日上限
}

export type AccountConfig = Partial<Record<AccountRouteKey, AccountRouteConfig>>

export interface ListAccountRequest {
  page: number
  pageSize: number
  platform?: string
  status?: AccountStatus
  keyword?: string
  isVip?: boolean
  orderBy?: 'priority' | 'storageUsed' | 'createdAt'
  order?: 'asc' | 'desc'
}

export interface ListAccountReply {
  list: Account[]
  total: number
}

export interface GetAccountRequest {
  accountId: UInt64Value
}

export interface GetAccountReply {
  account: Account
}

export interface CreateAccountRequest {
  platform: string
  name?: string
  userId?: UInt64Value
  token?: string
  qrTicket?: string
  priority?: number
  remark?: string
  config?: AccountConfig
}

export interface CreateAccountReply {
  id: number
}

export interface UpdateAccountRequest {
  accountId: UInt64Value
  name?: string
  userId?: UInt64Value
  token?: string
  qrTicket?: string
  status?: AccountStatus
  priority?: number
  remark?: string
  config?: AccountConfig
  isUnzipAccount?: boolean
  unzipDir?: string
}

export interface DeleteAccountRequest {
  accountId: UInt64Value
}

export interface ProbeAccountRequest {
  accountId: UInt64Value
}

export interface ProbeAndRecoverAccountRequest {
  accountId: UInt64Value
}

export interface RefreshAccountStorageRequest {
  accountId: UInt64Value
}

export interface CreateAccountQRSessionRequest {
  platform: string
}

export interface CreateAccountQRSessionReply {
  sessionId: string
  image: string
  expiresAt: number
}

export type AccountQRState = 'pending' | 'scanned' | 'confirmed' | 'expired' | 'failed'

export interface GetAccountQRSessionRequest {
  sessionId: string
}

export interface GetAccountQRSessionReply {
  state: AccountQRState
  qrTicket?: string
  accountName?: string
}

export interface AccountFileItem {
  fsId: string
  name: string
  path: string
  isDir: boolean
  size: number
  updatedAt: number
}

export interface ListAccountFileRequest {
  accountId: UInt64Value
  dirRef?: string
  page: number
  pageSize: number
}

export interface ListAccountFileReply {
  list: AccountFileItem[]
  total: number
}

export interface CreateAccountDirRequest {
  accountId: UInt64Value
  dirRef?: string
  name?: string
  path?: string
}

export interface CreateAccountDirReply {
  id: string
  path?: string
}

export interface RenameAccountFileInput {
  fsId: string
  dirRef?: string
  path?: string
  name: string
}

export interface RenameAccountFileRequest {
  accountId: UInt64Value
  file: RenameAccountFileInput
}

export interface MoveAccountFileInput {
  newPath: string
  fsId: string
}

export interface MoveAccountFileRequest {
  accountId: UInt64Value
  targetPath: string
  files: MoveAccountFileInput[]
  // 本次调用允许的最大文件数，服务端默认 5000；超过直接拒绝
  maxItems?: number
}

export interface MovedAccountFile {
  newPath: string
  size: number
  fsId: string
}

export interface MoveAccountFileReply {
  files: MovedAccountFile[]
}

export interface ShareAccountFileInput {
  fsId?: string
  path?: string
}

export interface ShareAccountFileRequest {
  accountId: UInt64Value
  files: ShareAccountFileInput[]
  title?: string
  periodDays?: 0 | 1 | 7 | 30
  password?: string
  commandWord?: string
}

export interface ShareAccountFileReply {
  shareUrl: string
  title: string
  fsIds?: string[]
  paths?: string[]
  password?: string
  commandWord?: string
}

export interface GetAccountShareStatsRequest {
  accountId: UInt64Value
  shareUrl: string
}

export interface GetAccountShareStatsReply {
  shareId: string
  shareUrl: string
  viewCount: number | string
  downloadCount: number | string
  saveCount: number | string
}

export interface DeleteAccountFileRequest {
  accountId: UInt64Value
  fsId?: string
  dirRef?: string
  path?: string
}

export interface UnzipAccountFileRequest {
  accountId: UInt64Value
  fsId: string
  dirRef?: string
  path?: string
  name: string
  outputPath?: string
  dirEntries?: boolean
}

export interface UnzipAccountFileReply {
  taskId: string
  outputPath: string
  files?: UnzippedAccountFile[]
}

export interface UnzippedAccountFile {
  path: string
  size: number
  fsId: string
  isDir?: boolean
}

export interface UploadAccountFileReply {
  id: string
  name: string
}

export interface QuickTransferAccountFileRequest {
  accountId: UInt64Value
  dirRef: string
  shareUrl: string
  password?: string
}

export interface QuickTransferAccountFileReply {
  size: number
  fileCount: number
  folderCount: number
}
