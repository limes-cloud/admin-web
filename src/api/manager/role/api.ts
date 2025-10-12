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
	GetRoleRequest,
	CreateRoleEntityRequest,
	CreateRoleEntityReply,
	DeleteRoleEntityReply,
	DeleteRoleEntityRequest,
	ListRoleEntityReply,
	ListRoleEntityRequest,
	UpdateRoleEntityRequest
} from './type';

// GetRoleMenuIds 获取指定角色的菜单id列表
export function GetRoleMenuIds(params: GetRoleMenuIdsRequest) {
	return axios.get<GetRoleMenuIdsReply>('/manager/api/v1/role/menuids', { params });
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
	return axios.post('/manager/api/v1/role/menus', data);
}

// DeleteRole 删除角色信息
export function DeleteRole(params: DeleteRoleRequest) {
	return axios.delete<DeleteRoleReply>('/manager/api/v1/role', { params });
}

// GetRole 获取指定的角色信息
export function GetRole(params?: GetRoleRequest) {
	return axios.get<GetRoleReply>('/manager/api/v1/role', { params });
}

// ListRoleEntity 获取角色信息列表
export function ListRoleEntity(params?: ListRoleEntityRequest) {
	return axios.get<ListRoleEntityReply>('/manager/api/v1/role/entities', { params });
}

// CreateRoleEntity 创建角色信息
export function CreateRoleEntity(data: CreateRoleEntityRequest) {
	return axios.post<CreateRoleEntityReply>('/manager/api/v1/role/entity', data);
}

// UpdateRoleEntity 更新角色信息
export function UpdateRoleEntity(data: UpdateRoleEntityRequest) {
	return axios.put('/manager/api/v1/role/entity', data);
}

// DeleteRoleEntity 删除角色信息
export function DeleteRoleEntity(params: DeleteRoleEntityRequest) {
	return axios.delete<DeleteRoleEntityReply>('/manager/api/v1/role/entity', { params });
}
