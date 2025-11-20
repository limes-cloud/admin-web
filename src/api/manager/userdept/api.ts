import request from '@/utils/http'

import {
  ListUserDeptReply,
  ListUserDeptRequest,
  CreateUserDeptRequest,
  UpdateUserDeptRequest,
  DeleteUserDeptRequest
} from './type'

// ListUserDept 获取用户部门信息列表
export function ListUserDept(params: ListUserDeptRequest) {
  return request.get<ListUserDeptReply>({ url: '/manager/api/userdepts', params })
}

// CreateUserDept 创建用户部门信息
export function CreateUserDept(data: CreateUserDeptRequest) {
  return request.post({ url: '/manager/api/userdept', data })
}

// UpdateUserDept 更新用户部门信息
export function UpdateUserDept(data: UpdateUserDeptRequest) {
  return request.put({ url: '/manager/api/userdept', data })
}

// DeleteUserDept 删除用户部门信息
export function DeleteUserDept(params: DeleteUserDeptRequest) {
  return request.del({ url: '/manager/api/userdept', params })
}
