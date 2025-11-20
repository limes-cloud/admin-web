export interface ListDeptRoleRequest {
  page: number
  pageSize: number
  name?: string
  deptId: number
}

export interface Role {
  id: number
  keyword: string
  name: string
}

export interface ListDeptRoleReply {
  total: number
  list: Role[]
}

export interface CreateDeptRoleRequest {
  deptId: number
  roleId: number
}

export interface CreateDeptRoleReply {
  id: number
}

export interface DeleteDeptRoleRequest {
  deptId: number
  roleId: number
}
