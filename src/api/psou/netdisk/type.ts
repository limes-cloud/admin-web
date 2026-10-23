export interface Netdisk {
  id: number
  userId: number
  accountId: number
  fsId: string
  resourceId: number
  platform: string
  shareUrl: string
  fromUrl: string
  size: number
  formatText: string
  folderCount: number
  fileCount: number
  status: number
  lastCheckedAt: number
  checkFailCount: number
  sort: number
  ext: string
  createdAt: number
  updatedAt: number
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
  userId?: number
  accountId?: number
  fsId?: string
  platform: string
  shareUrl: string
  fromUrl?: string
  size?: number
  formatText?: string
  folderCount?: number
  fileCount?: number
  sort?: number
  ext?: string
}

export interface CreateNetdiskReply {
  id: number
}

export interface UpdateNetdiskRequest extends CreateNetdiskRequest {
  id: number
}

export interface DeleteNetdiskRequest {
  id: number
}

export interface UpdateNetdiskStatusRequest {
  id: number
  status: number
}
