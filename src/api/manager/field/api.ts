import request from '@/utils/http'

import {
  ListFieldReply,
  ListFieldRequest,
  CreateFieldReply,
  CreateFieldRequest,
  UpdateFieldRequest,
  DeleteFieldRequest,
  FieldOptions
} from './type'

// ListFieldOptions 获取组件类型和校验规则枚举
export function ListFieldOptions() {
  return request.get<FieldOptions>({ url: '/manager/api/field/options' })
}

// ListField 获取字段信息列表
export function ListField(params: ListFieldRequest) {
  return request.get<ListFieldReply>({ url: '/manager/api/fields', params })
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
