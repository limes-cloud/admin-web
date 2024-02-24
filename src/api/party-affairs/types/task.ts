import { User } from '@/api/user-center/types/user';

export interface Task {
	id: number;
	title: string;
	desc: string;
	is_update: boolean;
	start: number;
	end: number;
	config: string;
}

export interface PageTaskReq {
	page: number;
	page_size: number;
	title?: string;
}

export interface PageTaskRes {
	total: number;
	list: Task[];
}

export interface AddTaskReq {
	title: string;
	desc: string;
	is_update: boolean;
	start: number;
	end: number;
	config: string;
}

export interface UpdateTaskReq {
	id: number;
	title: string;
	desc: string;

	is_update: boolean;
	start: number;
	end: number;
	config: string;
}

export interface TaskValue {
	id: number;
	task_id: number;
	user_id: number;
	value: string;
	user: User;
}

export interface PageTaskValueReq {
	page: number;
	page_size: number;
	task_id: number;
}

export interface GetTaskValueReq {
	task_id: number;
	user_id: number;
}

export interface PageTaskValueRes {
	total: number;
	list: TaskValue[];
}
