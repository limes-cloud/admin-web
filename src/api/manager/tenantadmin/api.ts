import request from '@/utils/http'
import {
  ListTenantAdminRequest,
  ListTenantAdminReply,
  CreateTenantAdminRequest,
  CreateTenantAdminReply,
  UpdateTenantAdminRequest,
  DeleteTenantAdminRequest
} from './type'

// ListTenantAdmin 获取租户管理信息列表
export function ListTenantAdmin(params: ListTenantAdminRequest) {
  return request.get<ListTenantAdminReply>({ url: '/manager/api/tenant/admins', params })
}

// CreateTenantAdmin 创建租户管理信息
export function CreateTenantAdmin(data: CreateTenantAdminRequest) {
  return request.post<CreateTenantAdminReply>({ url: '/manager/api/tenant/admin', data })
}

// UpdateTenantAdmin 更新租户管理信息
export function UpdateTenantAdmin(data: UpdateTenantAdminRequest) {
  return request.put({ url: '/manager/api/tenant/admin', data })
}

// DeleteTenantAdmin 删除租户管理信息
export function DeleteTenantAdmin(params: DeleteTenantAdminRequest) {
  return request.del({ url: '/manager/api/tenant/admin', params })
}
