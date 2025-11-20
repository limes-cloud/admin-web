export interface GetTenantRequest {
  id: number
}

export interface ListTenantRequest {
  page: number
  pageSize: number
  order?: string
  orderBy?: string
  keyword?: string
  name?: string
  status?: boolean
}

export interface TenantSetting {
  defaultNickname: string
  defaultUserAvatar: string
  defaultUserPassword: string
}

export interface Tenant {
  id: number
  logo: string
  keyword: string
  name: string
  status?: boolean
  description?: string
  weight: number
  setting?: TenantSetting
  createdAt: number
  updatedAt: number
}

export interface ListTenantReply {
  total: number
  list: Tenant[]
}

export interface CreateTenantRequest {
  logo: string
  favicon: string
  name: string
  status?: boolean
  description?: string
  weight: number
  setting: TenantSetting
}

export interface CreateTenantReply {
  id: number
}

export interface UpdateTenantRequest {
  id: number
  keyword?: string
  name?: string
  status?: boolean
  description?: string
  weight?: number
  setting?: TenantSetting
}

export interface DeleteTenantRequest {
  id: number
}
