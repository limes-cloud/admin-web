// FileItem 文件条目（列表项，含派生 URL）
export interface FileItem {
  id: number
  app: string
  user_id: number
  directory_id: number
  name: string
  object_id: number
  // 对象大小（字节），注意是字符串
  size: string
  // 后缀（来自 object，显示用）
  ext: string
  // 派生可读 URL
  url: string
  // 对象 key（md5.ext），业务持久化只用它
  key: string
  created_at: number
}

// PartURL 单个分片的预签名上传地址
export interface PartURL {
  part_number: number
  url: string
}

export interface GetUserFileRequest {
  id: number
}

export interface GetUserFileResponse {
  file: FileItem
}

export interface ListUserFileRequest {
  user_id?: number
  page: number
  page_size: number
}

export interface ListUserFileResponse {
  list: FileItem[]
  total: number
}

export interface ListFileRequest {
  directory_id?: number
  page: number
  page_size: number
}

export interface ListFileResponse {
  list: FileItem[]
  total: number
}

export interface GetUploadChunkSizeRequest {
  // 字节数（字符串），客户端先调它再切片
  total_size: string
}

export interface GetUploadChunkSizeResponse {
  chunk_size: number
  chunk_count: number
}

export interface PrepareUploadFileRequest {
  path?: string
  name: string
  ext?: string
  // 分片摘要的摘要（32 位小写 hex）
  md5: string
  // 字节数（字符串）
  size: string
}

export interface PrepareUploadFileResponse {
  upload_id: string
  md5: string
  chunk_size: number
  chunk_count: number
  // 已传片号；召回命中时非空，客户端只补缺口
  upload_chunks: number[]
  // 秒传命中
  skipped: boolean
  // 秒传命中时的可读 URL
  url: string
  // 对象 key（md5.ext），业务持久化只用它
  key: string
}

export interface GetUploadPartURLsRequest {
  upload_id: string
  part_numbers: number[]
}

export interface GetUploadPartURLsResponse {
  urls: PartURL[]
}

export interface CompleteUploadRequest {
  upload_id: string
}

export interface CompleteUploadResponse {
  url: string
  // 对象 key（md5.ext），业务持久化只用它
  key: string
}

// 局部更新：仅 id 固定必传（manager 可通过 app 参数指定目标应用），name/directory_id 可选
export interface UpdateUserFileRequest {
  id: number
  name?: string
  directory_id?: number
}

export interface UpdateUserFileResponse {
  file: FileItem
}

export interface DeleteUserFileRequest {
  id: number
}

export interface DeleteUserFileResponse {
  id: number
}
