import axios from 'axios';
import { GetResourceReply, GetResourceRequest, UpdateResourceRequest } from './type';

// GetResourceScopes 获取资源所属部门
export function GetResource(params: GetResourceRequest) {
	return axios.get<GetResourceReply>('/manager/api/v1/resource', { params });
}

// UpdateResourceScopes 更新资源所属部门
export function UpdateResource(data: UpdateResourceRequest) {
	return axios.put(`/manager/api/v1/resource/${data.keyword}`, data);
}
