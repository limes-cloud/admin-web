import axios from 'axios';
import {
	GetAppReply,
	GetAppRequest,
	ListAppReply,
	ListAppRequest,
	CreateAppReply,
	CreateAppRequest,
	UpdateAppRequest,
	UpdateAppStatusRequest,
	DeleteAppReply,
	DeleteAppRequest
} from './type';

// GetApp 获取指定的应用信息
export function GetApp(params?: GetAppRequest) {
	return axios.get<GetAppReply>('/usercenter/api/v1/app', { params });
}

// ListApp 获取应用信息列表
export function ListApp(params: ListAppRequest) {
	return axios.get<ListAppReply>('/usercenter/api/v1/apps', { params });
}

// CreateApp 创建应用信息
export function CreateApp(data: CreateAppRequest) {
	return axios.post<CreateAppReply>('/usercenter/api/v1/app', data);
}

// UpdateApp 更新应用信息
export function UpdateApp(data: UpdateAppRequest) {
	return axios.put('/usercenter/api/v1/app', data);
}

// UpdateAppStatus 更新应用信息状态
export function UpdateAppStatus(data: UpdateAppStatusRequest) {
	return axios.put('/usercenter/api/v1/app/status', data);
}

// DeleteApp 删除应用信息
export function DeleteApp(params: DeleteAppRequest) {
	return axios.delete<DeleteAppReply>('/usercenter/api/v1/app', { params });
}
