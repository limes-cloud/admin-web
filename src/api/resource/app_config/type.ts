// AppConfigView 应用配置视图
export interface AppConfigView {
  id: number
  // 应用标识（app，唯一键：一个 app 只配置一次）
  app: string
  store_keyword: string
  // 导出产物的对象存储（必填）
  export_store_keyword: string
  default_accept: string
  default_max_size: number
  temp_url_ttl: number
  export_ttl: number
  // 存储配额（字节）；0=不限
  quota: number
  // 已用量（字节）；只读
  used_bytes: number
  status: number
  updated_by: number
  created_at: number
  updated_at: number
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- 该接口无查询参数
export interface GetAppConfigRequest {}

export interface GetAppConfigResponse {
  app_config: AppConfigView
}

// app 默认取自请求头 X-App-Key；manager 可通过 app 参数指定目标应用
export interface ListAppConfigRequest {
  page: number
  page_size: number
  // 0 停用 / 1 启用，均可过滤
  status?: number
}

export interface ListAppConfigResponse {
  list: AppConfigView[]
  total: number
}

// app 默认取自请求头 X-App-Key；manager 可通过 app 参数指定目标应用
export interface CreateAppConfigRequest {
  store_keyword: string
  export_store_keyword: string
  // 允许为空串；非空时为逗号分隔的扩展名（如 png,jpg）
  default_accept?: string
  default_max_size: number
  temp_url_ttl?: number
  export_ttl?: number
  // 存储配额（字节）；0=不限
  quota?: number
  // 0 停用 / 1 启用
  status: number
}

export interface CreateAppConfigResponse {
  id: number
}

// 局部更新：app 为唯一键，默认取自 X-App-Key，manager 可通过 app 参数指定目标应用；其余可选——不传 = 该列不改
export interface UpdateAppConfigRequest {
  store_keyword?: string
  export_store_keyword?: string
  default_accept?: string
  default_max_size?: number
  temp_url_ttl?: number
  export_ttl?: number
  // 存储配额（字节）；0=不限；不传=不改
  quota?: number
  status?: number
}

export interface UpdateAppConfigResponse {
  app: string
}
