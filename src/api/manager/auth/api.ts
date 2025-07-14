import axios from 'axios';

import { OAuthWayReply, OAuthWayRequest, OAuthBindReply, OAuthBindRequest, OAuthLoginReply, OAuthLoginRequest, ReportOAuthCodeRequest } from './type';

// ListChannel 获取可用的登陆渠道列表
export function OAuthWay(data: OAuthWayRequest) {
	return axios.post<OAuthWayReply>('/manager/api/v1/oauth/way', data);
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
