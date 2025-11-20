import request from '@/utils/http'
import {
  ListAppRequest,
  ListAppReply,
  CreateAppRequest,
  CreateAppReply,
  UpdateAppRequest,
  DeleteAppRequest,
  GetAppRequest,
  App
} from './type'

// ListApp 获取应用信息列表
export function GetApp(params: GetAppRequest) {
  return request.get<App>({ url: '/manager/api/app', params })
}

// ListApp 获取应用信息列表
export function ListApp(params: ListAppRequest) {
  return request.get<ListAppReply>({ url: '/manager/api/apps', params })
}

// CreateApp 创建应用信息
export function CreateApp(data: CreateAppRequest) {
  return request.post<CreateAppReply>({ url: '/manager/api/app', data })
}

// UpdateApp 更新应用信息
export function UpdateApp(data: UpdateAppRequest) {
  return request.put({ url: '/manager/api/app', data })
}

// DeleteApp 删除应用信息
export function DeleteApp(params: DeleteAppRequest) {
  return request.del({ url: '/manager/api/app', params })
}
