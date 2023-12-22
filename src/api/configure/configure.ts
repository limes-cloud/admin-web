import axios from 'axios';
import { syncConfigureReq } from './types/configure';

export function syncConfigure(req: syncConfigureReq) {
	return axios.put(`/configure/v1/configure/${req.env_keyword}`, req);
}

export default null;
