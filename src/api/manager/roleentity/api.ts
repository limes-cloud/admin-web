import request from '@/utils/http'

import {
  ListRoleEntityReply,
  ListRoleEntityRequest,
  CreateRoleEntityReply,
  CreateRoleEntityRequest,
  UpdateRoleEntityRequest,
  DeleteRoleEntityRequest
} from './type'

// ListRoleEntity 获取角色实体信息列表
export function ListRoleEntity(params: ListRoleEntityRequest) {
  return request.get<ListRoleEntityReply>({ url: '/manager/api/role/entities', params })
}

// CreateRoleEntity 创建角色实体信息
export function CreateRoleEntity(data: CreateRoleEntityRequest) {
  return request.post<CreateRoleEntityReply>({ url: '/manager/api/role/entity', data })
}

// UpdateRoleEntity 更新角色实体信息
export function UpdateRoleEntity(data: UpdateRoleEntityRequest) {
  return request.put({ url: '/manager/api/role/entity', data })
}

// DeleteRoleEntity 删除角色实体信息
export function DeleteRoleEntity(params: DeleteRoleEntityRequest) {
  return request.del({ url: '/manager/api/role/entity', params })
}
