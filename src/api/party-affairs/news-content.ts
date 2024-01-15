import axios from 'axios';
import { UpdateNewsReq, PageNewsRes, AddNewsReq, PageNewsReq, News } from './types/news';

export function pageNews(data: PageNewsReq) {
	return axios.get<PageNewsRes>('/party-affairs/admin/v1/news/contents', {
		params: { ...data }
	});
}

export function getNews(id: number) {
	return axios.get<News>('/party-affairs/admin/v1/news/content', {
		params: { id }
	});
}

export function addNews(data: AddNewsReq) {
	return axios.post('/party-affairs/admin/v1/news/content', data);
}

export function updateNews(data: UpdateNewsReq) {
	return axios.put('/party-affairs/admin/v1/news/content', data);
}

export function deleteNews(id: number) {
	return axios.delete('/party-affairs/admin/v1/news/content', {
		params: { id }
	});
}

export default null;
