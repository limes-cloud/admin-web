import axios from 'axios';
import {
	ListResourceReply,
	ListResourceRequest,
	CreateResourceReply,
	CreateResourceRequest,
	UpdateResourceRequest,
	DeleteResourceRequest
} from './type';

// ListResource 获取文件信息列表
export function ListResource(params: ListResourceRequest) {
	return axios.get<ListResourceReply>('/poverty/api/v1/resources', { params });
}

// CreateResource 创建文件信息
export function CreateResource(data: CreateResourceRequest) {
	return axios.post<CreateResourceReply>('/poverty/api/v1/resource', data);
}

// UpdateResource 更新文件信息
export function UpdateResource(data: UpdateResourceRequest) {
	return axios.put('/poverty/api/v1/resource', data);
}

// DeleteResource 删除文件信息
export function DeleteResource(params: DeleteResourceRequest) {
	return axios.delete('/poverty/api/v1/resource', { params });
}
