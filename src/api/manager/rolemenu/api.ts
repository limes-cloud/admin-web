import request from '@/utils/http'

import { GetRoleMenuIdsRequest, GetRoleMenuIdsReply, UpdateRoleMenuIdsRequest } from './type'

// ListRole 获取角色信息列表
export function GetRoleMenuIds(params: GetRoleMenuIdsRequest) {
  return request.get<GetRoleMenuIdsReply>({ url: '/manager/api/role/menuids', params })
}

// UpdateRoleMenu 更新角色菜单角色信息
export function UpdateRoleMenuIds(data: UpdateRoleMenuIdsRequest) {
  return request.post({ url: '/manager/api/role/menus', data })
}
