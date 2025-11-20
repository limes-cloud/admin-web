export interface GetRoleMenuIdsRequest {
  roleId: number
  appId: number
}

export interface GetRoleMenuIdsReply {
  roleId: number
  appId: number
  menuIds: number[]
}

export interface UpdateRoleMenuIdsRequest {
  roleId: number
  appId: number
  menuIds: number[]
}
