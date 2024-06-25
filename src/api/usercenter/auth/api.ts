import axios from 'axios';
import {
	ListAuthReply,
	ListAuthRequest,
	CreateAuthReply,
	CreateAuthRequest,
	UpdateAuthStatusRequest,
	DeleteAuthReply,
	DeleteAuthRequest
} from './type';

// ListAuth 获取应用授权信息列表
export function ListAuth(params: ListAuthRequest) {
	return axios.get<ListAuthReply>('/usercenter/api/v1/auths', { params });
}

// CreateAuth 创建应用授权信息
export function CreateAuth(data: CreateAuthRequest) {
	return axios.post<CreateAuthReply>('/usercenter/api/v1/auth', data);
}

// UpdateAuthStatus 更新应用授权信息状态
export function UpdateAuthStatus(data: UpdateAuthStatusRequest) {
	return axios.put('/usercenter/api/v1/auth/status', data);
}

// DeleteAuth 删除应用授权信息
export function DeleteAuth(params: DeleteAuthRequest) {
	return axios.delete<DeleteAuthReply>('/usercenter/api/v1/auth', { params });
}
