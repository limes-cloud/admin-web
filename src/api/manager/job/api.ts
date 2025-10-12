import axios from 'axios';
import {
	ListJobReply,
	ListJobRequest,
	CreateJobReply,
	CreateJobRequest,
	UpdateJobRequest,
	DeleteJobReply,
	DeleteJobRequest,
	GetJobReply,
	GetJobRequest,
	CreateJobRolesReply,
	CreateJobRolesRequest,
	DeleteJobRolesReply,
	DeleteJobRolesRequest,
	ListJobRoleReply,
	ListJobRoleRequest
} from './type';

// ListJob 获取职位信息列表
export function ListJob(params: ListJobRequest) {
	return axios.get<ListJobReply>('/manager/api/v1/jobs', { params });
}

// CreateJob 创建职位信息
export function CreateJob(data: CreateJobRequest) {
	return axios.post<CreateJobReply>('/manager/api/v1/job', data);
}

// UpdateJob 更新职位信息
export function UpdateJob(data: UpdateJobRequest) {
	return axios.put('/manager/api/v1/job', data);
}

// DeleteJob 删除职位信息
export function DeleteJob(params: DeleteJobRequest) {
	return axios.delete<DeleteJobReply>('/manager/api/v1/job', { params });
}

// GetJob 获取指定的职位信息
export function GetJob(params: GetJobRequest) {
	return axios.get<GetJobReply>('/manager/api/v1/job', { params });
}

// ListJobRole 获取职位角色列表
export function ListJobRole(params?: ListJobRoleRequest) {
	return axios.get<ListJobRoleReply>('/manager/api/v1/job/roles', { params });
}

// CreateJobRole 创建职位角色信息
export function CreateJobRoles(data: CreateJobRolesRequest) {
	return axios.post<CreateJobRolesReply>('/manager/api/v1/job/roles', data);
}

// DeleteJobRole 删除职位角色信息
export function DeleteJobRoles(params: DeleteJobRolesRequest) {
	return axios.delete<DeleteJobRolesReply>('/manager/api/v1/job/roles', { params });
}
