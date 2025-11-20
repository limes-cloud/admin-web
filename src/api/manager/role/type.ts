export interface ListRoleRequest {
  name?: string
  keyword?: string
}

export interface Role {
  id: number
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
  parentId?: number
  name?: string
  status?: boolean
  description?: string
}

export interface DeleteRoleRequest {
  id: number
}

export interface DeleteRoleReply {
  total: number
}
