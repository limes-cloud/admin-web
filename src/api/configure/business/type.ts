export interface ListBusinessRequest {
  page: number
  pageSize: number
  order?: string
  orderBy?: string
  /** 所属应用；不传时服务端按 X-App-Key / AppKey 兜底 */
  app?: string
  keyword?: string
}

export interface Business {
  id: number
  app: string
  keyword: string
  type: string
  extra?: string
  description?: string
  createdAt: number
  updatedAt: number
}

export interface ListBusinessReply {
  total: number
  list: Business[]
}

export interface CreateBusinessRequest {
  app: string
  keyword: string
  type: string
  extra?: string
  description?: string
}

export interface CreateBusinessReply {
  id: number
}

export interface UpdateBusinessRequest {
  id: number
  keyword: string
  type: string
  extra?: string
  description?: string
}

export interface DeleteBusinessRequest {
  id: number
}

/** 业务变量渲染元数据（对应后端 entity.BusinessExtra） */
export interface BusinessExtra {
  options?: { label?: string; value: string }[]
  min?: number
  max?: number
  unit?: string
  placeholder?: string
  default?: string
  required?: boolean
  rows?: number
  maxLength?: number
}

export interface ListBusinessValueRequest {
  businessId: number
}

export interface BusinessValue {
  id: number
  envId: number
  businessId: number
  value: string
  createdAt: number
  updatedAt: number
}

export interface ListBusinessValueReply {
  total: number
  list: BusinessValue[]
}

export interface Value {
  envId: number
  value: string
}

export interface UpdateBusinessValueRequest {
  list: Value[]
  businessId: number
}
