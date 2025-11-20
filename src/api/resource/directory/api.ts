import request from '@/utils/http'
import {
  GetDirectoryReply,
  GetDirectoryRequest,
  ListDirectoryReply,
  ListDirectoryRequest,
  CreateDirectoryReply,
  CreateDirectoryRequest,
  DeleteDirectoryReply,
  DeleteDirectoryRequest,
  UpdateDirectoryRequest
} from './type'

// GetDirectory 获取指定的文件目录信息
export function GetDirectory(params?: GetDirectoryRequest) {
  return request.get<GetDirectoryReply>({ url: '/resource/api/directory', params })
}

// ListDirectory 获取文件目录信息列表
export function ListDirectory(params?: ListDirectoryRequest) {
  return request.get<ListDirectoryReply>({ url: '/resource/api/directories', params })
}

// CreateDirectory 创建文件目录信息
export function CreateDirectory(data: CreateDirectoryRequest) {
  return request.post<CreateDirectoryReply>({ url: '/resource/api/directory', data })
}

//UpdateeDirectory 创建文件目录信息
export function UpdateDirectory(data: UpdateDirectoryRequest) {
  return request.put({ url: '/resource/api/directory', data })
}

// DeleteDirectory 删除文件目录信息
export function DeleteDirectory(params: DeleteDirectoryRequest) {
  return request.del<DeleteDirectoryReply>({ url: '/resource/api/directory', params })
}
