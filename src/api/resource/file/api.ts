import axios from 'axios';
import {
	GetFileReply,
	GetFileRequest,
	ListFileReply,
	ListFileRequest,
	CreateFileReply,
	CreateFileRequest,
	UpdateFileRequest,
	DeleteFileReply,
	DeleteFileRequest,
	PrepareUploadFileRequest,
	PrepareUploadFileReply,
	UploadFileReply
} from './type';

// GetFile 获取指定的文件信息
export function GetFile(params?: GetFileRequest) {
	return axios.get<GetFileReply>('/resource/api/v1/file', { params });
}

// ListFile 获取文件信息列表
export function ListFile(params: ListFileRequest) {
	return axios.get<ListFileReply>('/resource/api/v1/files', { params });
}

// CreateFile 创建文件信息
export function CreateFile(data: CreateFileRequest) {
	return axios.post<CreateFileReply>('/resource/api/v1/file', data);
}

export function PrepareUploadFile(data: PrepareUploadFileRequest) {
	return axios.post<PrepareUploadFileReply>('/resource/api/v1/file/prepare_upload', data);
}

export function UploadFile(req: FormData) {
	return axios.post<UploadFileReply>(`/resource/api/v1/upload`, req, {
		headers: {
			'Content-Type': 'multipart/form-data'
		}
	});
}

// UpdateFile 更新文件信息
export function UpdateFile(data: UpdateFileRequest) {
	return axios.put('/resource/api/v1/file', data);
}

// DeleteFile 删除文件信息
export function DeleteFile(params: DeleteFileRequest) {
	return axios.delete<DeleteFileReply>('/resource/api/v1/file', { params });
}
