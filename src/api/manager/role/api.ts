import axios from 'axios';
import {
	GetRoleMenuIdsReply,
	GetRoleMenuIdsRequest,
	ListRoleReply,
	ListRoleRequest,
	CreateRoleReply,
	CreateRoleRequest,
	UpdateRoleRequest,
	UpdateRoleMenuRequest,
	UpdateRoleStatusRequest,
	DeleteRoleReply,
	DeleteRoleRequest,
	GetRoleReply,
	GetRoleRequest
} from './type';

// GetRoleMenuIds 获取指定角色的菜单id列表
export function GetRoleMenuIds(params: GetRoleMenuIdsRequest) {
	return axios.get<GetRoleMenuIdsReply>('/manager/api/v1/role/menu_ids', { params });
}

// ListRole 获取角色信息列表
export function ListRole(params?: ListRoleRequest) {
	return axios.get<ListRoleReply>('/manager/api/v1/current/roles', { params });
}

// ListRole 获取角色信息列表
export function ListCurrentRole(params?: ListRoleRequest) {
	return axios.get<ListRoleReply>('/manager/api/v1/current/roles', { params });
}

// CreateRole 创建角色信息
export function CreateRole(data: CreateRoleRequest) {
	return axios.post<CreateRoleReply>('/manager/api/v1/role', data);
}

// UpdateRole 更新角色信息
export function UpdateRole(data: UpdateRoleRequest) {
	return axios.put('/manager/api/v1/role', data);
}

// UpdateRole 更新角色信息
export function UpdateRoleMenu(data: UpdateRoleMenuRequest) {
	return axios.put('/manager/api/v1/role/menu', data);
}

// UpdateRoleStatus 更新角色信息状态
export function UpdateRoleStatus(data: UpdateRoleStatusRequest) {
	return axios.put('/manager/api/v1/role/status', data);
}

// DeleteRole 删除角色信息
export function DeleteRole(params: DeleteRoleRequest) {
	return axios.delete<DeleteRoleReply>('/manager/api/v1/role', { params });
}

// GetRole 获取指定的角色信息
export function GetRole(params?: GetRoleRequest) {
	return axios.get<GetRoleReply>('/manager/api/v1/role', { params });
}
