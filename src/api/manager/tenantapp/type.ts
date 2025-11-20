export interface TenantAppSetting {
  enableNotice: boolean
  noticeEmail: string
}

export interface TenantApp {
  id: number
  tenantId: number
  appId: number
  app: {
    id: number
    name: string
    logo: string
    keyword: string
    status: boolean
  }
  expiredAt: number
  createdAt: number
  updatedAt: number
  setting: TenantAppSetting
  menuIds: number[]
}

export interface GetTenantAppRequest {
  tenantId: number
  appId: number
}

export interface ListTenantAppRequest {
  page: number
  pageSize: number
  tenantId: number
  order?: string
  orderBy?: string
  appKeyword?: string
  appName?: string
}

export interface ListTenantAppReply {
  total: number
  list: TenantApp[]
}

export interface CreateTenantAppRequest {
  tenantId: number
  appId: number
  expiredAt: number
  menuIds: number[]
  setting: TenantAppSetting
}

export interface CreateTenantAppReply {
  id: number
}

export interface UpdateTenantAppRequest {
  tenantId: number
  appId: number
  expiredAt?: number
  menuIds?: number[]
  setting?: TenantAppSetting
}

export interface DeleteTenantAppRequest {
  id: number
}
