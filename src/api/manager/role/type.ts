export interface ListRoleRequest {
  app?: string
  name?: string
  keyword?: string
}

export interface Role {
  id: number
  app?: string
  parentId: number
  parent?: Role
  name: string
  keyword: string
  status?: boolean
  description?: string
  createdAt: number
  updatedAt: number
  children: Role[]
}

export interface ListRoleReply {
  list: Role[]
}

export interface CreateRoleRequest {
  app?: string
  parentId: number
  name: string
  keyword: string
  description?: string
}

export interface CreateRoleReply {
  id: number
}

export interface UpdateRoleRequest {
  id: number
  app?: string
  parentId?: number
  name?: string
  status?: boolean
  description?: string
}

export interface DeleteRoleRequest {
  id: number
  app?: string
}

export interface DeleteRoleReply {
  total: number
}
