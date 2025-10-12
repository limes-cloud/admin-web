import axios from 'axios';
import {
	GetUserReply,
	GetUserRequest,
	ListUserReply,
	ListUserRequest,
	CreateUserReply,
	CreateUserRequest,
	UpdateUserRequest,
	DeleteUserReply,
	DeleteUserRequest,
	ResetUserPasswordRequest,
	UpdateCurrentUserRequest,
	UpdateCurrentUserPasswordRequest,
	UpdateCurrentUserSettingRequest,
	SendCurrentUserCaptchaReply,
	SendCurrentUserCaptchaRequest,
	GetUserLoginCaptchaReply,
	UserLoginReply,
	UserLoginRequest,
	UserRefreshTokenReply,
	ListUserDeptRequest,
	ListUserDeptReply,
	CreateUserDeptReply,
	CreateUserDeptRequest,
	DeleteUserDeptReply,
	DeleteUserDeptRequest,
	GetCurrentUserRequest
} from './type';

// GetUser 获取指定的用户信息
export function GetUser(params: GetUserRequest) {
	return axios.get<GetUserReply>('/manager/api/v1/user', { params });
}

// ListUser 获取用户信息列表
export function ListUser(params: ListUserRequest) {
	return axios.get<ListUserReply>('/manager/api/v1/users', { params });
}

// CreateUser 创建用户信息
export function CreateUser(data: CreateUserRequest) {
	return axios.post<CreateUserReply>('/manager/api/v1/user', data);
}

// UpdateUser 更新用户信息
export function UpdateUser(data: UpdateUserRequest) {
	return axios.put('/manager/api/v1/user', data);
}

// DeleteUser 删除用户信息
export function DeleteUser(params: DeleteUserRequest) {
	return axios.delete<DeleteUserReply>('/manager/api/v1/user', { params });
}

// GetCurrentUser 获取当前用户信息
export function GetCurrentUser(params?: GetCurrentUserRequest) {
	return axios.get<GetUserReply>('/manager/api/v1/current/user', { params });
}

// ResetUserPassword 重置用户密码
export function ResetUserPassword(data: ResetUserPasswordRequest) {
	return axios.post('/manager/api/v1/user/password/reset', data);
}

// UpdateCurrentUser 更新当前用户信息
export function UpdateCurrentUser(data: UpdateCurrentUserRequest) {
	return axios.put('/manager/api/v1/current/user', data);
}

// UpdateCurrentUserPassword 用户修改密码
export function UpdateCurrentUserPassword(data: UpdateCurrentUserPasswordRequest) {
	return axios.put('/manager/api/v1/user/current/password', data);
}

// UpdateCurrentUserSetting 用户设置保存
export function UpdateCurrentUserSetting(data: UpdateCurrentUserSettingRequest) {
	return axios.put('/manager/api/v1/current/user/setting', data);
}

// SendCurrentUserCaptcha 发送用户验证吗
export function SendCurrentUserCaptcha(data: SendCurrentUserCaptchaRequest) {
	return axios.post<SendCurrentUserCaptchaReply>('/manager/api/v1/user/current/captcha', data);
}

// GetUserLoginCaptcha 获取用户登陆验证吗
export function GetUserLoginCaptcha() {
	return axios.get<GetUserLoginCaptchaReply>('/manager/api/v1/login/captcha');
}

// UserLogin 用户登陆
export function UserLogin(data: UserLoginRequest) {
	return axios.post<UserLoginReply>('/manager/api/v1/login', data);
}

// UserLogout 用户退出
export function UserLogout() {
	return axios.post('/manager/api/v1/logout');
}

// UserRefreshToken 用户刷新token
export function UserRefreshToken() {
	return axios.post<UserRefreshTokenReply>('/manager/api/v1/token/refresh');
}

// ListUserDept 获取用户部门列表
export function ListUserDept(params?: ListUserDeptRequest) {
	return axios.get<ListUserDeptReply>('/manager/api/v1/user/depts', { params });
}

// CreateUserDept 创建用户部门信息
export function CreateUserDept(data: CreateUserDeptRequest) {
	return axios.post<CreateUserDeptReply>('/manager/api/v1/user/dept', data);
}

// DeleteUserDept 删除用户部门信息
export function DeleteUserDept(params: DeleteUserDeptRequest) {
	return axios.delete<DeleteUserDeptReply>('/manager/api/v1/user/dept', { params });
}
