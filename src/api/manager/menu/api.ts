import axios from 'axios';
import {
	ListMenuReply,
	ListMenuRequest,
	ListMenuByCurRoleReply,
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

// ListMenuByCurRole 获取菜单信息列表
export function ListMenuByCurRole() {
	return axios.get<ListMenuByCurRoleReply>('/manager/api/v1/menus/by/cur_role');
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
