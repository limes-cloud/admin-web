import axios from 'axios';
import {
	GetDirectoryReply,
	GetDirectoryRequest,
	ListDirectoryReply,
	ListDirectoryRequest,
	CreateDirectoryReply,
	CreateDirectoryRequest,
	UpdateDirectoryRequest,
	DeleteDirectoryReply,
	DeleteDirectoryRequest
} from './type';

// GetDirectory 获取指定的文件目录信息
export function GetDirectory(params?: GetDirectoryRequest) {
	return axios.get<GetDirectoryReply>('/resource/api/v1/directory', { params });
}

// ListDirectory 获取文件目录信息列表
export function ListDirectory(params?: ListDirectoryRequest) {
	return axios.get<ListDirectoryReply>('/resource/api/v1/directories', { params });
}

// CreateDirectory 创建文件目录信息
export function CreateDirectory(data: CreateDirectoryRequest) {
	return axios.post<CreateDirectoryReply>('/resource/api/v1/directory', data);
}

// UpdateDirectory 更新文件目录信息
export function UpdateDirectory(data: UpdateDirectoryRequest) {
	return axios.put('/resource/api/v1/directory', data);
}

// DeleteDirectory 删除文件目录信息
export function DeleteDirectory(params: DeleteDirectoryRequest) {
	return axios.delete<DeleteDirectoryReply>('/resource/api/v1/directory', { params });
}
