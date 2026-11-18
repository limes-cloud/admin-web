// DirectoryView 目录视图
export interface DirectoryView {
  id: number
  app: string
  name: string
  path: string
  // 允许的文件类型（* 或逗号分隔的扩展名；空串 = 禁止所有类型）
  accept: string
  // 单文件大小上限（MB）
  max_size: number
  updated_by: number
  created_at: number
  updated_at: number
}

export interface GetDirectoryRequest {
  id: number
}

export interface GetDirectoryResponse {
  directory: DirectoryView
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- 该接口无查询参数
export interface ListDirectoryRequest {}

export interface ListDirectoryResponse {
  list: DirectoryView[]
}

export interface CreateDirectoryRequest {
  // 完整路径（如 /xxx/yyy），按 / 分段，格式在领域层校验
  path: string
}

export interface CreateDirectoryResponse {
  directory: DirectoryView
}

// 局部更新：仅 id 固定必传（manager 可通过 app 参数指定目标应用），其余可选——不传 = 该列不改
export interface UpdateDirectoryRequest {
  id: number
  // 新完整路径（改名或移动）
  path?: string
  // 允许设 ""（禁止所有类型）
  accept?: string
  // 新单文件上限（MB）
  max_size?: number
}

export interface UpdateDirectoryResponse {
  id: number
}

export interface DeleteDirectoryRequest {
  id: number
}

export interface DeleteDirectoryResponse {
  id: number
}
