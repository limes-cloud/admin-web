export interface GetAppRequest {
  id?: number
  keyword?: string
}

export interface GetSampleAppRequest {
  keyword: string
}

export interface AppSetting {
  web?: {
    watermark?: string
    copyright?: string
  }
  jwt: {
    secret: string
    expire: number
    renewal: number
    uniqueDevice: boolean
    uniquePlatform: boolean
  }
}

export interface App {
  id: number
  type: string
  logo: string
  favicon: string
  keyword: string
  name: string
  showName: string
  secret?: string
  comment?: string
  status?: boolean
  reason?: string
  private?: boolean
  setting?: AppSetting
  description?: string
  copyright?: string
  watermark?: string
  createdAt: number
  updatedAt: number
}

export interface ListAppRequest {
  page: number
  pageSize: number
  type?: string
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
  favicon: string
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
