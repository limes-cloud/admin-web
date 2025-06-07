import axios from 'axios';
import {
	ListToolReply,
	ListToolRequest,
	CreateToolReply,
	CreateToolRequest,
	UpdateToolRequest,
	DeleteToolRequest,
	ExecToolRequest,
	ExecToolReply
} from './type';

// ListTool 获取工具信息列表
export function ListTool(params: ListToolRequest) {
	return axios.get<ListToolReply>('/ai-agent/api/v1/tools', { params });
}

// CreateTool 创建工具信息
export function CreateTool(data: CreateToolRequest) {
	return axios.post<CreateToolReply>('/ai-agent/api/v1/tool', data);
}

// UpdateTool 更新工具信息
export function UpdateTool(data: UpdateToolRequest) {
	return axios.put('/ai-agent/api/v1/tool', data);
}

// DeleteTool 删除工具信息
export function DeleteTool(params: DeleteToolRequest) {
	return axios.delete('/ai-agent/api/v1/tool', { params });
}

// ExecTool 执行工具
export function ExecTool(data: ExecToolRequest) {
	return axios.post<ExecToolReply>('/ai-agent/api/v1/tool/exec', data);
}
