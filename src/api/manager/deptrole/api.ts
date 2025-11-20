import request from '@/utils/http'

import {
  CreateDeptRoleReply,
  CreateDeptRoleRequest,
  DeleteDeptRoleRequest,
  ListDeptRoleReply,
  ListDeptRoleRequest
} from './type'

// ListDeptRole 获取部门角色信息列表
export function ListDeptRole(params: ListDeptRoleRequest) {
  return request.get<ListDeptRoleReply>({ url: '/manager/api/dept/roles', params })
}

// CreateDeptRole 创建部门角色信息
export function CreateDeptRole(data: CreateDeptRoleRequest) {
  return request.post<CreateDeptRoleReply>({ url: '/manager/api/dept/role', data })
}

// DeleteDeptRole 删除部门角色信息
export function DeleteDeptRole(params: DeleteDeptRoleRequest) {
  return request.del({ url: '/manager/api/dept/role', params })
}
