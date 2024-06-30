import axios from 'axios';
import {
	GetTaskReply,
	GetTaskRequest,
	ListTaskReply,
	ListTaskRequest,
	CreateTaskReply,
	CreateTaskRequest,
	UpdateTaskRequest,
	UpdateTaskStatusRequest,
	DeleteTaskReply,
	DeleteTaskRequest,
	GetTaskGroupRequest,
	GetTaskGroupReply,
	ListTaskGroupRequest,
	ListTaskGroupReply,
	CreateTaskGroupRequest,
	CreateTaskGroupReply,
	UpdateTaskGroupRequest,
	DeleteTaskGroupRequest,
	CancelTaskRequest,
	ExecTaskRequest
} from './type';

// GetTaskGroup 获取指定的任务分组
export function GetTaskGroup(params: GetTaskGroupRequest) {
	return axios.get<GetTaskGroupReply>('/cron/api/v1/task_group', { params });
}

// ListTaskGroup 获取任务分组列表
export function ListTaskGroup(params: ListTaskGroupRequest) {
	return axios.get<ListTaskGroupReply>('/cron/api/v1/task_groups', { params });
}

// CreateTaskGroup 创建任务分组
export function CreateTaskGroup(data: CreateTaskGroupRequest) {
	return axios.post<CreateTaskGroupReply>('/cron/api/v1/task_group', data);
}

// UpdateTaskGroup 更新任务分组
export function UpdateTaskGroup(data: UpdateTaskGroupRequest) {
	return axios.put('/cron/api/v1/task_group', data);
}

// DeleteTaskGroup 删除任务分组
export function DeleteTaskGroup(params: DeleteTaskGroupRequest) {
	return axios.delete('/cron/api/v1/task_group', { params });
}

// GetTask 获取指定的任务信息
export function GetTask(params?: GetTaskRequest) {
	return axios.get<GetTaskReply>('/cron/api/v1/task', { params });
}

// ListTask 获取任务信息列表
export function ListTask(params: ListTaskRequest) {
	return axios.get<ListTaskReply>('/cron/api/v1/tasks', { params });
}

// CreateTask 创建任务信息
export function CreateTask(data: CreateTaskRequest) {
	return axios.post<CreateTaskReply>('/cron/api/v1/task', data);
}

// UpdateTask 更新任务信息
export function UpdateTask(data: UpdateTaskRequest) {
	return axios.put('/cron/api/v1/task', data);
}

// UpdateTaskStatus 更新任务信息状态
export function UpdateTaskStatus(data: UpdateTaskStatusRequest) {
	return axios.put('/cron/api/v1/task/status', data);
}

// DeleteTask 删除任务信息
export function DeleteTask(params: DeleteTaskRequest) {
	return axios.delete<DeleteTaskReply>('/cron/api/v1/task', { params });
}

export function ExecTask(data: ExecTaskRequest) {
	return axios.post('/cron/api/v1/task/exec', data);
}

export function CancelTask(data: CancelTaskRequest) {
	return axios.post('/cron/api/v1/task/cancel', data);
}
