import axios from 'axios';
import {
	ListInformationReply,
	ListInformationRequest,
	CreateInformationReply,
	CreateInformationRequest,
	UpdateInformationRequest,
	DeleteInformationRequest,
	GetInformationReply,
	GetInformationRequest
} from './type';

// ListInformation 获取资讯信息列表
export function GetInformation(params: GetInformationRequest) {
	return axios.get<GetInformationReply>('/poverty/api/v1/information', { params });
}

// ListInformation 获取资讯信息列表
export function ListInformation(params: ListInformationRequest) {
	return axios.get<ListInformationReply>('/poverty/api/v1/informations', { params });
}

// CreateInformation 创建资讯信息
export function CreateInformation(data: CreateInformationRequest) {
	return axios.post<CreateInformationReply>('/poverty/api/v1/information', data);
}

// UpdateInformation 更新资讯信息
export function UpdateInformation(data: UpdateInformationRequest) {
	return axios.put('/poverty/api/v1/information', data);
}

// DeleteInformation 删除资讯信息
export function DeleteInformation(params: DeleteInformationRequest) {
	return axios.delete('/poverty/api/v1/information', { params });
}
