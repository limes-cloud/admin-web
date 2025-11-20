import request from '@/utils/http'
import { ListAuthLogReply, ListAuthLogRequest, ListLoginLogReply, ListLoginLogRequest } from './type'

// ListLoginLog 获取登陆日志
export function ListLoginLog(params?: ListLoginLogRequest) {
  return request.get<ListLoginLogReply>({ url: '/manager/api/login/logs', params })
}

// ListAuthLog 获取鉴权日志
export function ListAuthLog(params: ListAuthLogRequest) {
  return request.get<ListAuthLogReply>({ url: '/manager/api/auth/logs', params })
}
