import { User } from '@/types/global';

export interface Task {
	id: number;
	title: string;
	description: string;
	isUpdate: boolean;
	start: number;
	end: number;
	config: string;
}

export interface ListTaskRequest {
	page: number;
	pageSize: number;
	title?: string;
}

export interface ListTaskResponse {
	total: number;
	list: Task[];
}

export interface CreateTaskRequest {
	title: string;
	description: string;
	isUpdate: boolean;
	start: number;
	end: number;
	config: string;
}

export interface UpdateTaskRequest {
	id: number;
	title?: string;
	description?: string;
	isUpdate?: boolean;
	start?: number;
	end?: number;
	config?: string;
}

export interface TaskValue {
	id: number;
	taskId: number;
	userId: number;
	value: string;
	user: User;
}

export interface ListTaskValueRequest {
	page: number;
	pageSize: number;
	taskId: number;
	notFinish?: boolean;
}

export interface GetTaskValueRequest {
	taskId: number;
	userId: number;
}

export interface ListTaskValueResponse {
	total: number;
	list: TaskValue[];
}
