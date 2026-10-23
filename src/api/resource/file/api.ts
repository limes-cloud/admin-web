import request from '@/utils/http'

import {
  CompleteUploadRequest,
  CompleteUploadResponse,
  DeleteUserFileRequest,
  DeleteUserFileResponse,
  GetUploadChunkSizeRequest,
  GetUploadChunkSizeResponse,
  GetUploadPartURLsRequest,
  GetUploadPartURLsResponse,
  GetUserFileRequest,
  GetUserFileResponse,
  ListFileRequest,
  ListFileResponse,
  ListUserFileRequest,
  ListUserFileResponse,
  PrepareUploadFileRequest,
  PrepareUploadFileResponse,
  UpdateUserFileRequest,
  UpdateUserFileResponse
} from './type'

// GetUserFile 取单个文件（响应含完整 url 与 size）
export function GetUserFile(params: GetUserFileRequest) {
  return request.get<GetUserFileResponse>({ url: '/resource/api/file/detail', params })
}

// ListUserFile 我的文件分页
export function ListUserFile(params: ListUserFileRequest) {
  return request.get<ListUserFileResponse>({ url: '/resource/api/file/user', params })
}

// ListFile 目录内文件分页
export function ListFile(params: ListFileRequest) {
  return request.get<ListFileResponse>({ url: '/resource/api/file', params })
}

// GetUploadChunkSize 取分片大小与片数（纯函数，客户端先调它）
export function GetUploadChunkSize(params: GetUploadChunkSizeRequest) {
  return request.get<GetUploadChunkSizeResponse>({ url: '/resource/api/file/upload/chunk-size', params })
}

// PrepareUploadFile 预上传：秒传判定 / 召回 / 建会话
export function PrepareUploadFile(data: PrepareUploadFileRequest) {
  return request.post<PrepareUploadFileResponse>({ url: '/resource/api/file/upload/prepare', data })
}

// GetUploadPartURLs 按批取分片上传预签名地址
export function GetUploadPartURLs(data: GetUploadPartURLsRequest) {
  return request.post<GetUploadPartURLsResponse>({ url: '/resource/api/file/upload/part-urls', data })
}

// CompleteUpload 完成分片上传
export function CompleteUpload(data: CompleteUploadRequest) {
  return request.post<CompleteUploadResponse>({ url: '/resource/api/file/upload/complete', data })
}

// UpdateUserFile 改名 / 移动（局部更新）
export function UpdateUserFile(data: UpdateUserFileRequest) {
  return request.put<UpdateUserFileResponse>({ url: '/resource/api/file/user', data })
}

// DeleteUserFile 删除文件（触发对象回收）
export function DeleteUserFile(params: DeleteUserFileRequest) {
  return request.del<DeleteUserFileResponse>({ url: '/resource/api/file/user', params })
}
