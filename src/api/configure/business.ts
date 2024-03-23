import axios from 'axios';
import { PageBusinessReq, PageBusinessRes, Business, BusinessValue } from './types/business';

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

export function getBusinessValues(id: number) {
	return axios.get<{ list: BusinessValue[] }>('/configure/v1/business/values', {
		params: { business_id: id }
	});
}

export function updateBusinessValues(id: number, list: BusinessValue[]) {
	return axios.put('/configure/v1/business/values', {
		business_id: id,
		list
	});
}

export default null;
