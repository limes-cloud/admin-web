import axios from 'axios';
import { PageAppRes, App, PageAppReq } from './types/app';

export function pageApp(req: PageAppReq) {
	return axios.get<PageAppRes>('/user-center/admin/v1/apps', { params: { ...req } });
}

export function addApp(data: App) {
	return axios.post('/user-center/admin/v1/app', data);
}

export function updateApp(data: App) {
	return axios.put('/user-center/admin/v1/app', data);
}

export function deleteApp(id: number) {
	return axios.delete('/user-center/admin/v1/app', { params: { id } });
}

export default null;
