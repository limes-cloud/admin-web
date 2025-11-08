import axios from 'axios';
import {
	CreateInterflowClassifyReply,
	CreateInterflowClassifyRequest,
	DeleteInterflowClassifyRequest,
	ListInterflowClassifyReply,
	UpdateInterflowClassifyRequest
} from './type';

// ListInterflowClassify 获取任务分组列表
export function ListInterflowClassify() {
	return axios.get<ListInterflowClassifyReply>('/partyaffairs/api/v1/interflow/classifies');
}

// CreateInterflowClassify 创建任务分组
export function CreateInterflowClassify(data: CreateInterflowClassifyRequest) {
	return axios.post<CreateInterflowClassifyReply>('/partyaffairs/api/v1/interflow/classify', data);
}

// UpdateInterflowClassify 更新任务分组
export function UpdateInterflowClassify(data: UpdateInterflowClassifyRequest) {
	return axios.put('/partyaffairs/api/v1/interflow/classify', data);
}

// DeleteInterflowClassify 删除任务分组
export function DeleteInterflowClassify(params: DeleteInterflowClassifyRequest) {
	return axios.delete('/partyaffairs/api/v1/interflow/classify', { params });
}
