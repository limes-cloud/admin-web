import axios from 'axios';
import { ListChatRecordReply, ListChatRecordRequest } from './type';

// ListInformation 获取资讯记录
export function ListChatRecord(params: ListChatRecordRequest) {
	return axios.get<ListChatRecordReply>('/poverty/api/v1/chat/records', { params });
}

export default null;
