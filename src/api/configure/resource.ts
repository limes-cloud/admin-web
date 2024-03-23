import axios from 'axios';
import { PageResourceReq, PageResourceRes, Resource, ResourceValue } from './types/resource';

export function pageResource(req: PageResourceReq) {
	return axios.get<PageResourceRes>('/configure/v1/resources', {
		params: { ...req }
	});
}

export function addResource(data: Resource) {
	return axios.post('/configure/v1/resource', data);
}

export function updateResource(data: Resource) {
	return axios.put('/configure/v1/resource', data);
}

export function deleteResource(id: number) {
	return axios.delete('/configure/v1/resource', { params: { id } });
}

export function getResourceValues(id: number) {
	return axios.get<{ list: ResourceValue[] }>('/configure/v1/resource/values', {
		params: { resource_id: id }
	});
}

export function updateResourceValue(id: number, list: ResourceValue[]) {
	return axios.put('/configure/v1/resource/values', {
		resource_id: id,
		list
	});
}

export default null;
