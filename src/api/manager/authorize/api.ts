import request from '@/utils/http'
import {
  BindReply,
  BindRequest,
  FillInfoItem,
  FillInfoRequest,
  GetImageCaptchaReply,
  GetImageCaptchaRquest,
  ListFillInfoRequest,
  ListOAutherRequest,
  LoginReply,
  LoginRequest,
  OAuther,
  OAutherHandleReply,
  OAutherHandleRequest,
  OAutherLoginReply,
  OAutherLoginRequest,
  RegisterReply,
  RegisterRequest
} from './type'

// GetImageCaptcha 获取图像验证码
export function GetImageCaptcha(params: GetImageCaptchaRquest) {
  return request.get<GetImageCaptchaReply>({ url: '/manager/api/authorize/captcha/image', params })
}

export function OAutherLogin(data: OAutherLoginRequest) {
  return request.post<OAutherLoginReply>({ url: '/manager/api/authorize/oauther/login', data })
}

export function Login(data: LoginRequest) {
  return request.post<LoginReply>({ url: '/manager/api/authorize/login', data })
}

export function Register(data: RegisterRequest) {
  return request.post<RegisterReply>({ url: '/manager/api/authorize/register', data })
}

export function Bind(data: BindRequest) {
  return request.post<BindReply>({ url: '/manager/api/authorize/oauther/bind', data })
}

// ListOAuther 获取租户应用授权信息列表
export function ListOAuther(params: ListOAutherRequest) {
  return request.get<{ list: OAuther[] }>({ url: '/manager/api/authorize/oauthers', params })
}

// ListOAuther 获取租户应用授权信息列表
export function OAutherHandle(params: OAutherHandleRequest) {
  return request.post<OAutherHandleReply>({ url: '/manager/api/authorize/oauther/handler', params })
}

// GetFileInfo 获取租户应用授权信息列表
export function ListFileInfo(params: ListFillInfoRequest) {
  return request.get<{ list: FillInfoItem[] }>({ url: '/manager/api/authorize/fill/infos', params })
}

// FillInfo 补充用户信息
export function FillInfo(params: FillInfoRequest) {
  return request.post<{ token: string }>({ url: '/manager/api/authorize/fill/infos', params })
}
