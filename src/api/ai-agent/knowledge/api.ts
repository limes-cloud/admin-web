import axios from 'axios';
import { ListKnowledgeReply, ListKnowledgeRequest, CreateKnowledgeRequest, UpdateKnowledgeRequest, DeleteKnowledgeRequest } from './type';

// ListKnowledge 获取知识库信息列表
export function ListKnowledge(params: ListKnowledgeRequest) {
	return axios.get<ListKnowledgeReply>('/ai-agent/api/v1/knowledges', { params });
}

// CreateKnowledge 创建知识库信息
export function CreateKnowledge(data: CreateKnowledgeRequest) {
	return axios.post('/ai-agent/api/v1/knowledge', data);
}

// UpdateKnowledge 更新知识库信息
export function UpdateKnowledge(data: UpdateKnowledgeRequest) {
	return axios.put('/ai-agent/api/v1/knowledge', data);
}

// DeleteKnowledge 删除知识库信息
export function DeleteKnowledge(params: DeleteKnowledgeRequest) {
	return axios.delete('/ai-agent/api/v1/knowledge', { params });
}
