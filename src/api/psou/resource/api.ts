import request from '@/utils/http'

import {
  CreateResourceReply,
  CreateResourceRequest,
  DeleteResourceRequest,
  FetchResourceMetadataReply,
  FetchResourceMetadataRequest,
  GetResourceReply,
  GetResourceRequest,
  ListResourceReply,
  ListResourceRequest,
  UpdateResourceBannerRequest,
  UpdateResourceBannerFocusRequest,
  UpdateResourceRequest,
  UpdateResourceStatusRequest
} from './type'

// GetResource 获取资源详情
export function GetResource(params: GetResourceRequest) {
  return request.get<GetResourceReply>({ url: '/psou/admin/resource', params })
}

// FetchResourceMetadata 按标题解析外部资源元数据
export function FetchResourceMetadata(params: FetchResourceMetadataRequest) {
  return request.get<FetchResourceMetadataReply>({
    url: '/psou/admin/resource/metadata',
    params,
    timeout: 120000
  })
}

// ListResource 获取资源列表
export function ListResource(params: ListResourceRequest) {
  return request.get<ListResourceReply>({ url: '/psou/admin/resources', params })
}

// CreateResource 创建资源
export function CreateResource(data: CreateResourceRequest) {
  return request.post<CreateResourceReply>({ url: '/psou/admin/resource', data })
}

// UpdateResource 更新资源
export function UpdateResource(data: UpdateResourceRequest) {
  return request.put({ url: '/psou/admin/resource', data })
}

// DeleteResource 删除资源（同时删除网盘副本）
export function DeleteResource(params: DeleteResourceRequest) {
  return request.del({ url: '/psou/admin/resource', params })
}

// UpdateResourceStatus 更新资源状态
export function UpdateResourceStatus(data: UpdateResourceStatusRequest) {
  return request.put({ url: '/psou/admin/resource/status', data })
}

// UpdateResourceBanner 设置/取消 Banner
export function UpdateResourceBanner(data: UpdateResourceBannerRequest) {
  return request.put({ url: '/psou/admin/resource/banner', data })
}

// UpdateResourceBannerFocus 更新首页轮播封面焦点
export function UpdateResourceBannerFocus(data: UpdateResourceBannerFocusRequest) {
  return request.put({ url: '/psou/admin/resource/banner/focus', data })
}
