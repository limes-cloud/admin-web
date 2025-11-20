import request from '@/utils/http'
import {
  ListTenantRequest,
  ListTenantReply,
  CreateTenantRequest,
  CreateTenantReply,
  UpdateTenantRequest,
  DeleteTenantRequest,
  GetTenantRequest,
  Tenant
} from './type'

// ListTenant 获取租户信息列表
export function GetTenant(params: GetTenantRequest) {
  return request.get<Tenant>({ url: '/manager/api/tenant', params })
}

// ListTenant 获取租户信息列表
export function ListTenant(params: ListTenantRequest) {
  return request.get<ListTenantReply>({ url: '/manager/api/tenants', params })
}

// CreateTenant 创建租户信息
export function CreateTenant(data: CreateTenantRequest) {
  return request.post<CreateTenantReply>({ url: '/manager/api/tenant', data })
}

// UpdateTenant 更新租户信息
export function UpdateTenant(data: UpdateTenantRequest) {
  return request.put({ url: '/manager/api/tenant', data })
}

// DeleteTenant 删除租户信息
export function DeleteTenant(params: DeleteTenantRequest) {
  return request.del({ url: '/manager/api/tenant', params })
}
