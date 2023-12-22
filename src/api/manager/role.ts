import axios from 'axios';
import { Role } from './types/role';

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

export default null;
