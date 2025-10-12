import axios from 'axios';
import {
	GetAppReply,
	GetAppRequest,
	ListAppReply,
	ListAppRequest,
	CreateAppReply,
	CreateAppRequest,
	UpdateAppRequest,
	DeleteAppRequest,
	CreateAppOAuthChannelRequest,
	DeleteAppOAuthChannelRequest,
	ListAppOAuthChannelRequest,
	ListAppOAuthChannelReply,
	CreateAppFieldRequest,
	DeleteAppFieldRequest,
	ListAppFieldReply,
	ListAppFieldRequest,
	ListTenantAppOAuthChannelRequest,
	ListTenantAppOAuthChannelReply
} from './type';

// GetApp 获取指定的应用信息
export function GetApp(params?: GetAppRequest) {
	return axios.get<GetAppReply>('/manager/api/v1/app', { params });
}

// ListApp 获取应用信息列表
export function ListCurrentApp(params: ListAppRequest) {
	return axios.get<ListAppReply>('/manager/api/v1/current/apps', { params });
}

// ListApp 获取应用信息列表
export function ListApp(params: ListAppRequest) {
	return axios.get<ListAppReply>('/manager/api/v1/apps', { params });
}

// CreateApp 创建应用信息
export function CreateApp(data: CreateAppRequest) {
	return axios.post<CreateAppReply>('/manager/api/v1/app', data);
}

// UpdateApp 更新应用信息
export function UpdateApp(data: UpdateAppRequest) {
	return axios.put('/manager/api/v1/app', data);
}

// DeleteApp 删除应用信息
export function DeleteApp(params: DeleteAppRequest) {
	return axios.delete('/manager/api/v1/app', { params });
}

// CreateApp 创建应用信息
export function ListAppOAuthChannel(params: ListAppOAuthChannelRequest) {
	return axios.get<ListAppOAuthChannelReply>('/manager/api/v1/app/channels', { params });
}

export function ListTenantAppOAuthChannel(params: ListTenantAppOAuthChannelRequest) {
	return axios.get<ListTenantAppOAuthChannelReply>('/manager/api/v1/app/tenant/channels', { params });
}

// CreateApp 创建应用信息
export function CreateAppOAuthChannel(data: CreateAppOAuthChannelRequest) {
	return axios.post<CreateAppReply>('/manager/api/v1/app/channel', data);
}

// DeleteApp 删除应用信息
export function DeleteAppOAuthChannel(params: DeleteAppOAuthChannelRequest) {
	return axios.delete('/manager/api/v1/app/channel', { params });
}

// ListAppField 查询应用字段信息
export function ListAppField(params: ListAppFieldRequest) {
	return axios.get<ListAppFieldReply>('/manager/api/v1/app/fields', { params });
}

// CreateApp 创建应用字段信息
export function CreateAppField(data: CreateAppFieldRequest) {
	return axios.post<CreateAppReply>('/manager/api/v1/app/field', data);
}

// DeleteApp 删除应用字段信息
export function DeleteAppField(params: DeleteAppFieldRequest) {
	return axios.delete('/manager/api/v1/app/field', { params });
}
