import request from '@/utils/http'

import {
  GetAppConfigRequest,
  GetAppConfigResponse,
  ListAppConfigRequest,
  ListAppConfigResponse,
  CreateAppConfigRequest,
  CreateAppConfigResponse,
  UpdateAppConfigRequest,
  UpdateAppConfigResponse
} from './type'

// ListAppConfig 分页查询应用配置
export function ListAppConfig(params: ListAppConfigRequest, app?: string) {
  return request.get<ListAppConfigResponse>({
    url: '/resource/api/app-config',
    params: app ? { ...params, app } : params
  })
}

// GetAppConfig 按 app 读取应用配置
export function GetAppConfig(params: GetAppConfigRequest, app?: string) {
  return request.get<GetAppConfigResponse>({
    url: '/resource/api/app-config/detail',
    params: app ? { ...params, app } : params
  })
}

// CreateAppConfig 创建应用配置
export function CreateAppConfig(data: CreateAppConfigRequest, app?: string) {
  return request.post<CreateAppConfigResponse>({
    url: '/resource/api/app-config',
    data,
    params: app ? { app } : undefined
  })
}

// UpdateAppConfig 更新应用配置（以 app 为唯一键，局部更新）
export function UpdateAppConfig(data: UpdateAppConfigRequest, app?: string) {
  return request.put<UpdateAppConfigResponse>({
    url: '/resource/api/app-config',
    data,
    params: app ? { app } : undefined
  })
}
