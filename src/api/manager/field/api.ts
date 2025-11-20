import request from '@/utils/http'

import {
  ListFieldReply,
  ListFieldRequest,
  CreateFieldReply,
  CreateFieldRequest,
  UpdateFieldRequest,
  DeleteFieldRequest,
  FieldType
} from './type'

// ListField 获取字段信息列表
export function ListFieldType() {
  return request.get<{ list: FieldType[] }>({ url: '/manager/api/field/types' })
}

// ListField 获取字段信息列表
export function ListField(params: ListFieldRequest) {
  return request.get<ListFieldReply>({ url: '/manager/api/fields', params })
}

// ListRequiredField 获取字段信息列表
export function ListRequiredField() {
  return request.get<ListFieldReply>({ url: '/manager/api/fields/required' })
}

// CreateField 创建字段信息
export function CreateField(data: CreateFieldRequest) {
  return request.post<CreateFieldReply>({ url: '/manager/api/field', data })
}

// UpdateField 更新字段信息
export function UpdateField(data: UpdateFieldRequest) {
  return request.put({ url: '/manager/api/field', data })
}

// DeleteField 删除字段信息
export function DeleteField(params: DeleteFieldRequest) {
  return request.del({ url: '/manager/api/field', params })
}
