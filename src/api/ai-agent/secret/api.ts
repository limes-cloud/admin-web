import request from '@/utils/http'
import {
  ListSecretRequest,
  ListSecretReply,
  CreateSecretRequest,
  CreateSecretReply,
  UpdateSecretRequest,
  DeleteSecretRequest,
  ListSecretGroupRequest,
  CreateSecretGroupReply,
  CreateSecretGroupRequest,
  DeleteSecretGroupRequest,
  ListSecretGroupReply,
  UpdateSecretGroupRequest
} from './type'

// ListSupplier 获取密钥供应商列表
export function ListSupplier() {
  return request.get<{ list: string[] }>({ url: '/ai-agent/api/secret/suppliers' })
}

// ListSecret 获取密钥信息列表
export function ListSecret(params?: ListSecretRequest) {
  return request.get<ListSecretReply>({ url: '/ai-agent/api/secrets', params })
}

// CreateSecret 创建密钥信息
export function CreateSecret(data: CreateSecretRequest) {
  return request.post<CreateSecretReply>({ url: '/ai-agent/api/secret', data })
}

// UpdateSecret 更新密钥信息
export function UpdateSecret(data: UpdateSecretRequest) {
  return request.put({ url: '/ai-agent/api/secret', data })
}

// DeleteSecret 删除密钥信息
export function DeleteSecret(params: DeleteSecretRequest) {
  return request.del({ url: '/ai-agent/api/secret', params })
}

// ListSecretGroup 获取密钥类型信息列表
export function ListSecretGroup(params: ListSecretGroupRequest) {
  return request.get<ListSecretGroupReply>({ url: '/ai-agent/api/secret/groups', params })
}

// CreateSecretGroup 创建密钥类型信息
export function CreateSecretGroup(data: CreateSecretGroupRequest) {
  return request.post<CreateSecretGroupReply>({ url: '/ai-agent/api/secret/group', data })
}

// UpdateSecretGroup 更新密钥类型信息
export function UpdateSecretGroup(data: UpdateSecretGroupRequest) {
  return request.put({ url: '/ai-agent/api/secret/group', data })
}

// DeleteSecretGroup 删除密钥类型信息
export function DeleteSecretGroup(params: DeleteSecretGroupRequest) {
  return request.del({ url: '/ai-agent/api/secret/group', params })
}
