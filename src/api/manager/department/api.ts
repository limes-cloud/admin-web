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
	GetDepartmentRequest,
	DeleteDepartmentClassifyRequest,
	CreateDepartmentClassifyReply,
	CreateDepartmentClassifyRequest,
	ListDepartmentClassifyReply,
	ListDepartmentClassifyRequest,
	UpdateDepartmentClassifyRequest
} from './type';

// ListDepartmentClassify 获取任务分组列表
export function ListDepartmentClassify(params: ListDepartmentClassifyRequest) {
	return axios.get<ListDepartmentClassifyReply>('/manager/api/v1/department_classifies', { params });
}

// CreateDepartmentClassify 创建任务分组
export function CreateDepartmentClassify(data: CreateDepartmentClassifyRequest) {
	return axios.post<CreateDepartmentClassifyReply>('/manager/api/v1/department_classify', data);
}

// UpdateDepartmentClassify 更新任务分组
export function UpdateDepartmentClassify(data: UpdateDepartmentClassifyRequest) {
	return axios.put('/manager/api/v1/department_classify', data);
}

// DeleteDepartmentClassify 删除任务分组
export function DeleteDepartmentClassify(params: DeleteDepartmentClassifyRequest) {
	return axios.delete('/manager/api/v1/department_classify', { params });
}

// ListDepartment 获取全部部门信息列表
export function ListDepartment(params?: ListDepartmentRequest) {
	return axios.get<ListDepartmentReply>('/manager/api/v1/departments', { params });
}

// ListDepartment 获取当前用户可见的部门信息列表
export function ListCurrentDepartment(params?: ListDepartmentRequest) {
	return axios.get<ListDepartmentReply>('/manager/api/v1/current/departments', { params });
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
