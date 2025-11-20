import request from '@/utils/http'

import {
  ListOAutherReply,
  ListOAutherRequest,
  CreateOAutherReply,
  CreateOAutherRequest,
  UpdateOAutherRequest,
  DeleteOAutherRequest,
  OAutherType
} from './type'

// ListOAuther 获取授权渠道信息列表
export function ListOAutherType() {
  return request.get<{ list: OAutherType[] }>({ url: '/manager/api/oauther/types' })
}

// ListOAuther 获取授权渠道信息列表
export function ListOAuther(params: ListOAutherRequest) {
  return request.get<ListOAutherReply>({ url: '/manager/api/oauthers', params })
}

// CreateOAuther 创建授权渠道信息
export function CreateOAuther(data: CreateOAutherRequest) {
  return request.post<CreateOAutherReply>({ url: '/manager/api/oauther', data })
}

// UpdateOAuther 更新授权渠道信息
export function UpdateOAuther(data: UpdateOAutherRequest) {
  return request.put({ url: '/manager/api/oauther', data })
}

// DeleteOAuther 删除授权渠道信息
export function DeleteOAuther(params: DeleteOAutherRequest) {
  return request.del({ url: '/manager/api/oauther', params })
}
