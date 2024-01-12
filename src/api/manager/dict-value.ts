import axios from 'axios';
import { PageDictValueReq, PageDictValueRes, DictValue, ReloadDictValueReq, ImportDictValueReq } from './types/dict-value';

export function loadDictValue(req: ReloadDictValueReq) {
	if (req.method === 'GET') {
		return axios.get(req.api, { params: req.params });
	}
	return axios.post(req.api, req.params);
}

export function pageDictValue(req: PageDictValueReq) {
	return axios.get<PageDictValueRes>('/manager/v1/dict/values', { params: { ...req } });
}

export function importDictValue(data: ImportDictValueReq) {
	return axios.post('/manager/v1/dict/values', data);
}

export function addDictValue(data: DictValue) {
	return axios.post('/manager/v1/dict/value', data);
}

export function updateDictValue(data: DictValue) {
	return axios.put('/manager/v1/dict/value', data);
}

export function deleteDictValue(id: number) {
	return axios.delete('/manager/v1/dict/value', { params: { id } });
}

export default null;
