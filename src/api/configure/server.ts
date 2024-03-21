import axios from 'axios';
import { PageServerReq, PageServerRes, Server } from './types/server';

export function pageServer(req: PageServerReq) {
	return axios.get<PageServerRes>('/configure/v1/servers', {
		params: { ...req }
	});
}

export function addServer(data: Server) {
	return axios.post<{ id: number }>('/configure/v1/server', data);
}

export function updateServer(data: Server) {
	return axios.put('/configure/v1/server', data);
}

export function deleteServer(id: number) {
	return axios.delete('/configure/v1/server', { params: { id } });
}

export default null;
