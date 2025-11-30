export interface LoginRequest {
  tenant: string
  app: string
  username: string
  password: string
  captchaId: string
  captcha: string
}

export interface LoginReply {
  token: string
}

export interface RegisterRequest {
  tenant: string
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
  tenant: string
  app: string
  username: string
  password: string
  captchaId: string
  captcha: string
  uuid: string
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
  tenant: string
}

export interface OAutherHandleRequest {
  tenant: string
  app: string
  account?: string
  keyword: string
}

export interface OAutherHandleReply {
  uuid: string
  action: string
  value: string
  tip: string
  keyword: string
  codeField: string
}

export interface OAutherLoginRequest {
  tenant: string
  app: string
  keyword: string
  uuid: string
  account?: string
  code: string
}

export interface OAutherLoginReply {
  needBind: boolean
  needInfo: boolean
  token: string
}
