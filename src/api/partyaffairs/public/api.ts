import axios from 'axios';
import {
	ListPublicReply,
	ListPublicRequest,
	CreatePublicReply,
	CreatePublicRequest,
	UpdatePublicRequest,
	DeletePublicRequest,
	GetPublicReply,
	GetPublicRequest,
	CreatePublicClassifyReply,
	CreatePublicClassifyRequest,
	DeletePublicClassifyRequest,
	ListPublicClassifyReply,
	UpdatePublicClassifyRequest
} from './type';

// ListPublicClassify 获取任务分组列表
export function ListPublicClassify() {
	return axios.get<ListPublicClassifyReply>('/partyaffairs/api/v1/public/classifies');
}

// CreatePublicClassify 创建任务分组
export function CreatePublicClassify(data: CreatePublicClassifyRequest) {
	return axios.post<CreatePublicClassifyReply>('/partyaffairs/api/v1/public/classify', data);
}

// UpdatePublicClassify 更新任务分组
export function UpdatePublicClassify(data: UpdatePublicClassifyRequest) {
	return axios.put('/partyaffairs/api/v1/public/classify', data);
}

// DeletePublicClassify 删除任务分组
export function DeletePublicClassify(params: DeletePublicClassifyRequest) {
	return axios.delete('/partyaffairs/api/v1/public/classify', { params });
}

// ListPublic 获取资讯信息列表
export function GetPublic(params: GetPublicRequest) {
	return axios.get<GetPublicReply>('/partyaffairs/api/v1/public', { params });
}

// ListPublic 获取资讯信息列表
export function ListPublic(params: ListPublicRequest) {
	return axios.get<ListPublicReply>('/partyaffairs/api/v1/publics', { params });
}

// CreatePublic 创建资讯信息
export function CreatePublic(data: CreatePublicRequest) {
	return axios.post<CreatePublicReply>('/partyaffairs/api/v1/public', data);
}

// UpdatePublic 更新资讯信息
export function UpdatePublic(data: UpdatePublicRequest) {
	return axios.put('/partyaffairs/api/v1/public', data);
}

// DeletePublic 删除资讯信息
export function DeletePublic(params: DeletePublicRequest) {
	return axios.delete('/partyaffairs/api/v1/public', { params });
}
