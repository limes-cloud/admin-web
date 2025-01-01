import axios from 'axios';
import {
	ListChannelReply,
	ListChannelRequest,
	CreateChannelReply,
	CreateChannelRequest,
	UpdateChannelRequest,
	DeleteChannelReply,
	DeleteChannelRequest,
	ChannelType
} from './type';

// ListChannel 获取可用的发送渠道列表
export function ListChannelType() {
	return axios.get<{ list: ChannelType[] }>('/notify/api/v1/channel/types');
}

// ListChannel 获取发送渠道列表
export function ListChannel(params: ListChannelRequest) {
	return axios.get<ListChannelReply>('/notify/api/v1/channels', { params });
}

// CreateChannel 创建发送渠道
export function CreateChannel(data: CreateChannelRequest) {
	return axios.post<CreateChannelReply>('/notify/api/v1/channel', data);
}

// UpdateChannel 更新发送渠道
export function UpdateChannel(data: UpdateChannelRequest) {
	return axios.put('/notify/api/v1/channel', data);
}

// DeleteChannel 删除发送渠道
export function DeleteChannel(params: DeleteChannelRequest) {
	return axios.delete<DeleteChannelReply>('/notify/api/v1/channel', { params });
}
