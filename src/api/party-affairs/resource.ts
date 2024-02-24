import axios from 'axios';
import {
	UpdateResourceClassifyReq,
	ResourceClassify,
	AddResourceClassifyReq,
	PageResourceContentReq,
	AddResourceContentReq,
	PageResourceContentRes,
	ResourceContent,
	UpdateResourceContentReq
} from './types/resource';

export function allResourceClassify() {
	return axios.get<{ list: ResourceClassify[] }>('/party-affairs/admin/v1/resource/classify');
}

export function addResourceClassify(data: AddResourceClassifyReq) {
	return axios.post('/party-affairs/admin/v1/resource/classify', data);
}

export function updateResourceClassify(data: UpdateResourceClassifyReq) {
	return axios.put('/party-affairs/admin/v1/resource/classify', data);
}

export function deleteResourceClassify(id: number) {
	return axios.delete('/party-affairs/admin/v1/resource/classify', {
		params: { id }
	});
}

export function pageResourceContent(data: PageResourceContentReq) {
	return axios.get<PageResourceContentRes>('/party-affairs/admin/v1/resource/contents', {
		params: { ...data }
	});
}

export function getResourceContent(id: number) {
	return axios.get<ResourceContent>('/party-affairs/admin/v1/resource/content', {
		params: { id }
	});
}

export function addResourceContent(data: AddResourceContentReq) {
	return axios.post('/party-affairs/admin/v1/resource/content', data);
}

export function updateResourceContent(data: UpdateResourceContentReq) {
	return axios.put('/party-affairs/admin/v1/resource/content', data);
}

export function deleteResourceContent(id: number) {
	return axios.delete('/party-affairs/admin/v1/resource/content', {
		params: { id }
	});
}

export default null;
