import axios from 'axios';
import { GetUserReply, UserLoginReply, UserLoginRequest, UserRefreshTokenReply } from './type';

// GetUser 获取指定的用户信息
export async function GetCurrentUser() {
	return {} as GetUserReply;
}

// UserLogin 用户登陆
export function UserLogin(data: UserLoginRequest) {
	return axios.post<UserLoginReply>('/configure/api/v1/login', data);
}

// UserLogout 用户退出
export function UserLogout() {
	return true;
}

// UserRefreshToken 用户刷新token
export function UserRefreshToken() {
	return axios.post<UserRefreshTokenReply>('/configure/api/v1/token/refresh');
}
