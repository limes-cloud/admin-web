import axios from 'axios';
import { UpdateNewsClassifyReq, NewsClassify, AddNewsClassifyReq } from './types/news-classify';

export function allNewsClassify() {
	return axios.get<{ list: NewsClassify[] }>('/party-affairs/admin/v1/news/classify');
}

export function addNewsClassify(data: AddNewsClassifyReq) {
	return axios.post('/party-affairs/admin/v1/news/classify', data);
}

export function updateNewsClassify(data: UpdateNewsClassifyReq) {
	return axios.put('/party-affairs/admin/v1/news/classify', data);
}

export function deleteNewsClassify(id: number) {
	return axios.delete('/party-affairs/admin/v1/news/classify', {
		params: { id }
	});
}

export default null;
