import axios from 'axios';
import { Department } from './types/department';

export function getDepartmentTree() {
	return axios.get<Department[]>('/manager/v1/department/tree');
}

export function addDepartment(data: Department) {
	return axios.post('/manager/v1/department', data);
}

export function updateDepartment(data: Department) {
	return axios.put('/manager/v1/department', data);
}

export function deleteDepartment(id: number) {
	return axios.delete('/manager/v1/department', { params: { id } });
}

export default null;
