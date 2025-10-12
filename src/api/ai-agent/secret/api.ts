import axios from 'axios';
import {
	ListSecretReply,
	ListSecretRequest,
	CreateSecretReply,
	CreateSecretRequest,
	UpdateSecretRequest,
	DeleteSecretRequest,
	ListSecretGroupRequest,
	ListSecretGroupReply,
	CreateSecretGroupRequest,
	CreateSecretGroupReply,
	UpdateSecretGroupRequest,
	DeleteSecretGroupRequest
} from './type';

// ListSecretGroup 获取密钥分组列表
export function ListSecretGroup(params: ListSecretGroupRequest) {
	return axios.get<ListSecretGroupReply>('/ai-agent/api/v1/secret_groups', { params });
}

// CreateSecretGroup 创建密钥分组
export function CreateSecretGroup(data: CreateSecretGroupRequest) {
	return axios.post<CreateSecretGroupReply>('/ai-agent/api/v1/secret_group', data);
}

// UpdateSecretGroup 更新密钥分组
export function UpdateSecretGroup(data: UpdateSecretGroupRequest) {
	return axios.put('/ai-agent/api/v1/secret_group', data);
}

// DeleteSecretGroup 删除密钥分组
export function DeleteSecretGroup(params: DeleteSecretGroupRequest) {
	return axios.delete('/ai-agent/api/v1/secret_group', { params });
}

// ListSecret 获取密钥信息列表
export function ListSecret(params: ListSecretRequest) {
	return axios.get<ListSecretReply>('/ai-agent/api/v1/secrets', { params });
}

// CreateSecret 创建密钥信息
export function CreateSecret(data: CreateSecretRequest) {
	return axios.post<CreateSecretReply>('/ai-agent/api/v1/secret', data);
}

// UpdateSecret 更新密钥信息
export function UpdateSecret(data: UpdateSecretRequest) {
	return axios.put('/ai-agent/api/v1/secret', data);
}

// DeleteSecret 删除密钥信息
export function DeleteSecret(params: DeleteSecretRequest) {
	return axios.delete('/ai-agent/api/v1/secret', { params });
}
