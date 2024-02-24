import axios from 'axios';
import { AppInterface, GetAppInterfaceTreeRes } from './types/app-interface';

export function getAppInterfaceTree(id: number) {
	return axios.get<GetAppInterfaceTreeRes>('/user-center/admin/v1/interfaces', { params: { app_id: id } });
}

export function addAppInterface(data: AppInterface) {
	return axios.post('/user-center/admin/v1/interface', data);
}

export function updateAppInterface(data: AppInterface) {
	return axios.put('/user-center/admin/v1/interface', data);
}

export function deleteAppInterface(id: number) {
	return axios.delete('/user-center/admin/v1/interface', { params: { id } });
}

export default null;
