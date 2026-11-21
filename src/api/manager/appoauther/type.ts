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
  /** 未绑定账号时自动注册 */
  autoRegister?: boolean
  /** 主登录渠道：登录页优先展示，不展示账号密码表单 */
  isPrimary?: boolean
  /** 强制绑定：未绑定身份按用户名直接绑定已有账号 */
  forceBind?: boolean
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
  autoRegister?: boolean
  isPrimary?: boolean
  forceBind?: boolean
}

export interface UpdateAppOAutherRequest {
  id: number
  autoRegister?: boolean
  isPrimary?: boolean
  forceBind?: boolean
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
