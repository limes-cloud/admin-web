import request from '@/utils/http'
import {
  ListRecipeRequest,
  ListRecipeReply,
  CreateRecipeRequest,
  CreateRecipeReply,
  UpdateRecipeRequest,
  DeleteRecipeRequest,
  GetRecipeRequest,
  Recipe,
  CreateRecipeClassifyReply,
  CreateRecipeClassifyRequest,
  DeleteRecipeClassifyRequest,
  ListRecipeClassifyReply,
  UpdateRecipeClassifyRequest,
  ListRecipeClassifyRequest
} from './type'

// ListRecipeClassify 获取通知信息列表
export function ListRecipeClassify(params: ListRecipeClassifyRequest) {
  return request.get<ListRecipeClassifyReply>({ url: '/recipe/api/recipe/classifies', params })
}

// CreateRecipeClassify 创建通知信息
export function CreateRecipeClassify(data: CreateRecipeClassifyRequest) {
  return request.post<CreateRecipeClassifyReply>({ url: '/recipe/api/recipe/classify', data })
}

// UpdateRecipeClassify 更新通知信息
export function UpdateRecipeClassify(data: UpdateRecipeClassifyRequest) {
  return request.put({ url: '/recipe/api/recipe/classify', data })
}

// DeleteRecipeClassify 删除通知信息
export function DeleteRecipeClassify(params: DeleteRecipeClassifyRequest) {
  return request.del({ url: '/recipe/api/recipe/classify', params })
}

// ListRecipe 获取通知信息列表
export function GetRecipe(params: GetRecipeRequest) {
  return request.get<Recipe>({ url: '/recipe/api/recipe', params })
}

// ListRecipe 获取通知信息列表
export function ListRecipe(params: ListRecipeRequest) {
  return request.get<ListRecipeReply>({ url: '/recipe/api/recipes', params })
}

// CreateRecipe 创建通知信息
export function CreateRecipe(data: CreateRecipeRequest) {
  return request.post<CreateRecipeReply>({ url: '/recipe/api/recipe', data })
}

// UpdateRecipe 更新通知信息
export function UpdateRecipe(data: UpdateRecipeRequest) {
  return request.put({ url: '/recipe/api/recipe', data })
}

// DeleteRecipe 删除通知信息
export function DeleteRecipe(params: DeleteRecipeRequest) {
  return request.del({ url: '/recipe/api/recipe', params })
}
