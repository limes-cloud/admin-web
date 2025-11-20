export interface ListRoleEntityRequest {
  page: number
  pageSize: number
  roleId: number
  appId?: number
  entityId?: number
}

export interface RoleEntity {
  id: number
  roleId: number
  entityId: number
  entity: {
    id: number
    name: string
    comment: string
  }
  action: string
  scope: string
  fields: number[]
  rules: number[]
  depts: number[]
  createdAt: number
  updatedAt: number
}

export interface ListRoleEntityReply {
  total: number
  list: RoleEntity[]
}

export interface CreateRoleEntityRequest {
  roleId: number
  entityId?: number
  appId: number
  action: string
  scope: string
  fields: string
  rules: string
}

export interface CreateRoleEntityReply {
  id: number
}

export interface UpdateRoleEntityRequest {
  id: number
  roleId: number
  appId: number
  entityId?: number
  action: string
  scope: string
  fields: string
  rules: string
}

export interface DeleteRoleEntityRequest {
  id: number
}

export interface DeleteRoleEntityReply {
  total: number
}
