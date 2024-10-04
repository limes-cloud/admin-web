import axios from 'axios';
import {
	ListResourceReply,
	ListResourceRequest,
	CreateResourceReply,
	CreateResourceRequest,
	UpdateResourceRequest,
	DeleteResourceRequest,
	GetResourceReply,
	GetResourceRequest,
	CreateResourceClassifyReply,
	CreateResourceClassifyRequest,
	DeleteResourceClassifyRequest,
	ListResourceClassifyReply,
	UpdateResourceClassifyRequest
} from './type';

// ListResourceClassify 获取任务分组列表
export function ListResourceClassify() {
	return axios.get<ListResourceClassifyReply>('/partyaffairs/api/v1/resource/classifies');
}

// CreateResourceClassify 创建任务分组
export function CreateResourceClassify(data: CreateResourceClassifyRequest) {
	return axios.post<CreateResourceClassifyReply>('/partyaffairs/api/v1/resource/classify', data);
}

// UpdateResourceClassify 更新任务分组
export function UpdateResourceClassify(data: UpdateResourceClassifyRequest) {
	return axios.put('/partyaffairs/api/v1/resource/classify', data);
}

// DeleteResourceClassify 删除任务分组
export function DeleteResourceClassify(params: DeleteResourceClassifyRequest) {
	return axios.delete('/partyaffairs/api/v1/resource/classify', { params });
}

// ListResource 获取资讯信息列表
export function GetResource(params: GetResourceRequest) {
	return axios.get<GetResourceReply>('/partyaffairs/api/v1/resource', { params });
}

// ListResource 获取资讯信息列表
export function ListResource(params: ListResourceRequest) {
	return axios.get<ListResourceReply>('/partyaffairs/api/v1/resources', { params });
}

// CreateResource 创建资讯信息
export function CreateResource(data: CreateResourceRequest) {
	return axios.post<CreateResourceReply>('/partyaffairs/api/v1/resource', data);
}

// UpdateResource 更新资讯信息
export function UpdateResource(data: UpdateResourceRequest) {
	return axios.put('/partyaffairs/api/v1/resource', data);
}

// DeleteResource 删除资讯信息
export function DeleteResource(params: DeleteResourceRequest) {
	return axios.delete('/partyaffairs/api/v1/resource', { params });
}
