import axios from 'axios';
import { AllBusinessValue, BusinessValue } from './types/business-value';

export function allBusinessValue(id: number) {
	return axios.get<AllBusinessValue>('/configure/v1/business/values', {
		params: { business_id: id }
	});
}

export function updateBusinessValue(id: number, list: BusinessValue[]) {
	return axios.put('/configure/v1/business/value', {
		business_id: id,
		list
	});
}

export default null;
