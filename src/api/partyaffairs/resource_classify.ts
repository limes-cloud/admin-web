import axios from 'axios';
import { UpdateResourceClassifyReq, ResourceClassify, AddResourceClassifyReq } from './types/resource_classify';

export function allResourceClassify() {
	return axios.get<ResourceClassify[]>('/party_affairs/admin/v1/resource_classify');
}

export function addResourceClassify(data: AddResourceClassifyReq) {
	return axios.post('/party_affairs/admin/v1/resource_classify', data);
}

export function updateResourceClassify(data: UpdateResourceClassifyReq) {
	return axios.put('/party_affairs/admin/v1/resource_classify', data);
}

export function deleteResourceClassify(id: number) {
	return axios.delete('/party_affairs/admin/v1/resource_classify', {
		params: { id }
	});
}

export default null;
