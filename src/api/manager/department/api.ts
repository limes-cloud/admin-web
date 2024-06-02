import axios from 'axios';
import {
	ListDepartmentReply,
	ListDepartmentRequest,
	CreateDepartmentReply,
	CreateDepartmentRequest,
	UpdateDepartmentRequest,
	DeleteDepartmentReply,
	DeleteDepartmentRequest,
	GetDepartmentReply,
	GetDepartmentRequest
} from './type';

// ListDepartment 获取部门信息列表
export function ListDepartment(params?: ListDepartmentRequest) {
	return axios.get<ListDepartmentReply>('/manager/api/v1/departments', { params });
}

// CreateDepartment 创建部门信息
export function CreateDepartment(data: CreateDepartmentRequest) {
	return axios.post<CreateDepartmentReply>('/manager/api/v1/department', data);
}

// UpdateDepartment 更新部门信息
export function UpdateDepartment(data: UpdateDepartmentRequest) {
	return axios.put('/manager/api/v1/department', data);
}

// DeleteDepartment 删除部门信息
export function DeleteDepartment(params: DeleteDepartmentRequest) {
	return axios.delete<DeleteDepartmentReply>('/manager/api/v1/department', { params });
}

// GetDepartment 获取指定的部门信息
export function GetDepartment(params: GetDepartmentRequest) {
	return axios.get<GetDepartmentReply>('/manager/api/v1/department', { params });
}
