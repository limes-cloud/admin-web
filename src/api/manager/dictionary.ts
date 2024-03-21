import axios from 'axios';
import {
	PageDictionaryReq,
	PageDictionaryRes,
	Dictionary,
	DictionaryValue,
	PageDictionaryValueReq,
	PageDictionaryValueRes
} from './types/dictionary';

export function getDictionary(id: number) {
	return axios.get<Dictionary>('/manager/v1/dictionary', { params: { id } });
}

export function pageDictionary(req: PageDictionaryReq) {
	return axios.get<PageDictionaryRes>('/manager/v1/dictionaries', { params: { ...req } });
}

export function addDictionary(data: Dictionary) {
	return axios.post('/manager/v1/dictionary', data);
}

export function updateDictionary(data: Dictionary) {
	return axios.put('/manager/v1/dictionary', data);
}

export function deleteDictionary(id: number) {
	return axios.delete('/manager/v1/dictionary', { params: { id } });
}

export function pageDictionaryValue(req: PageDictionaryValueReq) {
	return axios.get<PageDictionaryValueRes>('/manager/v1/dictionary/values', { params: { ...req } });
}

export function addDictionaryValue(data: DictionaryValue) {
	return axios.post('/manager/v1/dictionary/value', data);
}

export function updateDictionaryValue(data: DictionaryValue) {
	return axios.put('/manager/v1/dictionary/value', data);
}

export function deleteDictionaryValue(id: number) {
	return axios.delete('/manager/v1/dictionary/value', { params: { id } });
}
export default null;
