import axios from 'axios';
import { PageExtraFieldRes, ExtraField, PageExtraFieldReq, AllExtraFieldTypeRes } from './types/extra-field';

export function allExtraFieldTypes() {
	return axios.get<AllExtraFieldTypeRes>('/user-center/admin/v1/extra-field/types');
}

export function pageExtraField(req: PageExtraFieldReq) {
	return axios.get<PageExtraFieldRes>('/user-center/admin/v1/extra-fields', { params: { ...req } });
}

export function addExtraField(data: ExtraField) {
	return axios.post('/user-center/admin/v1/extra-field', data);
}

export function updateExtraField(data: ExtraField) {
	return axios.put('/user-center/admin/v1/extra-field', data);
}

export function deleteExtraField(id: number) {
	return axios.delete('/user-center/admin/v1/extra-field', { params: { id } });
}

export default null;
