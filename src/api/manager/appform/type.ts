export interface AppForm {
  id: number
  appKeyword: string
  formId: number
  scene: string
  createdAt: number
}

export interface ListAppFormRequest {
  appKeyword: string
}

export interface ListAppFormReply {
  list: AppForm[]
}

export interface CreateAppFormRequest {
  appKeyword: string
  formId: number
}

export interface CreateAppFormReply {
  id: number
}

export interface DeleteAppFormRequest {
  id: number
}
