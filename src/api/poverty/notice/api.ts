import axios from 'axios';
import {
	ListNoticeReply,
	ListNoticeRequest,
	CreateNoticeReply,
	CreateNoticeRequest,
	UpdateNoticeRequest,
	DeleteNoticeRequest,
	GetNoticeReply,
	GetNoticeRequest
} from './type';

// ListNotice 获取通知信息列表
export function GetNotice(params: GetNoticeRequest) {
	return axios.get<GetNoticeReply>('/poverty/api/v1/notice', { params });
}

// ListNotice 获取通知信息列表
export function ListNotice(params: ListNoticeRequest) {
	return axios.get<ListNoticeReply>('/poverty/api/v1/notices', { params });
}

// CreateNotice 创建通知信息
export function CreateNotice(data: CreateNoticeRequest) {
	return axios.post<CreateNoticeReply>('/poverty/api/v1/notice', data);
}

// UpdateNotice 更新通知信息
export function UpdateNotice(data: UpdateNoticeRequest) {
	return axios.put('/poverty/api/v1/notice', data);
}

// DeleteNotice 删除通知信息
export function DeleteNotice(params: DeleteNoticeRequest) {
	return axios.delete('/poverty/api/v1/notice', { params });
}
