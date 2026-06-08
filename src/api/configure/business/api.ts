import request from '@/utils/http'
import {
  ListBusinessReply,
  ListBusinessRequest,
  CreateBusinessReply,
  CreateBusinessRequest,
  UpdateBusinessRequest,
  DeleteBusinessRequest,
  ListBusinessValueReply,
  ListBusinessValueRequest,
  UpdateBusinessValueRequest
} from './type'

export function ListBusiness(params: ListBusinessRequest) {
  return request.get<ListBusinessReply>({ url: '/configure/api/businesses', params })
}

export function CreateBusiness(data: CreateBusinessRequest) {
  return request.post<CreateBusinessReply>({ url: '/configure/api/business', data })
}

export function UpdateBusiness(data: UpdateBusinessRequest) {
  return request.put({ url: '/configure/api/business', data })
}

export function DeleteBusiness(params: DeleteBusinessRequest) {
  return request.del({ url: '/configure/api/business', params })
}

export function ListBusinessValue(params: ListBusinessValueRequest) {
  return request.get<ListBusinessValueReply>({ url: '/configure/api/business/values', params })
}

export function UpdateBusinessValue(data: UpdateBusinessValueRequest) {
  return request.put({ url: '/configure/api/business/values', data })
}
