export interface OAuther {
  id: number
  logo: string
  keyword: string
  name: string
  type: string
}

export interface AppOAuther {
  id: number
  app: string
  oautherId: number
  oauther: OAuther
  createdAt: number
  updatedAt: number
}

export interface ListAppOAutherRequest {
  app: string
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
  app: string
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
