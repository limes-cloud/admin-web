import axios from 'axios';
import { UpdateNewsReq, PageNewsRes, AddNewsReq, PageNewsReq, News } from './types/news';

export function pageNews(data: PageNewsReq) {
	return axios.get<PageNewsRes>('/party_affairs/admin/v1/news/page', {
		params: { ...data }
	});
}

export function getNews(id: number) {
	return axios.get<News>('/party_affairs/admin/v1/news', {
		params: { id }
	});
}

export function addNews(data: AddNewsReq) {
	return axios.post('/party_affairs/admin/v1/news', data);
}

export function updateNews(data: UpdateNewsReq) {
	return axios.put('/party_affairs/admin/v1/news', data);
}

export function deleteNews(id: number) {
	return axios.delete('/party_affairs/admin/v1/news', {
		params: { id }
	});
}

export default null;
