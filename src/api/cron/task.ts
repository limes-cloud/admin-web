import axios from 'axios';
import { PageTaskReq, PageTaskRes, TaskGroup, Task } from '@/api/cron/types/task';

export function allTaskGroup() {
	return axios.get<{ list: TaskGroup[] }>('/cron/v1/task/groups');
}

export function addTaskGroup(data: TaskGroup) {
	return axios.post('/cron/v1/task/group', data);
}

export function updateTaskGroup(data: TaskGroup) {
	return axios.put('/cron/v1/task/group', data);
}

export function deleteTaskGroup(id: number) {
	return axios.delete('/cron/v1/task/group', { params: { id } });
}

export function pageTask(req: PageTaskReq) {
	return axios.get<PageTaskRes>('/cron/v1/tasks', { params: { ...req } });
}

export function addTask(data: Task) {
	return axios.post('/cron/v1/task', data);
}

export function execTask(id: number) {
	return axios.post('/cron/v1/task/exec', { id });
}

export function cancelTask(uuid: string) {
	return axios.post('/cron/v1/task/cancel', { uuid });
}

export function enableTask(id: number) {
	return axios.post('/cron/v1/task/enable', { id });
}

export function disableTask(id: number) {
	return axios.post('/cron/v1/task/disable', { id });
}

export function updateTask(data: Task) {
	return axios.put('/cron/v1/task', data);
}

export function deleteTask(id: number) {
	return axios.delete('/cron/v1/task', { params: { id } });
}
