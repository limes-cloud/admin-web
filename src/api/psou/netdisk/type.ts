export interface NetdiskFile {
  name: string
  isDir: boolean
  size: number
  children?: NetdiskFile[]
}

export interface Netdisk {
  id: number
  userId: number
  accountId: number
  fsId: string
  resourceId: number
  platform: string
  shareUrl: string
  sourceUrl: string
  size: number
  formatSummary: string
  fileCount: number
  status: number
  lastCheckedAt: number
  files: NetdiskFile[]
  createdAt: number
  updatedAt: number
}

export interface GetNetdiskRequest {
  id: number
}

export interface GetNetdiskReply {
  netdisk: Netdisk
}

export interface ListNetdiskRequest {
  page: number
  pageSize: number
  orderBy?: string
  order?: string
  resourceId?: number
  platform?: string
  status?: number
}

export interface ListNetdiskReply {
  list: Netdisk[]
  total: number
}

export interface CreateNetdiskRequest {
  resourceId: number
  userId: number
  accountId: number
  fsId: string
  platform: string
  shareUrl: string
  sourceUrl: string
  size: number
  formatSummary?: string
  fileCount?: number
  files?: NetdiskFile[]
}

export interface CreateNetdiskReply {
  id: number
}

export interface UpdateNetdiskRequest extends Omit<CreateNetdiskRequest, 'resourceId' | 'platform'> {
  id: number
}

export interface DeleteNetdiskRequest {
  id: number
}

export interface UpdateNetdiskStatusRequest {
  id: number
  status: number
}
