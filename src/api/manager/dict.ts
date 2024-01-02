import axios from 'axios';
import { PageDictReq, PageDictRes, Dict } from './types/dict';

export function pageDict(req: PageDictReq) {
	return axios.get<PageDictRes>('/manager/v1/dicts', { params: { ...req } });
}

export function addDict(data: Dict) {
	return axios.post('/manager/v1/dict', data);
}

export function updateDict(data: Dict) {
	return axios.put('/manager/v1/dict', data);
}

export function deleteDict(id: number) {
	return axios.delete('/manager/v1/dict', { params: { id } });
}

export default null;
