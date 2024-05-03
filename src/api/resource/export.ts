import axios from 'axios';
import { Export } from './types/export';

export function pageExport(req) {
	return axios.get<{ list: Export[]; total: number }>(`/resource/v1/exports`, {
		params: req
	});
}

export function addExport(req) {
	return axios.post(`/resource/v1/export`, req);
}

export function deleteExport(id) {
	return axios.delete(`/resource/v1/export`, { params: { id } });
}

export default null;
