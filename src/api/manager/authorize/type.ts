export interface LoginRequest {
  app: string
  username: string
  password: string
  captchaId: string
  captcha: string
}

export interface LoginReply {
  needInfo: boolean
  token: string
}

export interface RegisterRequest {
  app: string
  username: string
  password: string
  captchaId: string
  captcha: string
}

export interface RegisterReply {
  token: string
}

export interface BindRequest {
  username: string
  password: string
  captchaId: string
  captcha: string
  uuid: string
  register: boolean
}

export interface BindReply {
  token: string
}

export interface GetImageCaptchaRquest {
  scene: string
}

export interface GetImageCaptchaReply {
  uuid: string
  captcha: string
  expire: number
}

export interface OAuther {
  id: number
  logo: string
  keyword: string
  name: string
  type: string
  /** 推荐文案（渠道实现给出，或渠道配置的描述） */
  recommendText?: string
  /** 主登录渠道：登录页优先展示，不展示账号密码表单 */
  primary?: boolean
}

export interface ListOAutherRequest {
  app: string
  platform: string
}

export interface OAutherHandleRequest {
  app: string
  account?: string
  keyword: string
  platform: string
}

export interface OAutherHandleReply {
  uuid: string
  action: string
  value: string
  tip: string
  keyword: string
  codeField: string
}

export interface OAutherReportRequest {
  uuid: string
  code?: string
}

export interface OAutherLoginRequest {
  uuid: string
  keyword?: string
  account?: string
  code?: string
}

export interface OAutherLoginReply {
  needBind: boolean
  needInfo: boolean
  token: string
}

export interface ListFillInfoRequest {
  uuid: string
}

export interface FillInfoItem {
  type: string
  keyword: string
  name: string
  value: any
}

export interface FillInfoRequest {
  uuid: string
  infos: Record<string, any>
}
