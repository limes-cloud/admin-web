export interface OAutherType {
  keyword: string
  name: string
}

export interface OAutherSettting {
  callback: string
}

export interface ListOAutherRequest {
  page: number
  pageSize: number
  order?: string
  orderBy?: string
  keyword?: string
  name?: string
  status?: boolean
  app?: string
}

export interface OAuther {
  id: number
  logo: string
  keyword: string
  name: string
  type: string
  status?: boolean
  ak?: string
  sk?: string
  setting?: OAutherSettting
  description?: string
  createdAt: number
  updatedAt: number
}

export interface ListOAutherReply {
  total: number
  list: OAuther[]
}

export interface CreateOAutherRequest {
  logo: string
  keyword: string
  name: string
  type: string
  ak?: string
  sk?: string
  setting?: OAutherSettting
  description?: string
}

export interface CreateOAutherReply {
  id: number
}

export interface UpdateOAutherRequest {
  id: number
  type?: string
  logo?: string
  keyword?: string
  name?: string
  ak?: string
  sk?: string
  setting?: OAutherSettting
  status?: boolean
  description?: string
}

export interface DeleteOAutherRequest {
  id: number
}

export interface DeleteOAutherReply {
  total: number
}
