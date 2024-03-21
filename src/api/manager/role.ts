import axios from 'axios';
import { Role, UpdateRoleMenuReq } from './types/role';

export function getRoleTree() {
	return axios.get<Role>('/manager/v1/role/tree');
}

export function addRole(data: Role) {
	return axios.post('/manager/v1/role', data);
}

export function updateRole(data: Role) {
	return axios.put('/manager/v1/role', data);
}

export function deleteRole(id: number) {
	return axios.delete('/manager/v1/role', { params: { id } });
}

export function getRoleMenuIds(id: number) {
	return axios.get('/manager/v1/role/menu/ids', { params: { role_id: id } });
}

export function updateRoleMenu(data: UpdateRoleMenuReq) {
	return axios.put('/manager/v1/role/menu', data);
}

export default null;
