import axios from 'axios';

import {
	OAuthBindReply,
	OAuthBindRequest,
	OAuthLoginReply,
	OAuthLoginRequest,
	ReportOAuthCodeRequest,
	ListLoginLogRequest,
	ListLoginLogReply,
	ListAuthLogReply,
	ListAuthLogRequest,
	OAuthHandlerRequest,
	OAuthHandlerReply
} from './type';

// ListChannel 获取可用的登陆渠道列表
export function OAuthHandler(data: OAuthHandlerRequest) {
	return axios.post<OAuthHandlerReply>('/manager/api/v1/oauth/handler', data);
}

// OAuthLogin 三方渠道登陆
export function OAuthLogin(data: OAuthLoginRequest) {
	return axios.post<OAuthLoginReply>('/manager/api/v1/oauth/login', data);
}

// OAuthLogin 三方渠道登陆
export function OAuthBind(data: OAuthBindRequest) {
	return axios.post<OAuthBindReply>('/manager/api/v1/oauth/bind', data);
}

// OAuthLogin 三方渠道登陆
export function ReportOAuthCode(data: ReportOAuthCodeRequest) {
	return axios.post('/manager/api/v1/oauth/report', data);
}

// ListLoginLog 获取登陆日志
export function ListLoginLog(params: ListLoginLogRequest) {
	return axios.get<ListLoginLogReply>('/manager/api/v1/login/logs', { params });
}

// ListAuthLog 获取鉴权日志
export function ListAuthLog(params: ListAuthLogRequest) {
	return axios.get<ListAuthLogReply>('/manager/api/v1/auth/logs', { params });
}
