import request from '@/utils/http'
import {
  GetFileReply,
  GetFileRequest,
  ListFileReply,
  ListFileRequest,
  CreateFileReply,
  CreateFileRequest,
  UpdateFileRequest,
  DeleteFileReply,
  DeleteFileRequest,
  PrepareUploadFileRequest,
  PrepareUploadFileReply,
  UploadFileReply
} from './type'

// GetFile 获取指定的文件信息
export function GetFile(params?: GetFileRequest) {
  return request.get<GetFileReply>({ url: '/resource/api/file', params })
}

// ListFile 获取文件信息列表
export function ListFile(params: ListFileRequest) {
  return request.get<ListFileReply>({ url: '/resource/api/files', params })
}

// CreateFile 创建文件信息
export function CreateFile(data: CreateFileRequest) {
  return request.post<CreateFileReply>({ url: '/resource/api/file', data })
}

// PrepareUploadFile 预上传文件信息
export function PrepareUploadFile(data: PrepareUploadFileRequest) {
  return request.post<PrepareUploadFileReply>({ url: '/resource/api/file/prepare_upload', data })
}

// UploadFile 上传文件切片
export async function UploadChunkFile(data: FormData) {
  return request.post<UploadFileReply>({
    url: `/resource/api/chunk_upload`,
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// UpdateFile 更新文件信息
export function UpdateFile(data: UpdateFileRequest) {
  return request.put({ url: '/resource/api/file', data })
}

// DeleteFile 删除文件信息
export function DeleteFile(params: DeleteFileRequest) {
  return request.del<DeleteFileReply>({ url: '/resource/api/file', params })
}
