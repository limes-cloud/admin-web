export interface Field {
  id: number
  keyword: string
  name: string
  type: string
}

export interface AppField {
  id: number
  appId: number
  fieldId: number
  field: Field
  required: boolean
  createdAt: number
  updatedAt: number
}

export interface ListAppFieldRequest {
  appId: number
  page: number
  pageSize: number
  order?: string
  orderBy?: string
  keyword?: string
  name?: string
}

export interface ListAppFieldReply {
  total: number
  list: AppField[]
}

export interface CreateAppFieldRequest {
  appId: number
  fieldId: number
  required: boolean
}

export interface CreateAppFieldReply {
  id: number
}

export interface UpdateAppFieldRequest {
  id: number
  required: boolean
}

export interface DeleteAppFieldRequest {
  id: number
}

export interface DeleteAppFieldReply {
  total: number
}
