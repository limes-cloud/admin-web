import axios from 'axios';
import { UpdateNewsClassifyReq, NewsClassify, AddNewsClassifyReq } from './types/news_classify';

export function allNewsClassify() {
	return axios.get<NewsClassify[]>('/party_affairs/admin/v1/news_classify');
}

export function addNewsClassify(data: AddNewsClassifyReq) {
	return axios.post('/party_affairs/admin/v1/news_classify', data);
}

export function updateNewsClassify(data: UpdateNewsClassifyReq) {
	return axios.put('/party_affairs/admin/v1/news_classify', data);
}

export function deleteNewsClassify(id: number) {
	return axios.delete('/party_affairs/admin/v1/news_classify', {
		params: { id }
	});
}

export default null;
