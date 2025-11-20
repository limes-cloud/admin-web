import request from '@/utils/http'
import {
  ListInformationRequest,
  ListInformationReply,
  CreateInformationRequest,
  CreateInformationReply,
  UpdateInformationRequest,
  DeleteInformationRequest,
  GetInformationRequest,
  Information,
  CreateInformationClassifyReply,
  CreateInformationClassifyRequest,
  DeleteInformationClassifyRequest,
  ListInformationClassifyReply,
  UpdateInformationClassifyRequest,
  ListInformationClassifyRequest
} from './type'

// ListInformationClassify 获取通知信息列表
export function ListInformationClassify(params: ListInformationClassifyRequest) {
  return request.get<ListInformationClassifyReply>({ url: '/manager/api/information/classifies', params })
}

// CreateInformationClassify 创建通知信息
export function CreateInformationClassify(data: CreateInformationClassifyRequest) {
  return request.post<CreateInformationClassifyReply>({ url: '/manager/api/information/classify', data })
}

// UpdateInformationClassify 更新通知信息
export function UpdateInformationClassify(data: UpdateInformationClassifyRequest) {
  return request.put({ url: '/manager/api/information/classify', data })
}

// DeleteInformationClassify 删除通知信息
export function DeleteInformationClassify(params: DeleteInformationClassifyRequest) {
  return request.del({ url: '/manager/api/information/classify', params })
}

// ListInformation 获取通知信息列表
export function GetInformation(params: GetInformationRequest) {
  return request.get<Information>({ url: '/manager/api/information', params })
}

// ListInformation 获取通知信息列表
export function ListInformation(params: ListInformationRequest) {
  return request.get<ListInformationReply>({ url: '/manager/api/informations', params })
}

// CreateInformation 创建通知信息
export function CreateInformation(data: CreateInformationRequest) {
  return request.post<CreateInformationReply>({ url: '/manager/api/information', data })
}

// UpdateInformation 更新通知信息
export function UpdateInformation(data: UpdateInformationRequest) {
  return request.put({ url: '/manager/api/information', data })
}

// DeleteInformation 删除通知信息
export function DeleteInformation(params: DeleteInformationRequest) {
  return request.del({ url: '/manager/api/information', params })
}
