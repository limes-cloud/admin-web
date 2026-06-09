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
