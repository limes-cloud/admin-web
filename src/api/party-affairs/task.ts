import axios from 'axios';
import {
	UpdateTaskReq,
	PageTaskRes,
	AddTaskReq,
	PageTaskReq,
	Task,
	PageTaskValueReq,
	PageTaskValueRes,
	GetTaskValueReq,
	TaskValue
} from './types/task';

export function pageTask(data: PageTaskReq) {
	return axios.get<PageTaskRes>('/party-affairs/v1/tasks', {
		params: { ...data }
	});
}

export function getTask(id: number) {
	return axios.get<Task>('/party-affairs/v1/task', {
		params: { id }
	});
}

export function addTask(data: AddTaskReq) {
	return axios.post('/party-affairs/v1/task', data);
}

export function updateTask(data: UpdateTaskReq) {
	return axios.put('/party-affairs/v1/task', data);
}

export function deleteTask(id: number) {
	return axios.delete('/party-affairs/v1/task', {
		params: { id }
	});
}

export function getTaskValue(data: GetTaskValueReq) {
	return axios.get<TaskValue>('/party-affairs/v1/task/value', {
		params: { ...data }
	});
}

export function pageTaskValue(data: PageTaskValueReq) {
	return axios.get<PageTaskValueRes>('/party-affairs/v1/task/values', {
		params: { ...data }
	});
}

export function exportTaskValue(id: number) {
	return axios.post('/party-affairs/v1/task/values', { task_id: id });
}

export function deleteTaskValue(id: number) {
	return axios.delete('/party-affairs/v1/task/value', {
		params: { id }
	});
}

export default null;
