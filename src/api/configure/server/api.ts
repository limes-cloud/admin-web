import request from '@/utils/http'
import {
  ListServerReply,
  ListServerRequest,
  CreateServerReply,
  CreateServerRequest,
  UpdateServerRequest,
  DeleteServerRequest
} from './type'

export function ListServer(params: ListServerRequest) {
  return request.get<ListServerReply>({ url: '/configure/api/servers', params })
}

export function CreateServer(data: CreateServerRequest) {
  return request.post<CreateServerReply>({ url: '/configure/api/server', data })
}

export function UpdateServer(data: UpdateServerRequest) {
  return request.put({ url: '/configure/api/server', data })
}

export function DeleteServer(params: DeleteServerRequest) {
  return request.del({ url: '/configure/api/server', params })
}
