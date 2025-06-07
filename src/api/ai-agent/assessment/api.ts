import axios from 'axios';
import {
	ListAssessmentReply,
	ListAssessmentRequest,
	CreateAssessmentReply,
	CreateAssessmentRequest,
	UpdateAssessmentRequest,
	DeleteAssessmentRequest
} from './type';

// ListAssessment 获取评估信息列表
export function ListAssessment(params: ListAssessmentRequest) {
	return axios.get<ListAssessmentReply>('/ai-agent/api/v1/assessments', { params });
}

// CreateAssessment 创建评估信息
export function CreateAssessment(data: CreateAssessmentRequest) {
	return axios.post<CreateAssessmentReply>('/ai-agent/api/v1/assessment', data);
}

// UpdateAssessment 更新评估信息
export function UpdateAssessment(data: UpdateAssessmentRequest) {
	return axios.put('/ai-agent/api/v1/assessment', data);
}

// DeleteAssessment 删除评估信息
export function DeleteAssessment(params: DeleteAssessmentRequest) {
	return axios.delete('/ai-agent/api/v1/assessment', { params });
}
