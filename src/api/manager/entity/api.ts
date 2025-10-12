import axios from 'axios';
import {
	ListEntityReply,
	ListEntityRequest,
	CreateEntityReply,
	CreateEntityRequest,
	UpdateEntityRequest,
	DeleteEntityReply,
	DeleteEntityRequest,
	ListEntityFieldReply,
	ListEntityFieldRequest,
	CreateEntityFieldReply,
	CreateEntityFieldRequest,
	UpdateEntityFieldRequest,
	DeleteEntityFieldReply,
	DeleteEntityFieldRequest,
	GetEntityReply,
	GetEntityRequest,
	LoadEntityRequest,
	ImportEntityRequest,
	ListEntityRuleRequest,
	ListEntityRuleReply,
	CreateEntityRuleReply,
	CreateEntityRuleRequest,
	DeleteEntityRuleReply,
	DeleteEntityRuleRequest,
	UpdateEntityRuleRequest
} from './type';

// ListEntity 获取实体列表
export function LoadEntity(params: LoadEntityRequest) {
	return axios.get<ListEntityReply>(`/${params.app}/api/v1/load/entities`, { params });
}

export function ImportEntity(data: ImportEntityRequest) {
	return axios.post(`/manager/api/v1/import/entities`, data);
}

// ListEntity 获取实体列表
export function ListEntity(params: ListEntityRequest) {
	return axios.get<ListEntityReply>('/manager/api/v1/entities', { params });
}

// CreateEntity 创建实体
export function CreateEntity(data: CreateEntityRequest) {
	return axios.post<CreateEntityReply>('/manager/api/v1/entity', data);
}

// UpdateEntity 更新实体
export function UpdateEntity(data: UpdateEntityRequest) {
	return axios.put('/manager/api/v1/entity', data);
}

// DeleteEntity 删除实体
export function DeleteEntity(params: DeleteEntityRequest) {
	return axios.delete<DeleteEntityReply>('/manager/api/v1/entity', { params });
}

// ListEntityField 获取实体字段列表
export function ListEntityField(params: ListEntityFieldRequest) {
	return axios.get<ListEntityFieldReply>('/manager/api/v1/entity/fields', { params });
}

// CreateEntityField 创建实体字段
export function CreateEntityField(data: CreateEntityFieldRequest) {
	return axios.post<CreateEntityFieldReply>('/manager/api/v1/entity/field', data);
}

// UpdateEntityField 更新实体字段
export function UpdateEntityField(data: UpdateEntityFieldRequest) {
	return axios.put('/manager/api/v1/entity/field', data);
}

// DeleteEntityField 删除实体字段
export function DeleteEntityField(params: DeleteEntityFieldRequest) {
	return axios.delete<DeleteEntityFieldReply>('/manager/api/v1/entity/field', { params });
}

// ListEntityRule 获取实体字段列表
export function ListEntityRule(params: ListEntityRuleRequest) {
	return axios.get<ListEntityRuleReply>('/manager/api/v1/entity/rules', { params });
}

// CreateEntityRule 创建实体字段
export function CreateEntityRule(data: CreateEntityRuleRequest) {
	return axios.post<CreateEntityRuleReply>('/manager/api/v1/entity/rule', data);
}

// UpdateEntityRule 更新实体字段
export function UpdateEntityRule(data: UpdateEntityRuleRequest) {
	return axios.put('/manager/api/v1/entity/rule', data);
}

// DeleteEntityRule 删除实体字段
export function DeleteEntityRule(params: DeleteEntityRuleRequest) {
	return axios.delete<DeleteEntityRuleReply>('/manager/api/v1/entity/rule', { params });
}

// GetEntity 获取指定的实体
export function GetEntity(params: GetEntityRequest) {
	return axios.get<GetEntityReply>('/manager/api/v1/entity', { params });
}
