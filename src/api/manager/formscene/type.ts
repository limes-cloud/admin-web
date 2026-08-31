export interface FormScene {
  id: number
  keyword: string
  name: string
  description?: string
  createdAt: number
  updatedAt: number
}

export interface ListFormSceneRequest {
  page: number
  pageSize: number
  keyword?: string
  name?: string
}

export interface ListFormSceneReply {
  total: number
  list: FormScene[]
}

export interface CreateFormSceneRequest {
  keyword: string
  name: string
  description?: string
}

export interface CreateFormSceneReply {
  id: number
}

export interface UpdateFormSceneRequest {
  id: number
  keyword?: string
  name?: string
  description?: string
}

export interface DeleteFormSceneRequest {
  id: number
}
