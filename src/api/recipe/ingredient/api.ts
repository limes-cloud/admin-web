import request from '@/utils/http'
import {
  ListIngredientRequest,
  ListIngredientReply,
  CreateIngredientRequest,
  CreateIngredientReply,
  UpdateIngredientRequest,
  DeleteIngredientRequest,
  GetIngredientRequest,
  Ingredient,
  CreateIngredientClassifyReply,
  CreateIngredientClassifyRequest,
  DeleteIngredientClassifyRequest,
  ListIngredientClassifyReply,
  UpdateIngredientClassifyRequest,
  ListIngredientClassifyRequest
} from './type'

// ListIngredientClassify 获取通知信息列表
export function ListIngredientClassify(params: ListIngredientClassifyRequest) {
  return request.get<ListIngredientClassifyReply>({ url: '/recipe/api/ingredient/classifies', params })
}

// CreateIngredientClassify 创建通知信息
export function CreateIngredientClassify(data: CreateIngredientClassifyRequest) {
  return request.post<CreateIngredientClassifyReply>({ url: '/recipe/api/ingredient/classify', data })
}

// UpdateIngredientClassify 更新通知信息
export function UpdateIngredientClassify(data: UpdateIngredientClassifyRequest) {
  return request.put({ url: '/recipe/api/ingredient/classify', data })
}

// DeleteIngredientClassify 删除通知信息
export function DeleteIngredientClassify(params: DeleteIngredientClassifyRequest) {
  return request.del({ url: '/recipe/api/ingredient/classify', params })
}

// ListIngredient 获取通知信息列表
export function GetIngredient(params: GetIngredientRequest) {
  return request.get<Ingredient>({ url: '/recipe/api/ingredient', params })
}

// ListIngredient 获取通知信息列表
export function ListIngredient(params: ListIngredientRequest) {
  return request.get<ListIngredientReply>({ url: '/recipe/api/ingredients', params })
}

// CreateIngredient 创建通知信息
export function CreateIngredient(data: CreateIngredientRequest) {
  return request.post<CreateIngredientReply>({ url: '/recipe/api/ingredient', data })
}

// UpdateIngredient 更新通知信息
export function UpdateIngredient(data: UpdateIngredientRequest) {
  return request.put({ url: '/recipe/api/ingredient', data })
}

// DeleteIngredient 删除通知信息
export function DeleteIngredient(params: DeleteIngredientRequest) {
  return request.del({ url: '/recipe/api/ingredient', params })
}
