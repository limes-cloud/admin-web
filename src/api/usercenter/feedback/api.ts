import axios from 'axios';
import {
	ListFeedbackCategoryReply,
	ListFeedbackCategoryRequest,
	CreateFeedbackCategoryReply,
	CreateFeedbackCategoryRequest,
	UpdateFeedbackCategoryRequest,
	DeleteFeedbackCategoryReply,
	DeleteFeedbackCategoryRequest,
	ListFeedbackReply,
	ListFeedbackRequest,
	CreateFeedbackReply,
	CreateFeedbackRequest,
	DeleteFeedbackReply,
	DeleteFeedbackRequest,
	UpdateFeedbackRequest
} from './type';

// ListFeedbackCategory 获取反馈建议分类列表
export function ListFeedbackCategory(params: ListFeedbackCategoryRequest) {
	return axios.get<ListFeedbackCategoryReply>('/usercenter/api/v1/feedback_categories', { params });
}

// CreateFeedbackCategory 创建反馈建议分类
export function CreateFeedbackCategory(data: CreateFeedbackCategoryRequest) {
	return axios.post<CreateFeedbackCategoryReply>('/usercenter/api/v1/feedback_category', data);
}

// UpdateFeedbackCategory 更新反馈建议分类
export function UpdateFeedbackCategory(data: UpdateFeedbackCategoryRequest) {
	return axios.put('/usercenter/api/v1/feedback_category', data);
}

// DeleteFeedbackCategory 删除反馈建议分类
export function DeleteFeedbackCategory(params: DeleteFeedbackCategoryRequest) {
	return axios.delete<DeleteFeedbackCategoryReply>('/usercenter/api/v1/feedback_category', { params });
}

// ListFeedback 获取反馈建议列表
export function ListFeedback(params: ListFeedbackRequest) {
	return axios.get<ListFeedbackReply>('/usercenter/api/v1/feedbacks', { params });
}

// CreateFeedback 创建反馈建议
export function CreateFeedback(data: CreateFeedbackRequest) {
	return axios.post<CreateFeedbackReply>('/usercenter/api/v1/feedback', data);
}

// DeleteFeedback 删除反馈建议
export function DeleteFeedback(params: DeleteFeedbackRequest) {
	return axios.delete<DeleteFeedbackReply>('/usercenter/api/v1/feedback', { params });
}

// UpdateFeedback 更新反馈建议
export function UpdateFeedback(data: UpdateFeedbackRequest) {
	return axios.put('/usercenter/api/v1/feedback', data);
}
