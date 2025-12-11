import request from '@/utils/http'
import {
  ListNoticeRequest,
  ListNoticeReply,
  CreateNoticeRequest,
  CreateNoticeReply,
  UpdateNoticeRequest,
  DeleteNoticeRequest,
  CreateNoticeClassifyReply,
  CreateNoticeClassifyRequest,
  DeleteNoticeClassifyRequest,
  ListNoticeClassifyReply,
  UpdateNoticeClassifyRequest,
  GetNoticeRequest,
  Notice
} from './type'

// ListNotice 获取通知信息列表
export function GetNotice(params?: GetNoticeRequest) {
  return request.get<Notice>({ url: '/manager/api/notice', params })
}

// ListNotice 获取通知信息列表
export function ListNotice(params?: ListNoticeRequest) {
  return request.get<ListNoticeReply>({ url: '/manager/api/notices', params })
}

// GetVisibleNotice 获取通知信息列表
export function GetVisibleNotice(params?: GetNoticeRequest) {
  return request.get<Notice>({ url: '/manager/api/visible-notice', params })
}

// ListNotice 获取通知信息列表
export function ListVisibleNotice(params?: ListNoticeRequest) {
  return request.get<ListNoticeReply>({ url: '/manager/api/visible-notices', params })
}

// CreateNotice 创建通知信息
export function CreateNotice(data: CreateNoticeRequest) {
  return request.post<CreateNoticeReply>({ url: '/manager/api/notice', data })
}

// UpdateNotice 更新通知信息
export function UpdateNotice(data: UpdateNoticeRequest) {
  return request.put({ url: '/manager/api/notice', data })
}

// DeleteNotice 删除通知信息
export function DeleteNotice(params: DeleteNoticeRequest) {
  return request.del({ url: '/manager/api/notice', params })
}

// ListNoticeClassify 获取通知类型信息列表
export function ListNoticeClassify() {
  return request.get<ListNoticeClassifyReply>({ url: '/manager/api/notice/classifies' })
}

// CreateNoticeClassify 创建通知类型信息
export function CreateNoticeClassify(data: CreateNoticeClassifyRequest) {
  return request.post<CreateNoticeClassifyReply>({ url: '/manager/api/notice/classify', data })
}

// UpdateNoticeClassify 更新通知类型信息
export function UpdateNoticeClassify(data: UpdateNoticeClassifyRequest) {
  return request.put({ url: '/manager/api/notice/classify', data })
}

// DeleteNoticeClassify 删除通知类型信息
export function DeleteNoticeClassify(params: DeleteNoticeClassifyRequest) {
  return request.del({ url: '/manager/api/notice/classify', params })
}
