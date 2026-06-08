import request from '@/utils/http'
import {
  ListPromptRequest,
  ListPromptReply,
  CreatePromptRequest,
  CreatePromptReply,
  UpdatePromptRequest,
  DeletePromptRequest,
  ListPromptClassifyRequest,
  CreatePromptClassifyReply,
  CreatePromptClassifyRequest,
  DeletePromptClassifyRequest,
  ListPromptClassifyReply,
  UpdatePromptClassifyRequest
} from './type'

// ListPrompt 获取密钥信息列表
export function ListPrompt(params?: ListPromptRequest) {
  return request.get<ListPromptReply>({ url: '/ai-agent/api/prompts', params })
}

// CreatePrompt 创建密钥信息
export function CreatePrompt(data: CreatePromptRequest) {
  return request.post<CreatePromptReply>({ url: '/ai-agent/api/prompt', data })
}

// UpdatePrompt 更新密钥信息
export function UpdatePrompt(data: UpdatePromptRequest) {
  return request.put({ url: '/ai-agent/api/prompt', data })
}

// DeletePrompt 删除密钥信息
export function DeletePrompt(params: DeletePromptRequest) {
  return request.del({ url: '/ai-agent/api/prompt', params })
}

// ListPromptClassify 获取密钥类型信息列表
export function ListPromptClassify(params: ListPromptClassifyRequest) {
  return request.get<ListPromptClassifyReply>({ url: '/ai-agent/api/prompt/classifies', params })
}

// CreatePromptClassify 创建密钥类型信息
export function CreatePromptClassify(data: CreatePromptClassifyRequest) {
  return request.post<CreatePromptClassifyReply>({ url: '/ai-agent/api/prompt/classify', data })
}

// UpdatePromptClassify 更新密钥类型信息
export function UpdatePromptClassify(data: UpdatePromptClassifyRequest) {
  return request.put({ url: '/ai-agent/api/prompt/classify', data })
}

// DeletePromptClassify 删除密钥类型信息
export function DeletePromptClassify(params: DeletePromptClassifyRequest) {
  return request.del({ url: '/ai-agent/api/prompt/classify', params })
}
