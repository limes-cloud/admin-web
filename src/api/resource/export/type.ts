export interface GetExportRequest {
  id?: number
  sha?: string
}

export interface GetExportReply {
  id: number
  userId: number
  scene: string
  name: string
  size: number
  sha?: string
  src?: string
  url?: string
  status: string
  reason?: string
  expiredAt: number
  createdAt: number
  updatedAt: number
}

export interface ListExportRequest {
  page: number
  pageSize: number
  order?: string
  orderBy?: string
  name?: string
  userId?: number
  DeptId?: number
}

export interface Export {
  id: number
  userId: number
  scene: string
  name: string
  size: number
  key?: string
  sha?: string
  src?: string
  url?: string
  status: string
  reason?: string
  expiredAt: number
  createdAt: number
  updatedAt: number
}

export interface ListExportReply {
  total: number
  list: Export[]
}

export interface ExportFileRequest {
  userId: number
  scene: string
  name: string
  keys: string[]
}

export interface ExportFileReply {
  id: number
  sha: string
  src: string
}

export interface UpdateExportRequest {
  id: number
  userId: number
  scene: string
}

export interface DeleteExportRequest {
  id: number
}

export interface DeleteExportReply {
  total: number
}
