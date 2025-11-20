import request from '@/utils/http'
import {
  ListEntityRequest,
  ListEntityReply,
  CreateEntityRequest,
  CreateEntityReply,
  UpdateEntityRequest,
  DeleteEntityRequest,
  ListEntityFieldRequest,
  CreateEntityFieldReply,
  CreateEntityFieldRequest,
  DeleteEntityFieldRequest,
  ListEntityFieldReply,
  UpdateEntityFieldRequest,
  ImportEntityRequest,
  LoadEntityRequest,
  LoadEntityReply,
  CreateEntityRuleReply,
  CreateEntityRuleRequest,
  DeleteEntityRuleRequest,
  ListEntityRuleReply,
  ListEntityRuleRequest,
  UpdateEntityRuleRequest
} from './type'

export function ImportEntity(data: ImportEntityRequest) {
  return request.post<LoadEntityReply>({ url: '/manager/api/entity/import', data })
}

// ListEntity 载入实体信息列表
export function LoadEntity(params: LoadEntityRequest) {
  return request.get<LoadEntityReply>({ url: `/${params.app}/api/entity/load`, params })
}

// ListEntity 获取实体信息列表
export function ListEntity(params: ListEntityRequest) {
  return request.get<ListEntityReply>({ url: '/manager/api/entities', params })
}

// CreateEntity 创建实体信息
export function CreateEntity(data: CreateEntityRequest) {
  return request.post<CreateEntityReply>({ url: '/manager/api/entity', data })
}

// UpdateEntity 更新实体信息
export function UpdateEntity(data: UpdateEntityRequest) {
  return request.put({ url: '/manager/api/entity', data })
}

// DeleteEntity 删除实体信息
export function DeleteEntity(params: DeleteEntityRequest) {
  return request.del({ url: '/manager/api/entity', params })
}

// ListEntityField 获取实体字段信息列表
export function ListEntityField(params: ListEntityFieldRequest) {
  return request.get<ListEntityFieldReply>({ url: '/manager/api/entity/fields', params })
}

// CreateEntityField 创建实体字段信息
export function CreateEntityField(data: CreateEntityFieldRequest) {
  return request.post<CreateEntityFieldReply>({ url: '/manager/api/entity/field', data })
}

// UpdateEntityField 更新实体字段信息
export function UpdateEntityField(data: UpdateEntityFieldRequest) {
  return request.put({ url: '/manager/api/entity/field', data })
}

// DeleteEntityField 删除实体字段信息
export function DeleteEntityField(params: DeleteEntityFieldRequest) {
  return request.del({ url: '/manager/api/entity/field', params })
}

// ListEntityRule 获取实体规则信息列表
export function ListEntityRule(params: ListEntityRuleRequest) {
  return request.get<ListEntityRuleReply>({ url: '/manager/api/entity/rules', params })
}

// CreateEntityRule 创建实体规则信息
export function CreateEntityRule(data: CreateEntityRuleRequest) {
  return request.post<CreateEntityRuleReply>({ url: '/manager/api/entity/rule', data })
}

// UpdateEntityRule 更新实体规则信息
export function UpdateEntityRule(data: UpdateEntityRuleRequest) {
  return request.put({ url: '/manager/api/entity/rule', data })
}

// DeleteEntityRule 删除实体规则信息
export function DeleteEntityRule(params: DeleteEntityRuleRequest) {
  return request.del({ url: '/manager/api/entity/rule', params })
}
