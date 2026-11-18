import request from '@/utils/http'

import {
  CreateDirectoryRequest,
  CreateDirectoryResponse,
  DeleteDirectoryRequest,
  DeleteDirectoryResponse,
  GetDirectoryRequest,
  GetDirectoryResponse,
  ListDirectoryRequest,
  ListDirectoryResponse,
  UpdateDirectoryRequest,
  UpdateDirectoryResponse
} from './type'

// ListDirectory 全量取回某 app 的目录（按 path 升序）
export function ListDirectory(params: ListDirectoryRequest, app?: string) {
  return request.get<ListDirectoryResponse>({
    url: '/resource/api/directory',
    params: app ? { ...params, app } : params
  })
}

// GetDirectory 按主键查询目录
export function GetDirectory(params: GetDirectoryRequest, app?: string) {
  return request.get<GetDirectoryResponse>({
    url: '/resource/api/directory/detail',
    params: app ? { ...params, app } : params
  })
}

// CreateDirectory 按完整路径创建目录
export function CreateDirectory(data: CreateDirectoryRequest, app?: string) {
  return request.post<CreateDirectoryResponse>({
    url: '/resource/api/directory',
    data,
    params: app ? { app } : undefined
  })
}

// UpdateDirectory 改名 / 移动 / 改策略（局部更新）
export function UpdateDirectory(data: UpdateDirectoryRequest, app?: string) {
  return request.put<UpdateDirectoryResponse>({
    url: '/resource/api/directory',
    data,
    params: app ? { app } : undefined
  })
}

// DeleteDirectory 删目录（连带回收子树对象）
export function DeleteDirectory(params: DeleteDirectoryRequest, app?: string) {
  return request.del<DeleteDirectoryResponse>({
    url: '/resource/api/directory',
    params: app ? { ...params, app } : params
  })
}
