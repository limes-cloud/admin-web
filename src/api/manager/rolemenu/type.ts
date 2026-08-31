export interface GetRoleMenuIdsRequest {
  roleId: number
  app: string
}

export interface GetRoleMenuIdsReply {
  roleId: number
  app: string
  menuIds: number[]
}

export interface UpdateRoleMenuIdsRequest {
  roleId: number
  app: string
  menuIds: number[]
}
