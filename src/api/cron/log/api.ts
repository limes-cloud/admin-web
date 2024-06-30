import axios from 'axios';
import { GetLogReply, GetLogRequest, ListLogReply, ListLogRequest, DeleteLogReply, DeleteLogRequest } from './type';

// GetLog 获取指定的日志信息
export function GetLog(params?: GetLogRequest) {
	return axios.get<GetLogReply>('/cron/api/v1/log', { params });
}

// ListLog 获取日志信息列表
export function ListLog(params: ListLogRequest) {
	return axios.get<ListLogReply>('/cron/api/v1/logs', { params });
}

// DeleteLog 删除日志信息
export function DeleteLog(params: DeleteLogRequest) {
	return axios.delete<DeleteLogReply>('/cron/api/v1/log', { params });
}
