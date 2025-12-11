import request from '@/utils/http'
import {
  ListFeedbackRequest,
  ListFeedbackReply,
  CreateFeedbackRequest,
  CreateFeedbackReply,
  UpdateFeedbackRequest,
  DeleteFeedbackRequest,
  ListFeedbackClassifyRequest,
  CreateFeedbackClassifyReply,
  CreateFeedbackClassifyRequest,
  DeleteFeedbackClassifyRequest,
  ListFeedbackClassifyReply,
  UpdateFeedbackClassifyRequest
} from './type'

// ListFeedbackClassify 获取反馈类型信息列表
export function ListFeedbackClassify(params: ListFeedbackClassifyRequest) {
  return request.get<ListFeedbackClassifyReply>({ url: '/manager/api/feedback/classifies', params })
}

// CreateFeedbackClassify 创建反馈类型信息
export function CreateFeedbackClassify(data: CreateFeedbackClassifyRequest) {
  return request.post<CreateFeedbackClassifyReply>({ url: '/manager/api/feedback/classify', data })
}

// UpdateFeedbackClassify 更新反馈类型信息
export function UpdateFeedbackClassify(data: UpdateFeedbackClassifyRequest) {
  return request.put({ url: '/manager/api/feedback/classify', data })
}

// DeleteFeedbackClassify 删除反馈类型信息
export function DeleteFeedbackClassify(params: DeleteFeedbackClassifyRequest) {
  return request.del({ url: '/manager/api/feedback/classify', params })
}

// ListFeedback 获取当前可见反馈信息列表
export function ListCurrentFeedback(params?: ListFeedbackRequest) {
  return request.get<ListFeedbackReply>({ url: '/manager/api/feedbacks/current', params })
}

// ListFeedback 获取反馈信息列表
export function ListFeedback(params?: ListFeedbackRequest) {
  return request.get<ListFeedbackReply>({ url: '/manager/api/feedbacks', params })
}

// CreateFeedback 创建反馈信息
export function CreateFeedback(data: CreateFeedbackRequest) {
  return request.post<CreateFeedbackReply>({ url: '/manager/api/feedback', data })
}

// UpdateFeedback 更新反馈信息
export function UpdateFeedback(data: UpdateFeedbackRequest) {
  return request.put({ url: '/manager/api/feedback', data })
}

// DeleteFeedback 删除反馈信息
export function DeleteFeedback(params: DeleteFeedbackRequest) {
  return request.del({ url: '/manager/api/feedback', params })
}
