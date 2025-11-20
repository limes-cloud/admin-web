import request from '@/utils/http'

import {
  ListAppFieldReply,
  ListAppFieldRequest,
  CreateAppFieldReply,
  CreateAppFieldRequest,
  DeleteAppFieldRequest,
  UpdateAppFieldRequest
} from './type'

// ListAppField 获取应用字段信息列表
export function ListAppField(params: ListAppFieldRequest) {
  return request.get<ListAppFieldReply>({ url: '/manager/api/app/fields', params })
}

// CreateAppField 创建应用字段信息
export function CreateAppField(data: CreateAppFieldRequest) {
  return request.post<CreateAppFieldReply>({ url: '/manager/api/app/field', data })
}

// UpdateAppField 更新应用字段信息
export function UpdateAppField(data: UpdateAppFieldRequest) {
  return request.put({ url: '/manager/api/app/field', data })
}

// DeleteAppField 删除应用字段信息
export function DeleteAppField(params: DeleteAppFieldRequest) {
  return request.del({ url: '/manager/api/app/field', params })
}
