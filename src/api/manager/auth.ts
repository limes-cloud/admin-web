import axios from 'axios';
import { LoginReq, LoginRes } from '@/api/manager/types/auth';

export function captcha() {
	return axios.post('/manager/v1/user/login/captcha');
}

export function login(data: LoginReq) {
	return axios.post<LoginRes>('/manager/v1/user/login', data);
}

export function logout() {
	return axios.post<LoginRes>('/manager/v1/user/logout');
}

export function refreshToken() {
	return axios.post<LoginRes>('/manager/v1/user/token/refresh');
}
