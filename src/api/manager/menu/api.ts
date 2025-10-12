import axios from 'axios';
import {
	ListMenuReply,
	ListMenuRequest,
	ListCurrentMenuReply,
	CreateMenuReply,
	CreateMenuRequest,
	UpdateMenuRequest,
	DeleteMenuReply,
	DeleteMenuRequest
} from './type';

// ListMenu 获取菜单信息列表
export function ListMenu(params?: ListMenuRequest) {
	return axios.get<ListMenuReply>('/manager/api/v1/menus', { params });
}

export function ListCurrentMenu(params?: ListMenuRequest) {
	return axios.get<ListCurrentMenuReply>('/manager/api/v1/current/menus', { params });
}

// CreateMenu 创建菜单信息
export function CreateMenu(data: CreateMenuRequest) {
	return axios.post<CreateMenuReply>('/manager/api/v1/menu', data);
}

// UpdateMenu 更新菜单信息
export function UpdateMenu(data: UpdateMenuRequest) {
	return axios.put('/manager/api/v1/menu', data);
}

// DeleteMenu 删除菜单信息
export function DeleteMenu(params: DeleteMenuRequest) {
	return axios.delete<DeleteMenuReply>('/manager/api/v1/menu', { params });
}
