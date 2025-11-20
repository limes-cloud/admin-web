export interface OAuther {
  id: number
  logo: string
  keyword: string
  name: string
  type: string
}

export interface AppOAuther {
  id: number
  appId: number
  oautherId: number
  oauther: OAuther
  createdAt: number
  updatedAt: number
}

export interface ListAppOAutherRequest {
  appId: number
  page: number
  pageSize: number
  order?: string
  orderBy?: string
  keyword?: string
  name?: string
}

export interface ListAppOAutherReply {
  total: number
  list: AppOAuther[]
}

export interface CreateAppOAutherRequest {
  appId: number
  oautherId: number
}

export interface CreateAppOAutherReply {
  id: number
}

export interface DeleteAppOAutherRequest {
  id: number
}

export interface DeleteAppOAutherReply {
  total: number
}
