import axios from 'axios';
import {
	GetUserReply,
	GetUserRequest,
	ListUserReply,
	ListUserRequest,
	CreateUserReply,
	CreateUserRequest,
	UpdateUserRequest,
	UpdateUserStatusRequest,
	DeleteUserReply,
	DeleteUserRequest,
	ResetUserPasswordRequest,
	UpdateCurrentUserRequest,
	UpdateCurrentUserRoleReply,
	UpdateCurrentUserRoleRequest,
	UpdateCurrentUserPasswordRequest,
	UpdateCurrentUserSettingRequest,
	SendCurrentUserCaptchaReply,
	SendCurrentUserCaptchaRequest,
	GetUserLoginCaptchaReply,
	UserLoginReply,
	UserLoginRequest,
	UserRefreshTokenReply,
	ListLoginLogRequest,
	ListLoginLogReply
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

// UpdateUserStatus 更新用户信息状态
export function UpdateUserStatus(data: UpdateUserStatusRequest) {
	return axios.put('/manager/api/v1/user/status', data);
}

// DeleteUser 删除用户信息
export function DeleteUser(params: DeleteUserRequest) {
	return axios.delete<DeleteUserReply>('/manager/api/v1/user', { params });
}

// GetCurrentUser 获取当前用户信息
export function GetCurrentUser() {
	return axios.get<GetUserReply>('/manager/api/v1/user/current');
}

// ResetUserPassword 重置用户密码
export function ResetUserPassword(data: ResetUserPasswordRequest) {
	return axios.post('/manager/api/v1/user/password/reset', data);
}

// UpdateCurrentUser 更新当前用户信息
export function UpdateCurrentUser(data: UpdateCurrentUserRequest) {
	return axios.put('/manager/api/v1/user/current/info', data);
}

// UpdateCurrentUserRole 切换用户当前角色
export function UpdateCurrentUserRole(data: UpdateCurrentUserRoleRequest) {
	return axios.put<UpdateCurrentUserRoleReply>('/manager/api/v1/user/current/role', data);
}

// UpdateCurrentUserPassword 用户修改密码
export function UpdateCurrentUserPassword(data: UpdateCurrentUserPasswordRequest) {
	return axios.put('/manager/api/v1/user/current/password', data);
}

// UpdateCurrentUserSetting 用户设置保存
export function UpdateCurrentUserSetting(data: UpdateCurrentUserSettingRequest) {
	return axios.put('/manager/api/v1/user/current/setting', data);
}

// SendCurrentUserCaptcha 发送用户验证吗
export function SendCurrentUserCaptcha(data: SendCurrentUserCaptchaRequest) {
	return axios.post<SendCurrentUserCaptchaReply>('/manager/api/v1/user/current/captcha', data);
}

// GetUserLoginCaptcha 获取用户登陆验证吗
export function GetUserLoginCaptcha() {
	return axios.get<GetUserLoginCaptchaReply>('/manager/api/v1/user/login/captcha');
}

// UserLogin 用户登陆
export function UserLogin(data: UserLoginRequest) {
	return axios.post<UserLoginReply>('/manager/api/v1/user/login', data);
}

// UserLogout 用户退出
export function UserLogout() {
	return axios.post('/manager/api/v1/user/logout');
}

// UserRefreshToken 用户刷新token
export function UserRefreshToken() {
	return axios.post<UserRefreshTokenReply>('/manager/api/v1/user/token/refresh');
}

// ListLoginLog 获取登陆日志
export function ListLoginLog(params: ListLoginLogRequest) {
	return axios.get<ListLoginLogReply>('/manager/api/v1/user/login/logs', { params });
}
