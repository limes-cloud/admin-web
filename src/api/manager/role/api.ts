import request from '@/utils/http'

import { ListRoleReply, CreateRoleReply, CreateRoleRequest, UpdateRoleRequest, DeleteRoleRequest } from './type'

// ListRole 获取角色信息列表
export function ListCurrentRole() {
  return request.get<ListRoleReply>({ url: '/manager/api/current/roles' })
}

// ListRole 获取角色信息列表
// export function ListRole(params?: ListRoleRequest) {
//   return request.get<ListRoleReply>({ url: '/manager/api/current/roles', params })
// }

// CreateRole 创建角色信息
export function CreateRole(data: CreateRoleRequest) {
  return request.post<CreateRoleReply>({ url: '/manager/api/role', data })
}

// UpdateRole 更新角色信息
export function UpdateRole(data: UpdateRoleRequest) {
  return request.put({ url: '/manager/api/role', data })
}

// DeleteRole 删除角色信息
export function DeleteRole(params: DeleteRoleRequest) {
  return request.del({ url: '/manager/api/role', params })
}
