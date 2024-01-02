import axios from 'axios';
import { PageJobReq, PageJobRes, Job } from './types/job';

export function userJobs(uid: number) {
	return axios.get<Job[]>('/manager/v1/user/jobs', { params: { id: uid } });
}

export function pageJob(req: PageJobReq) {
	return axios.get<PageJobRes>('/manager/v1/jobs', { params: { ...req } });
}

export function addJob(data: Job) {
	return axios.post('/manager/v1/job', data);
}

export function updateJob(data: Job) {
	return axios.put('/manager/v1/job', data);
}

export function deleteJob(id: number) {
	return axios.delete('/manager/v1/job', { params: { id } });
}

export default null;
