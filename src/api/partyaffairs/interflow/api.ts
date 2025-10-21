import axios from 'axios';
import {
	ListInterflowReply,
	ListInterflowRequest,
	DeleteInterflowRequest,
	CreateInterflowPersonReply,
	CreateInterflowPersonRequest,
	DeleteInterflowPersonRequest,
	ListInterflowPersonReply
} from './type';

// ListInterflowPerson 获取任务分组列表
export function ListInterflowPerson() {
	return axios.get<ListInterflowPersonReply>('/partyaffairs/api/v1/resource/classifies');
}

// CreateInterflowPerson 创建任务分组
export function CreateInterflowPerson(data: CreateInterflowPersonRequest) {
	return axios.post<CreateInterflowPersonReply>('/partyaffairs/api/v1/resource/person', data);
}

// DeleteInterflowPerson 删除任务分组
export function DeleteInterflowPerson(params: DeleteInterflowPersonRequest) {
	return axios.delete('/partyaffairs/api/v1/resource/person', { params });
}

// ListInterflow 获取资讯信息列表
export function ListInterflow(params: ListInterflowRequest) {
	return axios.get<ListInterflowReply>('/partyaffairs/api/v1/resources', { params });
}

// DeleteInterflow 删除资讯信息
export function DeleteInterflow(params: DeleteInterflowRequest) {
	return axios.delete('/partyaffairs/api/v1/resource', { params });
}
