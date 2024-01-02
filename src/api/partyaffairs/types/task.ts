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
