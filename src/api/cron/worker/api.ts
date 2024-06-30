import axios from 'axios';
import {
	GetWorkerGroupReply,
	GetWorkerGroupRequest,
	ListWorkerGroupReply,
	ListWorkerGroupRequest,
	CreateWorkerGroupReply,
	CreateWorkerGroupRequest,
	UpdateWorkerGroupRequest,
	DeleteWorkerGroupReply,
	DeleteWorkerGroupRequest,
	CreateWorkerRequest,
	UpdateWorkerRequest,
	UpdateWorkerStatusRequest,
	DeleteWorkerRequest,
	ListWorkerRequest,
	ListWorkerReply,
	GetWorkerRequest,
	GetWorkerReply
} from './type';

// GetWorkerGroup 获取指定的节点分组
export function GetWorkerGroup(params?: GetWorkerGroupRequest) {
	return axios.get<GetWorkerGroupReply>('/cron/api/v1/worker_group', { params });
}

// ListWorkerGroup 获取节点分组列表
export function ListWorkerGroup(params: ListWorkerGroupRequest) {
	return axios.get<ListWorkerGroupReply>('/cron/api/v1/worker_groups', { params });
}

// CreateWorkerGroup 创建节点分组
export function CreateWorkerGroup(data: CreateWorkerGroupRequest) {
	return axios.post<CreateWorkerGroupReply>('/cron/api/v1/worker_group', data);
}

// UpdateWorkerGroup 更新节点分组
export function UpdateWorkerGroup(data: UpdateWorkerGroupRequest) {
	return axios.put('/cron/api/v1/worker_group', data);
}

// DeleteWorkerGroup 删除节点分组
export function DeleteWorkerGroup(params: DeleteWorkerGroupRequest) {
	return axios.delete<DeleteWorkerGroupReply>('/cron/api/v1/worker_group', { params });
}

// GetWorker 获取指定的节点信息
export function GetWorker(params: GetWorkerRequest) {
	return axios.get<GetWorkerReply>('/cron/api/v1/worker', { params });
}

// ListWorker 获取节点信息列表
export function ListWorker(params: ListWorkerRequest) {
	return axios.get<ListWorkerReply>('/cron/api/v1/workers', { params });
}

// CreateWorker 创建节点信息
export function CreateWorker(data: CreateWorkerRequest) {
	return axios.post<CreateWorkerGroupReply>('/cron/api/v1/worker', data);
}

// UpdateWorker 更新节点信息
export function UpdateWorker(data: UpdateWorkerRequest) {
	return axios.put('/cron/api/v1/worker', data);
}

// UpdateWorkerStatus 更新节点信息状态
export function UpdateWorkerStatus(data: UpdateWorkerStatusRequest) {
	return axios.put('/cron/api/v1/worker/status', data);
}

// DeleteWorker 删除节点信息
export function DeleteWorker(params: DeleteWorkerRequest) {
	return axios.delete('/cron/api/v1/worker', { params });
}
