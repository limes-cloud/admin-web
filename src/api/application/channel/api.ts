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

// ListChannel 获取可用的登陆渠道列表
export function ListChannelType() {
	return axios.get<{ list: ChannelType[] }>('/application/api/v1/channel/types');
}

// ListChannel 获取登陆渠道列表
export function ListChannel(params: ListChannelRequest) {
	return axios.get<ListChannelReply>('/application/api/v1/channels', { params });
}

// CreateChannel 创建登陆渠道
export function CreateChannel(data: CreateChannelRequest) {
	return axios.post<CreateChannelReply>('/application/api/v1/channel', data);
}

// UpdateChannel 更新登陆渠道
export function UpdateChannel(data: UpdateChannelRequest) {
	return axios.put('/application/api/v1/channel', data);
}

// DeleteChannel 删除登陆渠道
export function DeleteChannel(params: DeleteChannelRequest) {
	return axios.delete<DeleteChannelReply>('/application/api/v1/channel', { params });
}
