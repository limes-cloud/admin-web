import axios from 'axios';
import {
	ListChannelReply,
	ListChannelRequest,
	CreateChannelReply,
	CreateChannelRequest,
	UpdateChannelRequest,
	UpdateChannelStatusRequest,
	DeleteChannelReply,
	DeleteChannelRequest,
	ChannelType
} from './type';

// ListChannel 获取可用的登陆渠道列表
export function ListChannelType() {
	return axios.get<{ list: ChannelType[] }>('/usercenter/api/v1/channel/types');
}

// ListChannel 获取登陆渠道列表
export function ListChannel(params: ListChannelRequest) {
	return axios.get<ListChannelReply>('/usercenter/api/v1/channels', { params });
}

// CreateChannel 创建登陆渠道
export function CreateChannel(data: CreateChannelRequest) {
	return axios.post<CreateChannelReply>('/usercenter/api/v1/channel', data);
}

// UpdateChannel 更新登陆渠道
export function UpdateChannel(data: UpdateChannelRequest) {
	return axios.put('/usercenter/api/v1/channel', data);
}

// UpdateChannelStatus 更新登陆渠道状态
export function UpdateChannelStatus(data: UpdateChannelStatusRequest) {
	return axios.put('/usercenter/api/v1/channel/status', data);
}

// DeleteChannel 删除登陆渠道
export function DeleteChannel(params: DeleteChannelRequest) {
	return axios.delete<DeleteChannelReply>('/usercenter/api/v1/channel', { params });
}
