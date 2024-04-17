export interface Log {
	id: number;
	uuid: string;
	worker_id: number;
	worker_snapshot: string;
	task_id: number;
	task_snapshot: string;
	start: number;
	end: number;
	content: string;
	status: string;
}

export interface LogMsg {
	type: string;
	content: string;
	time: number;
}

export interface PageLogReq {
	page: number;
	page_size: number;
	task_id: number;
}

export interface PageLogRes {
	total: number;
	list: Log[];
}
