import axios from 'axios';
import { UpdateResourceClassifyReq, ResourceClassify, AddResourceClassifyReq } from './types/resource-classify';

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

export default null;
