import request from '@/utils/http'
import {
  ListTenantAppRequest,
  ListTenantAppReply,
  CreateTenantAppRequest,
  CreateTenantAppReply,
  UpdateTenantAppRequest,
  DeleteTenantAppRequest,
  GetTenantAppRequest,
  TenantApp
} from './type'

// ListTenantApp 获取租户应用信息列表
export function GetTenantApp(params: GetTenantAppRequest) {
  return request.get<TenantApp>({ url: '/manager/api/tenant/app', params })
}

// ListTenantApp 获取租户应用信息列表
export function ListTenantApp(params: ListTenantAppRequest) {
  return request.get<ListTenantAppReply>({ url: '/manager/api/tenant/apps', params })
}

// CreateTenantApp 创建租户应用信息
export function CreateTenantApp(data: CreateTenantAppRequest) {
  return request.post<CreateTenantAppReply>({ url: '/manager/api/tenant/app', data })
}

// UpdateTenantApp 更新租户应用信息
export function UpdateTenantApp(data: UpdateTenantAppRequest) {
  return request.put({ url: '/manager/api/tenant/app', data })
}

// DeleteTenantApp 删除租户应用信息
export function DeleteTenantApp(params: DeleteTenantAppRequest) {
  return request.del({ url: '/manager/api/tenant/app', params })
}
