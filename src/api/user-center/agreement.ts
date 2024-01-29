import axios from 'axios';
import { PageAgreementRes, Agreement, PageAgreementReq } from './types/agreement';

export function getAgreement(id: number) {
	return axios.get<Agreement>('/user-center/admin/v1/agreement', { params: { id } });
}

export function pageAgreement(req: PageAgreementReq) {
	return axios.get<PageAgreementRes>('/user-center/admin/v1/agreements', { params: { ...req } });
}

export function addAgreement(data: Agreement) {
	return axios.post('/user-center/admin/v1/agreement', data);
}

export function updateAgreement(data: Agreement) {
	return axios.put('/user-center/admin/v1/agreement', data);
}

export function deleteAgreement(id: number) {
	return axios.delete('/user-center/admin/v1/agreement', { params: { id } });
}

export default null;
