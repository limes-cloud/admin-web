import axios from 'axios';
import {
	ListBusinessReply,
	ListBusinessRequest,
	CreateBusinessReply,
	CreateBusinessRequest,
	UpdateBusinessRequest,
	DeleteBusinessRequest,
	ListBusinessValueReply,
	ListBusinessValueRequest,
	UpdateBusinessValueRequest
} from './type';

// ListBusiness 获取业务配置信息列表
export function ListBusiness(params: ListBusinessRequest) {
	return axios.get<ListBusinessReply>('/configure/api/v1/businesses', { params });
}

// CreateBusiness 创建业务配置信息
export function CreateBusiness(data: CreateBusinessRequest) {
	return axios.post<CreateBusinessReply>('/configure/api/v1/business', data);
}

// UpdateBusiness 更新业务配置信息
export function UpdateBusiness(data: UpdateBusinessRequest) {
	return axios.put('/configure/api/v1/business', data);
}

// DeleteBusiness 删除业务配置信息
export function DeleteBusiness(params: DeleteBusinessRequest) {
	return axios.delete('/configure/api/v1/business', { params });
}

// ListBusinessValue 获取业务配置值信息列表
export function ListBusinessValue(params: ListBusinessValueRequest) {
	return axios.get<ListBusinessValueReply>('/configure/api/v1/business/values', { params });
}

// UpdateBusinessValue 更新业务配置值信息
export function UpdateBusinessValue(data: UpdateBusinessValueRequest) {
	return axios.put('/configure/api/v1/business/values', data);
}
