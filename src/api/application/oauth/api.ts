import axios from 'axios';
import { ListOAuthReply, ListOAuthRequest, DeleteOAuthReply, DeleteOAuthRequest } from './type';

// ListOAuth 获取应用授权信息列表
export function ListOAuth(params: ListOAuthRequest) {
	return axios.get<ListOAuthReply>('/application/api/v1/oauths', { params });
}

// DeleteOAuth 删除应用授权信息
export function DeleteOAuth(params: DeleteOAuthRequest) {
	return axios.delete<DeleteOAuthReply>('/application/api/v1/oauth', { params });
}
