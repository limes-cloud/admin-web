import axios from 'axios';
import { ListLogReply, ListLogRequest } from './type';

// ListLog 获取发送渠道列表
export function ListLog(params: ListLogRequest) {
	return axios.get<ListLogReply>('/notify/api/v1/logs', { params });
}

export default null;
