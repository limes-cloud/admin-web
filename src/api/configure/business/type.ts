export interface ListBusinessRequest {
  page: number
  pageSize: number
  order?: string
  orderBy?: string
  app: string
  keyword?: string
}

export interface Business {
  id: number
  app: string
  keyword: string
  type: string
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
  description?: string
}

export interface CreateBusinessReply {
  id: number
}

export interface UpdateBusinessRequest {
  id: number
  keyword: string
  type: string
  description?: string
}

export interface DeleteBusinessRequest {
  id: number
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
