export interface ListRoleEntityRequest {
  page: number
  pageSize: number
  roleId: number
  app?: string
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

export interface RoleEntityItem {
  action: string
  scope: string
  depts?: number[]
  rules?: number[]
}

export interface CreateRoleEntityRequest {
  roleId: number
  entityId?: number
  app: string
  action?: string
  scope?: string
  rules?: string
  depts?: string
  // 批量配置：非空时按 items 逐条创建
  items?: RoleEntityItem[]
}

export interface CreateRoleEntityReply {
  id: number
}

export interface UpdateRoleEntityRequest {
  id: number
  roleId: number
  app: string
  entityId?: number
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
