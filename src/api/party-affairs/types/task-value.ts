import { User } from './user';

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

export interface PageTaskValueRes {
	total: number;
	list: TaskValue[];
}
