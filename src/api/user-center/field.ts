import axios from 'axios';
import { PageFieldRes, Field, PageFieldReq, AllFieldTypeRes } from './types/field';

export function allFieldTypes() {
	return axios.get<AllFieldTypeRes>('/user-center/admin/v1/field/types');
}

export function pageField(req: PageFieldReq) {
	return axios.get<PageFieldRes>('/user-center/admin/v1/fields', { params: { ...req } });
}

export function addField(data: Field) {
	return axios.post('/user-center/admin/v1/field', data);
}

export function updateField(data: Field) {
	return axios.put('/user-center/admin/v1/field', data);
}

export function deleteField(id: number) {
	return axios.delete('/user-center/admin/v1/field', { params: { id } });
}

export default null;
