import axios from 'axios';
import {
	GetExportReply,
	GetExportRequest,
	ListExportReply,
	ListExportRequest,
	CreateExportReply,
	CreateExportRequest,
	UpdateExportRequest,
	DeleteExportReply,
	DeleteExportRequest
} from './type';

// GetExport 获取指定的导出信息
export function GetExport(params?: GetExportRequest) {
	return axios.get<GetExportReply>('/resource/api/v1/export', { params });
}

// ListExport 获取导出信息列表
export function ListExport(params: ListExportRequest) {
	return axios.get<ListExportReply>('/resource/api/v1/exports', { params });
}

// CreateExport 创建导出信息
export function CreateExport(data: CreateExportRequest) {
	return axios.post<CreateExportReply>('/resource/api/v1/export', data);
}

// UpdateExport 更新导出信息
export function UpdateExport(data: UpdateExportRequest) {
	return axios.put('/resource/api/v1/export', data);
}

// DeleteExport 删除导出信息
export function DeleteExport(params: DeleteExportRequest) {
	return axios.delete<DeleteExportReply>('/resource/api/v1/export', { params });
}
