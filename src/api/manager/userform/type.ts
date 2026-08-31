export interface UserForm {
  id: number
  scene: string
  name: string
  description?: string
  schema: string
  version: number
  status: boolean
  createdAt: number
  updatedAt: number
}

export interface ListUserFormRequest {
  page: number
  pageSize: number
  scene?: string
  name?: string
  status?: boolean
}

export interface ListUserFormReply {
  total: number
  list: UserForm[]
}

export interface GetUserFormRequest {
  id?: number
  scene?: string
}

export interface GetUserFormReply {
  data: UserForm
}

export interface GetUserFormByAppRequest {
  appKeyword: string
  scene: string
}

export interface GetUserFormByAppReply {
  data: UserForm
}

export interface CreateUserFormRequest {
  scene: string
  name: string
  description?: string
  schema: string
}

export interface CreateUserFormReply {
  id: number
}

export interface UpdateUserFormRequest {
  id: number
  scene?: string
  name?: string
  description?: string
  schema?: string
}

export interface PublishUserFormRequest {
  id: number
}

export interface DeleteUserFormRequest {
  id: number
}
