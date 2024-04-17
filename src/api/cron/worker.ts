import axios from 'axios';
import { PageWorkerReq, PageWorkerRes, WorkerGroup, Worker } from '@/api/cron/types/worker';

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

export function pageWorker(req: PageWorkerReq) {
	return axios.get<PageWorkerRes>('/cron/v1/workers', { params: { ...req } });
}

export function addWorker(data: Worker) {
	return axios.post('/cron/v1/worker', data);
}

export function enableWorker(id: number) {
	return axios.post('/cron/v1/worker/enable', { id });
}

export function disableWorker(id: number) {
	return axios.post('/cron/v1/worker/disable', { id });
}

export function updateWorker(data: Worker) {
	return axios.put('/cron/v1/worker', data);
}

export function deleteWorker(id: number) {
	return axios.delete('/cron/v1/worker', { params: { id } });
}
