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
export function GetUserFile(params: GetUserFileRequest, app?: string) {
  return request.get<GetUserFileResponse>({
    url: '/resource/api/file/detail',
    params: app ? { ...params, app } : params
  })
}

// ListUserFile 我的文件分页
export function ListUserFile(params: ListUserFileRequest, app?: string) {
  return request.get<ListUserFileResponse>({
    url: '/resource/api/file/user',
    params: app ? { ...params, app } : params
  })
}

// ListFile 目录内文件分页
export function ListFile(params: ListFileRequest, app?: string) {
  return request.get<ListFileResponse>({
    url: '/resource/api/file',
    params: app ? { ...params, app } : params
  })
}

// GetUploadChunkSize 取分片大小与片数（纯函数，客户端先调它）
export function GetUploadChunkSize(params: GetUploadChunkSizeRequest, app?: string) {
  return request.get<GetUploadChunkSizeResponse>({
    url: '/resource/api/file/upload/chunk-size',
    params: app ? { ...params, app } : params
  })
}

// PrepareUploadFile 预上传：秒传判定 / 召回 / 建会话
export function PrepareUploadFile(data: PrepareUploadFileRequest, app?: string) {
  return request.post<PrepareUploadFileResponse>({
    url: '/resource/api/file/upload/prepare',
    data,
    params: app ? { app } : undefined
  })
}

// GetUploadPartURLs 按批取分片上传预签名地址
export function GetUploadPartURLs(data: GetUploadPartURLsRequest, app?: string) {
  return request.post<GetUploadPartURLsResponse>({
    url: '/resource/api/file/upload/part-urls',
    data,
    params: app ? { app } : undefined
  })
}

// CompleteUpload 完成分片上传
export function CompleteUpload(data: CompleteUploadRequest, app?: string) {
  return request.post<CompleteUploadResponse>({
    url: '/resource/api/file/upload/complete',
    data,
    params: app ? { app } : undefined
  })
}

// UpdateUserFile 改名 / 移动（局部更新）
export function UpdateUserFile(data: UpdateUserFileRequest, app?: string) {
  return request.put<UpdateUserFileResponse>({
    url: '/resource/api/file/user',
    data,
    params: app ? { app } : undefined
  })
}

// DeleteUserFile 删除文件（触发对象回收）
export function DeleteUserFile(params: DeleteUserFileRequest, app?: string) {
  return request.del<DeleteUserFileResponse>({
    url: '/resource/api/file/user',
    params: app ? { ...params, app } : params
  })
}
