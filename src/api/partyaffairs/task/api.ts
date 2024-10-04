import axios from 'axios';
import {
	CreateTaskRequest,
	GetTaskValueRequest,
	ListTaskRequest,
	ListTaskResponse,
	ListTaskValueRequest,
	ListTaskValueResponse,
	Task,
	TaskValue,
	UpdateTaskRequest
} from './type';

export function ListTask(data: ListTaskRequest) {
	return axios.get<ListTaskResponse>('/partyaffairs/api/v1/tasks', {
		params: { ...data }
	});
}

export function GetTask(id: number) {
	return axios.get<Task>('/partyaffairs/api/v1/task', {
		params: { id }
	});
}

export function CreateTask(data: CreateTaskRequest) {
	return axios.post('/partyaffairs/api/v1/task', data);
}

export function UpdateTask(data: UpdateTaskRequest) {
	return axios.put('/partyaffairs/api/v1/task', data);
}

export function DeleteTask(id: number) {
	return axios.delete('/partyaffairs/api/v1/task', {
		params: { id }
	});
}

export function GetTaskValue(data: GetTaskValueRequest) {
	return axios.get<TaskValue>('/partyaffairs/api/v1/task/value', {
		params: { ...data }
	});
}

export function ListTaskValue(data: ListTaskValueRequest) {
	return axios.get<ListTaskValueResponse>('/partyaffairs/api/v1/task/values', {
		params: { ...data }
	});
}

export function ExportTaskValue(id: number) {
	return axios.post('/partyaffairs/api/v1/task/values', { task_id: id });
}

export function DeleteTaskValue(id: number) {
	return axios.delete('/partyaffairs/api/v1/task/value', {
		params: { id }
	});
}

export default null;
