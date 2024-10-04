import axios from 'axios';
import {
	ListInformationReply,
	ListInformationRequest,
	CreateInformationReply,
	CreateInformationRequest,
	UpdateInformationRequest,
	DeleteInformationRequest,
	GetInformationReply,
	GetInformationRequest,
	CreateInformationClassifyReply,
	CreateInformationClassifyRequest,
	DeleteInformationClassifyRequest,
	ListInformationClassifyReply,
	UpdateInformationClassifyRequest
} from './type';

// ListInformationClassify 获取任务分组列表
export function ListInformationClassify() {
	return axios.get<ListInformationClassifyReply>('/partyaffairs/api/v1/information/classifies');
}

// CreateInformationClassify 创建任务分组
export function CreateInformationClassify(data: CreateInformationClassifyRequest) {
	return axios.post<CreateInformationClassifyReply>('/partyaffairs/api/v1/information/classify', data);
}

// UpdateInformationClassify 更新任务分组
export function UpdateInformationClassify(data: UpdateInformationClassifyRequest) {
	return axios.put('/partyaffairs/api/v1/information/classify', data);
}

// DeleteInformationClassify 删除任务分组
export function DeleteInformationClassify(params: DeleteInformationClassifyRequest) {
	return axios.delete('/partyaffairs/api/v1/information/classify', { params });
}

// ListInformation 获取资讯信息列表
export function GetInformation(params: GetInformationRequest) {
	return axios.get<GetInformationReply>('/partyaffairs/api/v1/information', { params });
}

// ListInformation 获取资讯信息列表
export function ListInformation(params: ListInformationRequest) {
	return axios.get<ListInformationReply>('/partyaffairs/api/v1/informations', { params });
}

// CreateInformation 创建资讯信息
export function CreateInformation(data: CreateInformationRequest) {
	return axios.post<CreateInformationReply>('/partyaffairs/api/v1/information', data);
}

// UpdateInformation 更新资讯信息
export function UpdateInformation(data: UpdateInformationRequest) {
	return axios.put('/partyaffairs/api/v1/information', data);
}

// DeleteInformation 删除资讯信息
export function DeleteInformation(params: DeleteInformationRequest) {
	return axios.delete('/partyaffairs/api/v1/information', { params });
}
