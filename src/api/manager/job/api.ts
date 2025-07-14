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
	GetJobRequest
} from './type';

// ListJob 获取职位信息列表
export function ListJob(params: ListJobRequest) {
	return axios.get<ListJobReply>('/manager/api/v1/jobs', { params });
}

// ListJob 获取当前用户可见的部门信息列表
export function ListCurrentJob(params?: ListJobRequest) {
	return axios.get<ListJobReply>('/manager/api/v1/current/jobs', { params });
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
