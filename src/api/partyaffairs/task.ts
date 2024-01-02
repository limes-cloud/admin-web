import axios from 'axios';
import { UpdateTaskReq, PageTaskRes, AddTaskReq, PageTaskReq, Task } from './types/task';

export function pageTask(data: PageTaskReq) {
	return axios.get<PageTaskRes>('/party_affairs/admin/v1/tasks', {
		params: { ...data }
	});
}

export function getTask(id: number) {
	return axios.get<Task>('/party_affairs/admin/v1/task', {
		params: { id }
	});
}

export function addTask(data: AddTaskReq) {
	return axios.post('/party_affairs/admin/v1/task', data);
}

export function updateTask(data: UpdateTaskReq) {
	return axios.put('/party_affairs/admin/v1/task', data);
}

export function deleteTask(id: number) {
	return axios.delete('/party_affairs/admin/v1/task', {
		params: { id }
	});
}

export default null;
