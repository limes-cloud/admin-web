import axios from 'axios';
import { CompareConfigureRequest, CompareConfigureReply, SyncConfigureRequest } from './type';

export function SyncConfigure(req: SyncConfigureRequest) {
	return axios.put(`/configure/api/v1/configure`, req);
}

export function CompareConfigure(req: CompareConfigureRequest) {
	return axios.post<CompareConfigureReply>(`/configure/api/v1/configure/compare`, req);
}

export default null;
