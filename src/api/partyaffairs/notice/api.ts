import axios from 'axios';
import {
	ListNoticeReply,
	ListNoticeRequest,
	CreateNoticeReply,
	CreateNoticeRequest,
	UpdateNoticeRequest,
	DeleteNoticeRequest,
	GetNoticeReply,
	GetNoticeRequest,
	PushNoticeRequest
} from './type';

// ListNotice 获取通知信息列表
export function GetNotice(params: GetNoticeRequest) {
	return axios.get<GetNoticeReply>('/partyaffairs/api/v1/notice', { params });
}

// ListNotice 获取通知信息列表
export function ListNotice(params: ListNoticeRequest) {
	return axios.get<ListNoticeReply>('/partyaffairs/api/v1/notices', { params });
}

// CreateNotice 创建通知信息
export function CreateNotice(data: CreateNoticeRequest) {
	return axios.post<CreateNoticeReply>('/partyaffairs/api/v1/notice', data);
}

// PushNotice 创建通知信息
export function PushNotice(data: PushNoticeRequest) {
	return axios.post('/partyaffairs/api/v1/notice/push', data);
}

// UpdateNotice 更新通知信息
export function UpdateNotice(data: UpdateNoticeRequest) {
	return axios.put('/partyaffairs/api/v1/notice', data);
}

// DeleteNotice 删除通知信息
export function DeleteNotice(params: DeleteNoticeRequest) {
	return axios.delete('/partyaffairs/api/v1/notice', { params });
}
