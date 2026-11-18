import request from '@/utils/http'
import {
  ListAppRequest,
  ListAccessibleAppRequest,
  ListAppReply,
  CreateAppRequest,
  CreateAppReply,
  UpdateAppRequest,
  DeleteAppRequest,
  GetAppRequest,
  App,
  GetSampleAppRequest,
  InitAppRequest,
  ListSEOPushPlatformsReply,
  PushSEORequest,
  PushSEOReply,
  ListAppGroupReply,
  CreateAppGroupRequest,
  CreateAppGroupReply,
  UpdateAppGroupRequest,
  DeleteAppGroupRequest
} from './type'

// ListAppGroup 获取应用分组列表
export function ListAppGroup() {
  return request.get<ListAppGroupReply>({ url: '/manager/api/app/groups' })
}

// CreateAppGroup 创建应用分组
export function CreateAppGroup(data: CreateAppGroupRequest) {
  return request.post<CreateAppGroupReply>({ url: '/manager/api/app/group', data })
}

// UpdateAppGroup 更新应用分组
export function UpdateAppGroup(data: UpdateAppGroupRequest) {
  return request.put({ url: '/manager/api/app/group', data })
}

// DeleteAppGroup 删除应用分组
export function DeleteAppGroup(params: DeleteAppGroupRequest) {
  return request.del({ url: '/manager/api/app/group', params })
}

// GetApp 获取应用信息列表
export function GetSampleApp(params: GetSampleAppRequest) {
  return request.get<App>({ url: '/manager/api/sample/app', params })
}

// InitApp 根据页面访问域名初始化应用
export function InitApp(params: InitAppRequest) {
  return request.get<App>({ url: '/manager/api/init', params, showErrorMessage: false })
}

// ListSEOPushPlatforms 获取 SEO 推送平台目录和动态表单描述
export function ListSEOPushPlatforms() {
  return request.get<ListSEOPushPlatformsReply>({ url: '/manager/api/seo/push/platforms' })
}

// PushSEO 手动推送应用首页到指定搜索引擎
export function PushSEO(data: PushSEORequest) {
  return request.post<PushSEOReply>({ url: '/manager/api/seo/push', data })
}

// GetApp 获取应用信息列表
export function GetApp(params: GetAppRequest) {
  return request.get<App>({ url: '/manager/api/app', params })
}

// ListApp 获取应用信息列表
export function ListApp(params: ListAppRequest) {
  return request.get<ListAppReply>({ url: '/manager/api/apps', params })
}

// ListAccessibleApp 获取指定应用可配置的菜单应用范围
export function ListAccessibleApp(params: ListAccessibleAppRequest) {
  return request.get<ListAppReply>({ url: '/manager/api/current/apps', params })
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
