import axios from 'axios';
import {
	GetResourceReply,
	GetResourceRequest,
	ListResourceReply,
	ListResourceRequest,
	CreateResourceReply,
	CreateResourceRequest,
	UpdateResourceRequest,
	DeleteResourceReply,
	DeleteResourceRequest,
	ListResourceValueRequest,
	ListResourceValueReply,
	UpdateResourceValueRequest
} from './type';

// GetResource 获取指定的资源配置信息
export function GetResource(params?: GetResourceRequest) {
	return axios.get<GetResourceReply>('/configure/api/v1/resource', { params });
}

// ListResource 获取资源配置信息列表
export function ListResource(params: ListResourceRequest) {
	return axios.get<ListResourceReply>('/configure/api/v1/resources', { params });
}

// CreateResource 创建资源配置信息
export function CreateResource(data: CreateResourceRequest) {
	return axios.post<CreateResourceReply>('/configure/api/v1/resource', data);
}

// UpdateResource 更新资源配置信息
export function UpdateResource(data: UpdateResourceRequest) {
	return axios.put('/configure/api/v1/resource', data);
}

// DeleteResource 删除资源配置信息
export function DeleteResource(params: DeleteResourceRequest) {
	return axios.delete<DeleteResourceReply>('/configure/api/v1/resource', { params });
}

// ListResourceValue 获取业务配置值信息列表
export function ListResourceValue(params: ListResourceValueRequest) {
	return axios.get<ListResourceValueReply>('/configure/api/v1/resource/values', { params });
}

// UpdateResourceValue 更新业务配置值信息
export function UpdateResourceValue(data: UpdateResourceValueRequest) {
	return axios.put('/configure/api/v1/resource/values', data);
}
