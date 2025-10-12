import axios from 'axios';
import {
	ListTenantReply,
	ListTenantRequest,
	CreateTenantReply,
	CreateTenantRequest,
	UpdateTenantRequest,
	DeleteTenantRequest,
	ListTenantAppRequest,
	CreateTenantAppReply,
	CreateTenantAppRequest,
	DeleteTenantAppRequest,
	ListTenantAppReply,
	UpdateTenantAppRequest,
	GetTenantAppMenuIdsRequest,
	GetTenantAppMenuIdsReply
} from './type';

// ListTenant 获取租户信息列表
export function ListTenant(params: ListTenantRequest) {
	return axios.get<ListTenantReply>('/manager/api/v1/tenants', { params });
}

// CreateTenant 创建租户信息
export function CreateTenant(data: CreateTenantRequest) {
	return axios.post<CreateTenantReply>('/manager/api/v1/tenant', data);
}

// UpdateTenant 更新租户信息
export function UpdateTenant(data: UpdateTenantRequest) {
	return axios.put('/manager/api/v1/tenant', data);
}

// DeleteTenant 删除租户信息
export function DeleteTenant(params: DeleteTenantRequest) {
	return axios.delete('/manager/api/v1/tenant', { params });
}

// ListTenantApp 获取租户信息列表
export function ListTenantApp(params: ListTenantAppRequest) {
	return axios.get<ListTenantAppReply>('/manager/api/v1/tenant/apps', { params });
}

// CreateTenantApp 创建租户信息
export function CreateTenantApp(data: CreateTenantAppRequest) {
	return axios.post<CreateTenantAppReply>('/manager/api/v1/tenant/app', data);
}

// UpdateTenantApp 更新租户信息
export function UpdateTenantApp(data: UpdateTenantAppRequest) {
	return axios.put('/manager/api/v1/tenant/app', data);
}

// DeleteTenantApp 删除租户信息
export function DeleteTenantApp(params: DeleteTenantAppRequest) {
	return axios.delete('/manager/api/v1/tenant/app', { params });
}

// GetTenantAppMenuIds 获取租户应用菜单ID列表
export function GetTenantAppMenuIds(params: GetTenantAppMenuIdsRequest) {
	return axios.get<GetTenantAppMenuIdsReply>('/manager/api/v1/tenant/app/menus', { params });
}
