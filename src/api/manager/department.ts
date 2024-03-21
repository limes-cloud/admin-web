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

export function allDepartmentObject(params) {
	return axios.get('/manager/v1/department/objects', { params });
}

export function importDepartmentObject(data) {
	return axios.post('/manager/v1/department/objects', data);
}

export function addDepartmentObject(tp: string, val: any) {
	return axios.post('/manager/v1/department/object', { object_keyword: tp, value: String(val) });
}

export function deleteDepartmentObject(tp: string, val: any) {
	return axios.delete('/manager/v1/department/object', { params: { object_keyword: tp, value: String(val) } });
}

export default null;
