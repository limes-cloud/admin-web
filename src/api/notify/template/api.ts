import axios from 'axios';
import {
	CreateTemplateReply,
	CreateTemplateRequest,
	DeleteTemplateRequest,
	ListTemplateReply,
	ListTemplateRequest,
	UpdateTemplateRequest
} from './type';

// ListTemplate 获取通知列表
export function ListTemplate(params: ListTemplateRequest) {
	return axios.get<ListTemplateReply>('/notify/api/v1/templates', { params });
}

// CreateTemplate 创建通知
export function CreateTemplate(data: CreateTemplateRequest) {
	return axios.post<CreateTemplateReply>('/notify/api/v1/template', data);
}

// UpdateTemplate 更新通知
export function UpdateTemplate(data: UpdateTemplateRequest) {
	return axios.put('/notify/api/v1/template', data);
}

// DeleteTemplate 删除通知
export function DeleteTemplate(params: DeleteTemplateRequest) {
	return axios.delete('/notify/api/v1/template', { params });
}
