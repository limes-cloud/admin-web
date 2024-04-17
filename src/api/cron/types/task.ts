import { WorkerGroup } from './worker';

export interface TaskGroup {
	id: number;
	name: string;
	description: string;
	created_at: number;
	updated_at: number;
}

export interface Task {
	id: number;
	group_id: number;
	name: string;
	tag: string;
	spec: string;
	select_type: string;
	worker_group_id: number;
	worker_id: number;
	exec_type: string;
	exec_value: string;
	expect_code: number;
	retry_count: number;
	retry_wait_time: number;
	max_exec_time: number;
	status: string;
	version: string;
	description: string;
	group: TaskGroup;
	worker?: Worker;
	worker_group?: WorkerGroup;
}

export interface PageTaskReq {
	page: number;
	page_size: number;
	group_id?: number;
	name?: string;
}

export interface PageTaskRes {
	total: number;
	list: Task[];
}
