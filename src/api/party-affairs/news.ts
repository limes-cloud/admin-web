import axios from 'axios';
import {
	UpdateNewsContentReq,
	PageNewsContentRes,
	AddNewsContentReq,
	PageNewsContentReq,
	NewsContent,
	AddNewsClassifyReq,
	NewsClassify,
	UpdateNewsClassifyReq,
	PageNewsCommentReq
} from './types/news';

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

export function pageNewsContent(data: PageNewsContentReq) {
	return axios.get<PageNewsContentRes>('/party-affairs/admin/v1/news/contents', {
		params: { ...data }
	});
}

export function getNewsContent(id: number) {
	return axios.get<NewsContent>('/party-affairs/admin/v1/news/content', {
		params: { id }
	});
}

export function addNewsContent(data: AddNewsContentReq) {
	return axios.post('/party-affairs/admin/v1/news/content', data);
}

export function updateNewsContent(data: UpdateNewsContentReq) {
	return axios.put('/party-affairs/admin/v1/news/content', data);
}

export function deleteNewsContent(id: number) {
	return axios.delete('/party-affairs/admin/v1/news/content', {
		params: { id }
	});
}

export function pageNewsComment(data: PageNewsCommentReq) {
	return axios.get<PageNewsContentRes>('/party-affairs/admin/v1/news/comments', {
		params: { ...data }
	});
}

export function deleteNewsComment(id: number) {
	return axios.delete('/party-affairs/admin/v1/news/comment', {
		params: { id }
	});
}

export default null;
