import request from '@/utils/http'
import {
  ListDictionaryRequest,
  ListDictionaryReply,
  CreateDictionaryRequest,
  CreateDictionaryReply,
  UpdateDictionaryRequest,
  DeleteDictionaryRequest,
  ListDictionaryValueRequest,
  CreateDictionaryValueReply,
  CreateDictionaryValueRequest,
  DeleteDictionaryValueRequest,
  ListDictionaryValueReply,
  UpdateDictionaryValueRequest
} from './type'

// ListDictionary 获取字典信息列表
export function ListDictionary(params: ListDictionaryRequest) {
  return request.get<ListDictionaryReply>({ url: '/manager/api/dictionaries', params })
}

// CreateDictionary 创建字典信息
export function CreateDictionary(data: CreateDictionaryRequest) {
  return request.post<CreateDictionaryReply>({ url: '/manager/api/dictionary', data })
}

// UpdateDictionary 更新字典信息
export function UpdateDictionary(data: UpdateDictionaryRequest) {
  return request.put({ url: '/manager/api/dictionary', data })
}

// DeleteDictionary 删除字典信息
export function DeleteDictionary(params: DeleteDictionaryRequest) {
  return request.del({ url: '/manager/api/dictionary', params })
}

// ListDictionaryValue 获取字典值信息列表
export function ListDictionaryValue(params: ListDictionaryValueRequest) {
  return request.get<ListDictionaryValueReply>({ url: '/manager/api/dictionary/values', params })
}

// CreateDictionaryValue 创建字典值信息
export function CreateDictionaryValue(data: CreateDictionaryValueRequest) {
  return request.post<CreateDictionaryValueReply>({ url: '/manager/api/dictionary/value', data })
}

// UpdateDictionaryValue 更新字典值信息
export function UpdateDictionaryValue(data: UpdateDictionaryValueRequest) {
  return request.put({ url: '/manager/api/dictionary/value', data })
}

// DeleteDictionaryValue 删除字典值信息
export function DeleteDictionaryValue(params: DeleteDictionaryValueRequest) {
  return request.del({ url: '/manager/api/dictionary/value', params })
}
