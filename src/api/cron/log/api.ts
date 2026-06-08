import request from '@/utils/http'
import { GetLogReply, GetLogRequest, ListLogReply, ListLogRequest, DeleteLogReply, DeleteLogRequest } from './type'

export function GetLog(params?: GetLogRequest) {
  return request.get<GetLogReply>({ url: '/cron/api/v1/log', params })
}

export function ListLog(params: ListLogRequest) {
  return request.get<ListLogReply>({ url: '/cron/api/v1/logs', params })
}

export function DeleteLog(params: DeleteLogRequest) {
  return request.del<DeleteLogReply>({ url: '/cron/api/v1/log', params })
}
