export interface GetAppRequest {
  id?: number
  keyword?: string
}

export interface GetSampleAppRequest {
  keyword: string
}

export interface AppSetting {
  tenant: {
    mode: string
  }
  jwt: {
    secret: string
    expire: number
    renewal: number
    unique: boolean
  }
}

export interface App {
  id: number
  type: string
  logo: string
  keyword: string
  name: string
  secret?: string
  comment?: string
  status?: boolean
  reason?: string
  private?: boolean
  setting?: AppSetting
  description?: string
  copyright?: string
  createdAt: number
  updatedAt: number
}

export interface ListAppRequest {
  page: number
  pageSize: number
  order?: string
  orderBy?: string
  keyword?: string
  name?: string
  status?: boolean
}

export interface ListAppReply {
  total: number
  list: App[]
}

export interface CreateAppRequest {
  type: string
  logo: string
  keyword: string
  name: string
  secret: string
  comment: string
  private: boolean
  description: string
  setting: AppSetting
}

export interface CreateAppReply {
  id: number
}

export interface UpdateAppRequest {
  id: number
  logo?: string
  name?: string
  secret?: string
  comment?: string
  status?: boolean
  reason?: string
  private?: boolean
  description?: string
  setting?: AppSetting
}

export interface DeleteAppRequest {
  id: number
}
