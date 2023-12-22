import axios from 'axios';
import { PageBusinessReq, PageBusinessRes, Business } from './types/business';

export function pageBusiness(req: PageBusinessReq) {
	return axios.get<PageBusinessRes>('/configure/v1/business', {
		params: { ...req }
	});
}

export function addBusiness(data: Business) {
	return axios.post('/configure/v1/business', data);
}

export function updateBusiness(data: Business) {
	return axios.put('/configure/v1/business', data);
}

export function deleteBusiness(id: number) {
	return axios.delete('/configure/v1/business', { params: { id } });
}

export default null;
