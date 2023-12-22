import axios from 'axios';
import { Server } from './types/server';
import { PageServerResourceReq, PageServerResourceRes } from './types/resource-server';

export function allResourceServer(id: number) {
	return axios.get<Server[]>('/configure/v1/resource/servers', {
		params: { resource_id: id }
	});
}

export function pageServerResource(req: PageServerResourceReq) {
	return axios.get<PageServerResourceRes>('/configure/v1/server/resources', {
		params: { ...req }
	});
}

export default null;
