import axios from 'axios';
import {
	ListDeptReply,
	ListDeptRequest,
	CreateDeptReply,
	CreateDeptRequest,
	UpdateDeptRequest,
	DeleteDeptReply,
	DeleteDeptRequest,
	GetDeptReply,
	GetDeptRequest,
	DeleteDeptClassifyRequest,
	CreateDeptClassifyReply,
	CreateDeptClassifyRequest,
	ListDeptClassifyReply,
	ListDeptClassifyRequest,
	UpdateDeptClassifyRequest,
	CreateDeptRolesReply,
	CreateDeptRolesRequest,
	DeleteDeptRolesReply,
	DeleteDeptRolesRequest,
	ListDeptRoleReply,
	ListDeptRoleRequest
} from './type';

// ListDeptClassify 获取任务分组列表
export function ListDeptClassify(params: ListDeptClassifyRequest) {
	return axios.get<ListDeptClassifyReply>('/manager/api/v1/dept/classifies', { params });
}

// CreateDeptClassify 创建任务分组
export function CreateDeptClassify(data: CreateDeptClassifyRequest) {
	return axios.post<CreateDeptClassifyReply>('/manager/api/v1/dept/classify', data);
}

// UpdateDeptClassify 更新任务分组
export function UpdateDeptClassify(data: UpdateDeptClassifyRequest) {
	return axios.put('/manager/api/v1/dept/classify', data);
}

// DeleteDeptClassify 删除任务分组
export function DeleteDeptClassify(params: DeleteDeptClassifyRequest) {
	return axios.delete('/manager/api/v1/dept/classify', { params });
}

// ListDept 获取全部部门信息列表
export function ListDept(params?: ListDeptRequest) {
	return axios.get<ListDeptReply>('/manager/api/v1/depts', { params });
}

// ListDept 获取当前用户可见的部门信息列表
export function ListCurrentDept(params?: ListDeptRequest) {
	return axios.get<ListDeptReply>('/manager/api/v1/current/depts', { params });
}

// CreateDept 创建部门信息
export function CreateDept(data: CreateDeptRequest) {
	return axios.post<CreateDeptReply>('/manager/api/v1/dept', data);
}

// UpdateDept 更新部门信息
export function UpdateDept(data: UpdateDeptRequest) {
	return axios.put('/manager/api/v1/dept', data);
}

// DeleteDept 删除部门信息
export function DeleteDept(params: DeleteDeptRequest) {
	return axios.delete<DeleteDeptReply>('/manager/api/v1/dept', { params });
}

// GetDept 获取指定的部门信息
export function GetDept(params: GetDeptRequest) {
	return axios.get<GetDeptReply>('/manager/api/v1/dept', { params });
}

// ListDeptRole 获取部门角色列表
export function ListDeptRole(params?: ListDeptRoleRequest) {
	return axios.get<ListDeptRoleReply>('/manager/api/v1/dept/roles', { params });
}

// CreateDeptRole 创建部门角色信息
export function CreateDeptRoles(data: CreateDeptRolesRequest) {
	return axios.post<CreateDeptRolesReply>('/manager/api/v1/dept/roles', data);
}

// DeleteDeptRole 删除部门角色信息
export function DeleteDeptRoles(params: DeleteDeptRolesRequest) {
	return axios.delete<DeleteDeptRolesReply>('/manager/api/v1/dept/roles', { params });
}
