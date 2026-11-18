import request from '@/utils/http'

import {
  CreateCategoryReply,
  CreateCategoryRequest,
  DeleteCategoryRequest,
  ListCategoryReply,
  ListCategoryRequest,
  UpdateCategoryRequest
} from './type'

// ListCategory 获取分类列表（不分页）
export function ListCategory(params: ListCategoryRequest = {}) {
  return request.get<ListCategoryReply>({ url: '/psou/admin/categories', params })
}

// CreateCategory 创建分类
export function CreateCategory(data: CreateCategoryRequest) {
  return request.post<CreateCategoryReply>({ url: '/psou/admin/category', data })
}

// UpdateCategory 更新分类
export function UpdateCategory(data: UpdateCategoryRequest) {
  return request.put({ url: '/psou/admin/category', data })
}

// DeleteCategory 删除分类
export function DeleteCategory(params: DeleteCategoryRequest) {
  return request.del({ url: '/psou/admin/category', params })
}
