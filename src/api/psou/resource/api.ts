import request from '@/utils/http'

import {
  CreateResourceReply,
  CreateResourceRequest,
  DeleteResourceRequest,
  GetResourceRequest,
  ListResourceReply,
  ListResourceRequest,
  Resource,
  UpdateResourceBannerRequest,
  UpdateResourceRequest,
  UpdateResourceStatusRequest
} from './type'

// GetResource 获取资源详情
export function GetResource(params: GetResourceRequest) {
  return request.get<Resource>({ url: `/psou/api/resources/${params.id}` })
}

// ListResources 获取资源列表
export function ListResources(params: ListResourceRequest) {
  return request.get<ListResourceReply>({ url: '/psou/api/resources', params })
}

// CreateResource 创建资源
export function CreateResource(data: CreateResourceRequest) {
  return request.post<CreateResourceReply>({ url: '/psou/api/resources', data })
}

// UpdateResource 更新资源
export function UpdateResource(data: UpdateResourceRequest) {
  return request.put({ url: '/psou/api/resources', data })
}

// DeleteResource 删除资源（同时删除网盘副本）
export function DeleteResource(params: DeleteResourceRequest) {
  return request.del({ url: '/psou/api/resources', params })
}

// UpdateResourceStatus 更新资源状态
export function UpdateResourceStatus(data: UpdateResourceStatusRequest) {
  return request.put({ url: '/psou/api/resources/status', data })
}

// UpdateResourceBanner 设置/取消 Banner
export function UpdateResourceBanner(data: UpdateResourceBannerRequest) {
  return request.put({ url: '/psou/api/resources/banner', data })
}
