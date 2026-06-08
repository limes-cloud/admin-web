import request from '@/utils/http'
import {
  ListModelRequest,
  ListModelReply,
  CreateModelRequest,
  CreateModelReply,
  UpdateModelRequest,
  DeleteModelRequest
} from './type'

// ListModel 获取模型类型列表
export function ListModelType() {
  return request.get<{ list: string[] }>({ url: '/ai-agent/api/model/types' })
}

// ListModel 获取模型信息列表
export function ListModel(params?: ListModelRequest) {
  return request.get<ListModelReply>({ url: '/ai-agent/api/models', params })
}

// CreateModel 创建模型信息
export function CreateModel(data: CreateModelRequest) {
  return request.post<CreateModelReply>({ url: '/ai-agent/api/model', data })
}

// UpdateModel 更新模型信息
export function UpdateModel(data: UpdateModelRequest) {
  return request.put({ url: '/ai-agent/api/model', data })
}

// DeleteModel 删除模型信息
export function DeleteModel(params: DeleteModelRequest) {
  return request.del({ url: '/ai-agent/api/model', params })
}
