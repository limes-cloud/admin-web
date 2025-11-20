export interface FieldType {
  type: string
  name: string
}

export interface ListFieldRequest {
  page: number
  pageSize: number
  order?: string
  orderBy?: string
  keyword?: string
  name?: string
  status?: boolean
  required?: boolean
}

export interface Field {
  id: number
  keyword: string
  type: string
  name: string
  status?: boolean
  required?: boolean
  unique?: boolean
  description?: string
  createdAt: number
  updatedAt: number
}

export interface ListFieldReply {
  total: number
  list: Field[]
}

export interface CreateFieldRequest {
  keyword: string
  type: string
  name: string
  status?: boolean
  unique?: boolean
  required?: boolean
  description?: string
}

export interface CreateFieldReply {
  id: number
}

export interface UpdateFieldRequest {
  id: number
  status?: boolean
  keyword?: string
  type?: string
  name?: string
  required?: boolean
  unique?: boolean
  description?: string
}

export interface UpdateFieldStatusRequest {
  id: number
  status: boolean
}

export interface DeleteFieldRequest {
  id: number
}
