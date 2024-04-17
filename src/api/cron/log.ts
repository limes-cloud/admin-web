import axios from 'axios';
import { PageLogReq, PageLogRes, Log } from '@/api/cron/types/log';

export function pageLog(req: PageLogReq) {
	return axios.get<PageLogRes>('/cron/v1/logs', { params: { ...req } });
}

export function getLog(id: number) {
	return axios.get<Log>('/cron/v1/log', { params: { id } });
}
