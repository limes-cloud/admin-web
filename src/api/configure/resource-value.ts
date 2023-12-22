import axios from 'axios';
import { ResourceValue } from './types/resource-value';

export function allResourceValue(id: number) {
	return axios.get<ResourceValue[]>('/configure/v1/resource/values', {
		params: { resource_id: id }
	});
}

export function updateResourceValue(id: number, list: ResourceValue[]) {
	return axios.put('/configure/v1/resource/value', {
		resource_id: id,
		list
	});
}

export default null;
