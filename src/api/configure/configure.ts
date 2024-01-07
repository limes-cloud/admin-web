import axios from 'axios';
import { CompareConfigureReq, SyncConfigureReq } from './types/configure';

export function syncConfigure(req: SyncConfigureReq) {
	return axios.put(`/configure/v1/configure/${req.env_keyword}`, req);
}

export function compareConfigure(req: CompareConfigureReq) {
	return axios.post(`/configure/v1/configure/compare/${req.env_keyword}`, req);
}

export default null;
