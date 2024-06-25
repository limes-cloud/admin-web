import axios from 'axios';
import {
	GetEnvReply,
	GetEnvRequest,
	ListEnvReply,
	ListEnvRequest,
	CreateEnvReply,
	CreateEnvRequest,
	UpdateEnvRequest,
	DeleteEnvReply,
	DeleteEnvRequest,
	UpdateEnvStatusRequest
} from './type';

// GetEnv 获取指定的环境信息
export function GetEnv(params?: GetEnvRequest) {
	return axios.get<GetEnvReply>('/configure/api/v1/env', { params });
}

// ListEnv 获取环境信息列表
export function ListEnv(params?: ListEnvRequest) {
	return axios.get<ListEnvReply>('/configure/api/v1/envs', { params });
}

// CreateEnv 创建环境信息
export function CreateEnv(data: CreateEnvRequest) {
	return axios.post<CreateEnvReply>('/configure/api/v1/env', data);
}

// UpdateEnv 更新环境信息
export function UpdateEnv(data: UpdateEnvRequest) {
	return axios.put('/configure/api/v1/env', data);
}

// DeleteEnv 删除环境信息
export function DeleteEnv(params: DeleteEnvRequest) {
	return axios.delete<DeleteEnvReply>('/configure/api/v1/env', { params });
}

// UpdateEnvStatus 更新环境信息状态
export function UpdateEnvStatus(data: UpdateEnvStatusRequest) {
	return axios.put('/configure/api/v1/env/status', data);
}

// GetEnvToken 获取环境token
export function GetEnvToken(id: number) {
	return axios.get<{ token: string }>('/configure/api/v1/env/token', { params: { id } });
}

// UpdateEnvStatus 更新环境信息状态
export function ResetEnvToken(id: number) {
	return axios.put<{ token: string }>('/configure/api/v1/env/token', { id });
}
