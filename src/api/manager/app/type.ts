export interface GetAppRequest {
  id: number
}

export interface GetSampleAppRequest {
  keyword: string
}

export interface InitAppRequest {
  domain?: string
  appId?: string
  platform?: string
}

export interface AppSetting {
  web?: {
    watermark?: string
    copyright?: string
    /** 已迁移至 user.defaultPassword，仅作旧数据兜底 */
    defaultPassword?: string
  }
  /** 用户配置 */
  user?: AppSettingUser
  seo?: AppSettingSEO
  /** 私有推送配置，仅管理端可见，不会通过 init 接口下发 */
  seoPush?: AppSettingSEOPush
  jwt: {
    secret: string
    expire: number
    renewal: number
    uniqueDevice: boolean
    uniquePlatform: boolean
  }
  /** 订阅的基础设施应用（type=base）keyword 列表，用于菜单下发与接口鉴权 */
  modules?: string[]
  tracker?: AppSettingTracker
  /** 管理员邮箱，用于接收应用相关的系统通知 */
  adminEmail?: string
}

export interface AppSettingUser {
  /** 默认头像，新建用户未设置头像以及用户头像为空时使用 */
  defaultAvatar?: string
  /** 默认登录密码，新增用户未填写密码以及重置密码时使用 */
  defaultPassword?: string
}

export interface AppSettingTracker {
  /** 是否允许该应用向 manager 上报点位数据 */
  enable?: boolean
  /** 允许上报的 Origin 白名单；为空表示不校验 */
  origins?: string[]
  /** 自动注册点位上限，0 使用服务端默认值 */
  maxPoints?: number
  /** 全站转化点位 key，为空时不展示转化次数 */
  conversionPoint?: string
}

export interface AppSettingSEOExternalLink {
  group?: string
  label?: string
  url?: string
  rel?: string
  enabled?: boolean
  sort?: number
}

export interface AppSettingSEO {
  enabled?: boolean
  homeTitle?: string
  description?: string
  keywords?: string
  titleTemplate?: string
  canonicalDomain?: string
  robots?: string
  indexMode?: 'all' | 'home' | 'none'
  sitemapEnabled?: boolean
  homeHtml?: string
  contactEmail?: string
  sameAs?: string[]
  externalLinks?: AppSettingSEOExternalLink[]
}

export interface AppSettingSEOPushCounter {
  date?: string
  count?: number
}

export interface AppSettingSEOPushPlatform {
  dailyLimit?: number
  verification?: string
  config?: Record<string, string>
  push?: Record<string, AppSettingSEOPushCounter>
}

export interface AppSettingSEOPush {
  autoPushOnPublish?: boolean
  platforms?: Record<string, AppSettingSEOPushPlatform>
}

export interface AppSettingSEOPushFieldOption {
  label?: string
  value?: string
}

export interface AppSettingSEOPushField {
  key?: string
  label?: string
  type?: 'text' | 'password' | 'number' | 'select'
  placeholder?: string
  tip?: string
  required?: boolean
  secret?: boolean
  span?: number
  options?: AppSettingSEOPushFieldOption[]
}

export interface AppSettingSEOPushPlatformMeta {
  key: string
  label: string
  description?: string
  supportsPush?: boolean
  supportsVerification?: boolean
  verificationMeta?: string
  verificationLabel?: string
  verificationPlaceholder?: string
  defaultDailyLimit?: number
  fields?: AppSettingSEOPushField[]
}

export interface ListSEOPushPlatformsReply {
  list: AppSettingSEOPushPlatformMeta[]
}

export interface PushSEORequest {
  id: number
  platform: string
  urls?: string[]
}

export interface PushSEOReply {
  platform: string
  success: number
  invalid: number
  remain: number
  message?: string
  pushedUrls?: string[]
}

export interface AppDomain {
  domain: string
  isPrimary: boolean
}

export interface AppMiniProgram {
  appId: string
  platform: string
}

export interface App {
  id: number
  groupId: number
  type: string
  logo: string
  favicon: string
  keyword: string
  name: string
  showName: string
  comment?: string
  status?: boolean
  reason?: string
  private?: boolean
  /** 是否可作为登录入口 */
  loginable?: boolean
  setting?: AppSetting
  /** 应用绑定的访问域名 */
  domains?: AppDomain[]
  /** 应用绑定的小程序 */
  miniPrograms?: AppMiniProgram[]
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
  groupId?: number
  query?: string
}

export interface ListAccessibleAppRequest {
  app?: string
}

export interface ListAppReply {
  total: number
  list: App[]
}

export interface CreateAppRequest {
  groupId: number
  type: string
  logo: string
  favicon: string
  keyword: string
  name: string
  comment?: string
  private: boolean
  /** 是否可作为登录入口 */
  loginable?: boolean
  description?: string
  setting: AppSetting
  /** 创建时一并绑定的访问域名 */
  domains?: AppDomain[]
  /** 创建时一并绑定的小程序 */
  miniPrograms?: AppMiniProgram[]
}

export interface CreateAppReply {
  id: number
}

export interface UpdateAppRequest {
  id: number
  groupId?: number
  logo?: string
  name?: string
  comment?: string
  status?: boolean
  reason?: string
  private?: boolean
  /** 是否可作为登录入口 */
  loginable?: boolean
  description?: string
  setting?: AppSetting
  /** 不传 = 保持域名不变；传入（含空数组）= 全量替换 */
  domains?: AppDomain[]
  /** 不传 = 保持小程序绑定不变；传入（含空数组）= 全量替换 */
  miniPrograms?: AppMiniProgram[]
}

export interface DeleteAppRequest {
  id: number
}

export interface AppGroup {
  id: number
  name: string
  sort: number
  createdAt: number
  updatedAt: number
}

export interface ListAppGroupReply {
  list: AppGroup[]
}

export interface CreateAppGroupRequest {
  name: string
  sort: number
}

export interface CreateAppGroupReply {
  id: number
}

export interface UpdateAppGroupRequest {
  id: number
  name?: string
  sort?: number
}

export interface DeleteAppGroupRequest {
  id: number
}
