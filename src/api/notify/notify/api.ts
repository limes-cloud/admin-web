import axios from 'axios';
import {
	ListNotifyCategoryReply,
	ListNotifyCategoryRequest,
	CreateNotifyCategoryReply,
	CreateNotifyCategoryRequest,
	UpdateNotifyCategoryRequest,
	DeleteNotifyCategoryRequest,
	CreateNotifyReply,
	CreateNotifyRequest,
	DeleteNotifyRequest,
	ListNotifyReply,
	ListNotifyRequest,
	UpdateNotifyRequest,
	GetNotifyRequest,
	Notify,
	SendNotifyRequest
} from './type';

// ListNotifyCategory 获取发送渠道列表
export function ListNotifyCategory(params: ListNotifyCategoryRequest) {
	return axios.get<ListNotifyCategoryReply>('/notify/api/v1/notify_categories', { params });
}

// CreateNotifyCategory 创建发送渠道
export function CreateNotifyCategory(data: CreateNotifyCategoryRequest) {
	return axios.post<CreateNotifyCategoryReply>('/notify/api/v1/notify_category', data);
}

// UpdateNotifyCategory 更新发送渠道
export function UpdateNotifyCategory(data: UpdateNotifyCategoryRequest) {
	return axios.put('/notify/api/v1/notify_category', data);
}

// DeleteNotifyCategory 删除发送渠道
export function DeleteNotifyCategory(params: DeleteNotifyCategoryRequest) {
	return axios.delete('/notify/api/v1/notify_category', { params });
}

// GetNotify 获取指定通知
export function GetNotify(params: GetNotifyRequest) {
	return axios.get<Notify>('/notify/api/v1/notify', { params });
}

// ListNotify 获取通知列表
export function ListNotify(params: ListNotifyRequest) {
	return axios.get<ListNotifyReply>('/notify/api/v1/notifies', { params });
}

// CreateNotify 创建通知
export function CreateNotify(data: CreateNotifyRequest) {
	return axios.post<CreateNotifyReply>('/notify/api/v1/notify', data);
}

// UpdateNotify 更新通知
export function UpdateNotify(data: UpdateNotifyRequest) {
	return axios.put('/notify/api/v1/notify', data);
}

// DeleteNotify 删除通知
export function DeleteNotify(params: DeleteNotifyRequest) {
	return axios.delete('/notify/api/v1/notify', { params });
}

// GetNotify 获取指定通知
export function SendNotify(data: SendNotifyRequest) {
	return axios.post('/notify/api/v1/notify/async_send', data);
}
