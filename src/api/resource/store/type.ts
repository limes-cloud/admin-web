// Store 对象存储视图（ak 完整返回，sk 掩码返回）
export interface Store {
  id: number
  keyword: string
  provider: string
  name: string
  endpoint: string
  region: string
  bucket: string
  // 访问密钥 ID，完整返回
  ak: string
  // 访问密钥，掩码返回（前 3 后 3，中间 *）
  sk: string
  public_base_url: string
  cdn_auth_type: string
  cdn_auth_key: string
  status: number
  description: string
  updated_by: number
  created_at: number
  updated_at: number
}

// Provider 厂商下拉项
export interface Provider {
  value: string
  label: string
  implemented: boolean
}

export interface GetStoreRequest {
  id: number
}

export interface GetStoreResponse {
  store: Store
}

export interface ListStoreRequest {
  page: number
  page_size: number
  keyword?: string
  provider?: string
  // 0 停用 / 1 启用，均可过滤
  status?: number
}

export interface ListStoreResponse {
  list: Store[]
  total: number
}

export interface CreateStoreRequest {
  keyword: string
  provider: string
  name: string
  endpoint: string
  region: string
  bucket: string
  ak: string
  sk: string
  public_base_url: string
  // none / cdn_a / cdn_b / cdn_c / s3_presign
  cdn_auth_type: string
  // 不传 = 不配置
  cdn_auth_key?: string
  // 0 停用 / 1 启用
  status: number
  // 不传 = 无备注
  description?: string
}

export interface CreateStoreResponse {
  id: number
}

// 局部更新：仅 id 固定必传，其余可选——不传 = 该列不改
export interface UpdateStoreRequest {
  id: number
  provider?: string
  name?: string
  endpoint?: string
  region?: string
  bucket?: string
  ak?: string
  // 空串 = 不修改
  sk?: string
  public_base_url?: string
  cdn_auth_type?: string
  // 不传 = 不改
  cdn_auth_key?: string
  status?: number
  // 不传 = 不改
  description?: string
}

export interface UpdateStoreResponse {
  id: number
}

export interface DeleteStoreRequest {
  id: number
}

export interface DeleteStoreResponse {
  id: number
}

export interface ListProviderResponse {
  list: Provider[]
}

// CheckStore 测试存储配置连通性（不落库）
export interface CheckStoreRequest {
  // 已保存的 store 主键（编辑场景传：sk 为掩码/未改时后端回退用 DB 存储的真实 sk）
  id?: number
  provider: string
  endpoint: string
  region: string
  bucket: string
  ak: string
  sk: string
}

export interface CheckStoreResponse {
  ok: boolean
  // ok=false 时为分类原因（凭证错误 / 桶不存在 / 无法连接等）
  message: string
}
