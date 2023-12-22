import axios from 'axios';
import { UpdateResourceReq, PageResourceRes, AddResourceReq, PageResourceReq, Resource } from './types/resource';

export function pageResource(data: PageResourceReq) {
	return axios.get<PageResourceRes>('/party_affairs/admin/v1/resource/page', {
		params: { ...data }
	});
}

export function getResource(id: number) {
	return axios.get<Resource>('/party_affairs/admin/v1/resource', {
		params: { id }
	});
}

export function addResource(data: AddResourceReq) {
	return axios.post('/party_affairs/admin/v1/resource', data);
}

export function updateResource(data: UpdateResourceReq) {
	return axios.put('/party_affairs/admin/v1/resource', data);
}

export function deleteResource(id: number) {
	return axios.delete('/party_affairs/admin/v1/resource', {
		params: { id }
	});
}

export default null;
