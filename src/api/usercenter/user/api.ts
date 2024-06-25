import axios from 'axios';
import {
	GetUserReply,
	GetUserRequest,
	ListUserReply,
	ListUserRequest,
	CreateUserReply,
	CreateUserRequest,
	ImportUserReply,
	ImportUserRequest,
	ExportUserReply,
	ExportUserRequest,
	UpdateUserRequest,
	UpdateUserStatusRequest,
	DeleteUserReply,
	DeleteUserRequest,
	GetTrashUserReply,
	GetTrashUserRequest,
	ListTrashUserReply,
	ListTrashUserRequest,
	DeleteTrashUserReply,
	DeleteTrashUserRequest,
	RevertTrashUserRequest
} from './type';

// GetUser 获取指定的用户信息
export function GetUser(params?: GetUserRequest) {
	return axios.get<GetUserReply>('/usercenter/api/v1/user', { params });
}

// ListUser 获取用户信息列表
export function ListUser(params: ListUserRequest) {
	return axios.get<ListUserReply>('/usercenter/api/v1/users', { params });
}

// CreateUser 创建用户信息
export function CreateUser(data?: CreateUserRequest) {
	return axios.post<CreateUserReply>('/usercenter/api/v1/user', data);
}

// ImportUser 导入用户信息
export function ImportUser(data: ImportUserRequest) {
	return axios.post<ImportUserReply>('/usercenter/api/v1/user/import', data);
}

// ExportUser 导出用户信息
export function ExportUser(data: ExportUserRequest) {
	return axios.post<ExportUserReply>('/usercenter/api/v1/user/export', data);
}

// UpdateUser 更新用户信息
export function UpdateUser(data: UpdateUserRequest) {
	return axios.put('/usercenter/api/v1/user', data);
}

// UpdateUserStatus 更新用户信息状态
export function UpdateUserStatus(data: UpdateUserStatusRequest) {
	return axios.put('/usercenter/api/v1/user/status', data);
}

// DeleteUser 删除用户信息
export function DeleteUser(params: DeleteUserRequest) {
	return axios.delete<DeleteUserReply>('/usercenter/api/v1/user', { params });
}

// GetTrashUser 查看指定用户信息回收站数据
export function GetTrashUser(params: GetTrashUserRequest) {
	return axios.get<GetTrashUserReply>('/usercenter/api/v1/user/trash', { params });
}

// ListTrashUser 查看用户信息列表回收站数据
export function ListTrashUser(params: ListTrashUserRequest) {
	return axios.get<ListTrashUserReply>('/usercenter/api/v1/user/trashes', { params });
}

// DeleteTrashUser 彻底删除用户信息
export function DeleteTrashUser(params: DeleteTrashUserRequest) {
	return axios.delete<DeleteTrashUserReply>('/usercenter/api/v1/user/trash', { params });
}

// RevertTrashUser 还原用户信息
export function RevertTrashUser(data: RevertTrashUserRequest) {
	return axios.put('/usercenter/api/v1/user/trash', data);
}
