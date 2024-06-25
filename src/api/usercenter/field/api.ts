import axios from 'axios';
import {
	ListFieldReply,
	ListFieldRequest,
	CreateFieldReply,
	CreateFieldRequest,
	UpdateFieldRequest,
	UpdateFieldStatusRequest,
	DeleteFieldReply,
	DeleteFieldRequest,
	FieldType
} from './type';

// ListFieldType 获取可用的字段类型列表
export function ListFieldType() {
	return axios.get<{ list: FieldType[] }>('/usercenter/api/v1/field/types');
}

// ListField 获取用户字段列表
export function ListField(params: ListFieldRequest) {
	return axios.get<ListFieldReply>('/usercenter/api/v1/fields', { params });
}

// CreateField 创建用户字段
export function CreateField(data: CreateFieldRequest) {
	return axios.post<CreateFieldReply>('/usercenter/api/v1/field', data);
}

// UpdateField 更新用户字段
export function UpdateField(data: UpdateFieldRequest) {
	return axios.put('/usercenter/api/v1/field', data);
}

// UpdateFieldStatus 更新用户字段状态
export function UpdateFieldStatus(data: UpdateFieldStatusRequest) {
	return axios.put('/usercenter/api/v1/field/status', data);
}

// DeleteField 删除用户字段
export function DeleteField(params: DeleteFieldRequest) {
	return axios.delete<DeleteFieldReply>('/usercenter/api/v1/field', { params });
}
