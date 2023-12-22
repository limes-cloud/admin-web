import axios from 'axios';
import { Menu } from './types/menu';

export function getMenuTree() {
	return axios.get<Menu[]>('/manager/v1/menu/tree');
}

export function addMenu(data: Menu) {
	return axios.post('/manager/v1/menu', data);
}

export function updateMenu(data: Menu) {
	return axios.put('/manager/v1/menu', data);
}

export function deleteMenu(id: number) {
	return axios.delete('/manager/v1/menu', { params: { id } });
}

export default null;
