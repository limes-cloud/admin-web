import request from '@/utils/http'

import {
  CreateJobRoleReply,
  CreateJobRoleRequest,
  DeleteJobRoleRequest,
  ListJobRoleReply,
  ListJobRoleRequest
} from './type'

// ListJobRole 获取职位角色信息列表
export function ListJobRole(params: ListJobRoleRequest) {
  return request.get<ListJobRoleReply>({ url: '/manager/api/job/roles', params })
}

// CreateJobRole 创建职位角色信息
export function CreateJobRole(data: CreateJobRoleRequest) {
  return request.post<CreateJobRoleReply>({ url: '/manager/api/job/role', data })
}

// DeleteJobRole 删除职位角色信息
export function DeleteJobRole(params: DeleteJobRoleRequest) {
  return request.del({ url: '/manager/api/job/role', params })
}
