import axios from 'axios';
import {
	ListDictionaryReply,
	ListDictionaryRequest,
	CreateDictionaryReply,
	CreateDictionaryRequest,
	UpdateDictionaryRequest,
	DeleteDictionaryReply,
	DeleteDictionaryRequest,
	ListDictionaryValueReply,
	ListDictionaryValueRequest,
	CreateDictionaryValueReply,
	CreateDictionaryValueRequest,
	UpdateDictionaryValueRequest,
	UpdateDictionaryValueStatusRequest,
	DeleteDictionaryValueReply,
	DeleteDictionaryValueRequest,
	GetDictionaryReply,
	GetDictionaryRequest
} from './type';

// ListDictionary 获取字典目录列表
export function ListDictionary(params: ListDictionaryRequest) {
	return axios.get<ListDictionaryReply>('/manager/api/v1/dictionaries', { params });
}

// CreateDictionary 创建字典目录
export function CreateDictionary(data: CreateDictionaryRequest) {
	return axios.post<CreateDictionaryReply>('/manager/api/v1/dictionary', data);
}

// UpdateDictionary 更新字典目录
export function UpdateDictionary(data: UpdateDictionaryRequest) {
	return axios.put('/manager/api/v1/dictionary', data);
}

// DeleteDictionary 删除字典目录
export function DeleteDictionary(params: DeleteDictionaryRequest) {
	return axios.delete<DeleteDictionaryReply>('/manager/api/v1/dictionary', { params });
}

// ListDictionaryValue 获取字典值目录列表
export function ListDictionaryValue(params: ListDictionaryValueRequest) {
	return axios.get<ListDictionaryValueReply>('/manager/api/v1/dictionary_values', { params });
}

// CreateDictionaryValue 创建字典值目录
export function CreateDictionaryValue(data: CreateDictionaryValueRequest) {
	return axios.post<CreateDictionaryValueReply>('/manager/api/v1/dictionary_value', data);
}

// UpdateDictionaryValue 更新字典值目录
export function UpdateDictionaryValue(data: UpdateDictionaryValueRequest) {
	return axios.put('/manager/api/v1/dictionary_value', data);
}

// UpdateDictionaryValueStatus 更新字典值目录状态
export function UpdateDictionaryValueStatus(data: UpdateDictionaryValueStatusRequest) {
	return axios.put('/manager/api/v1/dictionary_value/status', data);
}

// DeleteDictionaryValue 删除字典值目录
export function DeleteDictionaryValue(params: DeleteDictionaryValueRequest) {
	return axios.delete<DeleteDictionaryValueReply>('/manager/api/v1/dictionary_value', { params });
}

// GetDictionary 获取指定的字典目录
export function GetDictionary(params: GetDictionaryRequest) {
	return axios.get<GetDictionaryReply>('/manager/api/v1/dictionary', { params });
}
