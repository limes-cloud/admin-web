import request from '@/utils/http'

import {
  GetStoreRequest,
  GetStoreResponse,
  ListProviderResponse,
  ListStoreRequest,
  ListStoreResponse,
  CreateStoreRequest,
  CreateStoreResponse,
  UpdateStoreRequest,
  UpdateStoreResponse,
  DeleteStoreRequest,
  DeleteStoreResponse,
  CheckStoreRequest,
  CheckStoreResponse
} from './type'

// ListStore 分页查询对象存储
export function ListStore(params: ListStoreRequest) {
  return request.get<ListStoreResponse>({ url: '/resource/api/store', params })
}

// GetStore 按主键查询对象存储
export function GetStore(params: GetStoreRequest) {
  return request.get<GetStoreResponse>({ url: '/resource/api/store/detail', params })
}

// CreateStore 新建对象存储
export function CreateStore(data: CreateStoreRequest) {
  return request.post<CreateStoreResponse>({ url: '/resource/api/store', data })
}

// UpdateStore 更新对象存储（局部更新）
export function UpdateStore(data: UpdateStoreRequest) {
  return request.put<UpdateStoreResponse>({ url: '/resource/api/store', data })
}

// DeleteStore 删除未被引用的对象存储
export function DeleteStore(params: DeleteStoreRequest) {
  return request.del<DeleteStoreResponse>({ url: '/resource/api/store', params })
}

// ListProvider 返回代码里已注册的厂商清单
export function ListProvider() {
  return request.get<ListProviderResponse>({ url: '/resource/api/store/provider' })
}

// CheckStore 测试存储配置连通性（不落库，入参为待测配置）
export function CheckStore(data: CheckStoreRequest) {
  return request.post<CheckStoreResponse>({ url: '/resource/api/store/check', data })
}
