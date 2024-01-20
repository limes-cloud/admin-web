import axios from 'axios';
import { CompareConfigureReq, CompareConfigureRes, SyncConfigureReq } from './types/configure';

export function syncConfigure(req: SyncConfigureReq) {
	return axios.put(`/configure/v1/configure`, req);
}

export function compareConfigure(req: CompareConfigureReq) {
	return axios.post<CompareConfigureRes>(`/configure/v1/configure/compare`, req);
}

export default null;
