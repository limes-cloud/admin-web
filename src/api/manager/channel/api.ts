import axios from 'axios';
import {
	ListChannelReply,
	ListChannelRequest,
	CreateChannelReply,
	CreateChannelRequest,
	UpdateChannelRequest,
	DeleteChannelReply,
	DeleteChannelRequest,
	ChannelType,
	AdminChannel
} from './type';

// ListChannel 获取可用的登陆渠道列表
export function ListChannelType() {
	return axios.get<{ list: ChannelType[] }>('/manager/api/v1/channel/types');
}

// ListChannel 获取可用的登陆渠道列表
export function ListAdminChannel() {
	return axios.get<{ list: AdminChannel[] }>('/manager/api/v1/admin_channels');
}

// ListChannel 获取登陆渠道列表
export function ListChannel(params: ListChannelRequest) {
	return axios.get<ListChannelReply>('/manager/api/v1/channels', { params });
}

// CreateChannel 创建登陆渠道
export function CreateChannel(data: CreateChannelRequest) {
	return axios.post<CreateChannelReply>('/manager/api/v1/channel', data);
}

// UpdateChannel 更新登陆渠道
export function UpdateChannel(data: UpdateChannelRequest) {
	return axios.put('/manager/api/v1/channel', data);
}

// DeleteChannel 删除登陆渠道
export function DeleteChannel(params: DeleteChannelRequest) {
	return axios.delete<DeleteChannelReply>('/manager/api/v1/channel', { params });
}
