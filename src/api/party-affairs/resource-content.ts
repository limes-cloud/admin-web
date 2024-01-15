import axios from 'axios';
import { UpdateResourceReq, PageResourceRes, AddResourceReq, PageResourceReq, Resource } from './types/resource';

export function pageResource(data: PageResourceReq) {
	return axios.get<PageResourceRes>('/party-affairs/admin/v1/resource/contents', {
		params: { ...data }
	});
}

export function getResource(id: number) {
	return axios.get<Resource>('/party-affairs/admin/v1/resource/content', {
		params: { id }
	});
}

export function addResource(data: AddResourceReq) {
	return axios.post('/party-affairs/admin/v1/resource/content', data);
}

export function updateResource(data: UpdateResourceReq) {
	return axios.put('/party-affairs/admin/v1/resource/content', data);
}

export function deleteResource(id: number) {
	return axios.delete('/party-affairs/admin/v1/resource/content', {
		params: { id }
	});
}

export default null;
