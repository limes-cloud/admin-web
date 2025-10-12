import axios from 'axios';
import {
	ListFieldReply,
	ListFieldRequest,
	CreateFieldReply,
	CreateFieldRequest,
	UpdateFieldRequest,
	UpdateFieldStatusRequest,
	DeleteFieldRequest,
	FieldType
} from './type';

// ListFieldType 获取可用的字段类型列表
export function ListFieldType() {
	return axios.get<{ list: FieldType[] }>('/manager/api/v1/field/types');
}

// ListField 获取用户字段列表
export function ListField(params: ListFieldRequest) {
	return axios.get<ListFieldReply>('/manager/api/v1/fields', { params });
}

// CreateField 创建用户字段
export function CreateField(data: CreateFieldRequest) {
	return axios.post<CreateFieldReply>('/manager/api/v1/field', data);
}

// UpdateField 更新用户字段
export function UpdateField(data: UpdateFieldRequest) {
	return axios.put('/manager/api/v1/field', data);
}

// DeleteField 删除用户字段
export function DeleteField(params: DeleteFieldRequest) {
	return axios.delete('/manager/api/v1/field', { params });
}
