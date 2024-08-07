import axios from 'axios';
import {
	ListActivityReply,
	ListActivityRequest,
	CreateActivityReply,
	CreateActivityRequest,
	UpdateActivityRequest,
	DeleteActivityRequest,
	GetActivityReply,
	GetActivityRequest
} from './type';

// GetActivity 获取活动信息列表
export function GetActivity(params: GetActivityRequest) {
	return axios.get<GetActivityReply>('/poverty/api/v1/activity', { params });
}

// ListActivity 获取活动信息列表
export function ListActivity(params: ListActivityRequest) {
	return axios.get<ListActivityReply>('/poverty/api/v1/activities', { params });
}

// CreateActivity 创建活动信息
export function CreateActivity(data: CreateActivityRequest) {
	return axios.post<CreateActivityReply>('/poverty/api/v1/activity', data);
}

// UpdateActivity 更新活动信息
export function UpdateActivity(data: UpdateActivityRequest) {
	return axios.put('/poverty/api/v1/activity', data);
}

// DeleteActivity 删除活动信息
export function DeleteActivity(params: DeleteActivityRequest) {
	return axios.delete('/poverty/api/v1/activity', { params });
}
