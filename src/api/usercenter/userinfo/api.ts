import axios from 'axios';
import {
	ListUserinfoReply,
	ListUserinfoRequest,
	CreateUserinfoReply,
	CreateUserinfoRequest,
	UpdateUserinfoRequest,
	DeleteUserinfoReply,
	DeleteUserinfoRequest
} from './type';

// ListUserinfo 获取用户扩展信息列表
export function ListUserinfo(params: ListUserinfoRequest) {
	return axios.get<ListUserinfoReply>('/usercenter/api/v1/userinfoes', { params });
}

// CreateUserinfo 创建用户扩展信息
export function CreateUserinfo(data: CreateUserinfoRequest) {
	return axios.post<CreateUserinfoReply>('/usercenter/api/v1/userinfo', data);
}

// UpdateUserinfo 更新用户扩展信息
export function UpdateUserinfo(data: UpdateUserinfoRequest) {
	return axios.put('/usercenter/api/v1/userinfo', data);
}

// DeleteUserinfo 删除用户扩展信息
export function DeleteUserinfo(params: DeleteUserinfoRequest) {
	return axios.delete<DeleteUserinfoReply>('/usercenter/api/v1/userinfo', { params });
}
