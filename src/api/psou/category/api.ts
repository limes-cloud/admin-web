import request from '@/utils/http'

import {
  CreateCategoryReply,
  CreateCategoryRequest,
  DeleteCategoryRequest,
  ListCategoryReply,
  ListCategoryRequest,
  UpdateCategoryRequest
} from './type'

// ListCategories 获取分类列表（不分页）
export function ListCategories(params: ListCategoryRequest = {}) {
  return request.get<ListCategoryReply>({ url: '/psou/api/categories', params })
}

// CreateCategory 创建分类
export function CreateCategory(data: CreateCategoryRequest) {
  return request.post<CreateCategoryReply>({ url: '/psou/api/categories', data })
}

// UpdateCategory 更新分类
export function UpdateCategory(data: UpdateCategoryRequest) {
  return request.put({ url: '/psou/api/categories', data })
}

// DeleteCategory 删除分类
export function DeleteCategory(params: DeleteCategoryRequest) {
  return request.del({ url: '/psou/api/categories', params })
}
