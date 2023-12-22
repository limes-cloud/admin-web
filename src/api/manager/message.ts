import { ChatRecord, MessageListType } from '@/api/manager/types/message';
import axios from 'axios';

export function queryMessageList() {
	return axios.post<MessageListType>('/api/message/list');
}

interface MessageStatus {
	ids: number[];
}

export function setMessageStatus(data: MessageStatus) {
	return axios.post<MessageListType>('/api/message/read', data);
}

export function queryChatList() {
	return axios.post<ChatRecord[]>('/api/chat/list');
}
