import axios from 'axios';
import { WorkerGroup } from '@/api/cron/types/worker';

export function allWorkerGroup() {
	return axios.get<{ list: WorkerGroup[] }>('/cron/v1/worker/groups');
}

export function addWorkerGroup(data: WorkerGroup) {
	return axios.post('/cron/v1/worker/group', data);
}

export function updateWorkerGroup(data: WorkerGroup) {
	return axios.put('/cron/v1/worker/group', data);
}

export function deleteWorkerGroup(id: number) {
	return axios.delete('/cron/v1/worker/group', { params: { id } });
}
