import axios from 'axios';
import {
	GetServerReply,
	GetServerRequest,
	ListServerReply,
	ListServerRequest,
	CreateServerReply,
	CreateServerRequest,
	UpdateServerRequest,
	DeleteServerReply,
	DeleteServerRequest,
	UpdateServerStatusRequest
} from './type';

// GetServer 获取指定的服务信息
export function GetServer(params?: GetServerRequest) {
	return axios.get<GetServerReply>('/configure/api/v1/server', { params });
}

// ListServer 获取服务信息列表
export function ListServer(params: ListServerRequest) {
	return axios.get<ListServerReply>('/configure/api/v1/servers', { params });
}

// CreateServer 创建服务信息
export function CreateServer(data: CreateServerRequest) {
	return axios.post<CreateServerReply>('/configure/api/v1/server', data);
}

// UpdateServer 更新服务信息
export function UpdateServer(data: UpdateServerRequest) {
	return axios.put('/configure/api/v1/server', data);
}

// DeleteServer 删除服务信息
export function DeleteServer(params: DeleteServerRequest) {
	return axios.delete<DeleteServerReply>('/configure/api/v1/server', { params });
}

// UpdateServerStatus 更新服务信息状态
export function UpdateServerStatus(data: UpdateServerStatusRequest) {
	return axios.put('/configure/api/v1/server/status', data);
}
