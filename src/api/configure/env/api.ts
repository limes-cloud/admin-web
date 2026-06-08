import request from '@/utils/http'
import {
  ListEnvReply,
  ListEnvRequest,
  CreateEnvReply,
  CreateEnvRequest,
  UpdateEnvRequest,
  DeleteEnvRequest
} from './type'

export function ListEnv(params?: ListEnvRequest) {
  return request.get<ListEnvReply>({ url: '/configure/api/envs', params })
}

export function CreateEnv(data: CreateEnvRequest) {
  return request.post<CreateEnvReply>({ url: '/configure/api/env', data })
}

export function UpdateEnv(data: UpdateEnvRequest) {
  return request.put({ url: '/configure/api/env', data })
}

export function DeleteEnv(params: DeleteEnvRequest) {
  return request.del({ url: '/configure/api/env', params })
}

export function GetEnvToken(id: number) {
  return request.get<{ token: string }>({ url: '/configure/api/env/token', params: { id } })
}

export function ResetEnvToken(id: number) {
  return request.put<{ token: string }>({ url: '/configure/api/env/token', data: { id } })
}
