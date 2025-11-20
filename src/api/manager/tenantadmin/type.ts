export interface GetTenantAdminRequest {
  tenantId: number
  userId: number
}

export interface ListTenantAdminRequest {
  page: number
  pageSize: number
  tenantId: number
}

export interface ListTenantAdminReply {
  total: number
  list: {
    id: number
    avatar: string
    username: string
    nickname: string
    createdAt: number
  }[]
}

export interface CreateTenantAdminRequest {
  tenantId: number
  userId: number
}

export interface CreateTenantAdminReply {
  id: number
}

export interface UpdateTenantAdminRequest {
  tenantId: number
  userId: number
}

export interface DeleteTenantAdminRequest {
  tenantId: number
  userId: number
}
