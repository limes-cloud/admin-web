import request from '@/utils/http'
import {
  GetResourceReply,
  GetResourceRequest,
  ListResourceReply,
  ListResourceRequest,
  CreateResourceReply,
  CreateResourceRequest,
  UpdateResourceRequest,
  DeleteResourceRequest,
  ListResourceValueReply,
  ListResourceValueRequest,
  UpdateResourceValueRequest
} from './type'

export function GetResource(params?: GetResourceRequest) {
  return request.get<GetResourceReply>({ url: '/configure/api/resource', params })
}

export function ListResource(params: ListResourceRequest) {
  return request.get<ListResourceReply>({ url: '/configure/api/resources', params })
}

export function CreateResource(data: CreateResourceRequest) {
  return request.post<CreateResourceReply>({ url: '/configure/api/resource', data })
}

export function UpdateResource(data: UpdateResourceRequest) {
  return request.put({ url: '/configure/api/resource', data })
}

export function DeleteResource(params: DeleteResourceRequest) {
  return request.del({ url: '/configure/api/resource', params })
}

export function ListResourceValue(params: ListResourceValueRequest) {
  return request.get<ListResourceValueReply>({ url: '/configure/api/resource/values', params })
}

export function UpdateResourceValue(data: UpdateResourceValueRequest) {
  return request.put({ url: '/configure/api/resource/values', data })
}
