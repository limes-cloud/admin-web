import axios from 'axios';
import { ListModelReply, ListModelRequest, CreateModelReply, CreateModelRequest, UpdateModelRequest, DeleteModelRequest } from './type';

// ListModel 获取模型信息列表
export function ListModel(params: ListModelRequest) {
	return axios.get<ListModelReply>('/ai-agent/api/v1/models', { params });
}

// CreateModel 创建模型信息
export function CreateModel(data: CreateModelRequest) {
	return axios.post<CreateModelReply>('/ai-agent/api/v1/model', data);
}

// UpdateModel 更新模型信息
export function UpdateModel(data: UpdateModelRequest) {
	return axios.put('/ai-agent/api/v1/model', data);
}

// DeleteModel 删除模型信息
export function DeleteModel(params: DeleteModelRequest) {
	return axios.delete('/ai-agent/api/v1/model', { params });
}
