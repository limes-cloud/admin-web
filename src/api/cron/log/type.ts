export interface GetLogRequest {
	id?: number;
}

export interface GetLogReply {
	id: number;
	uuid: string;
	workerId: number;
	workerSnapshot: string;
	taskId: number;
	taskSnapshot: string;
	startAt: number;
	endAt: number;
	content: string;
	status: string;
}

export interface ListLogRequest {
	page: number;
	pageSize: number;
	taskId: number;
	order?: string;
	orderBy?: string;
	uuid?: string;
}

export interface Log {
	id: number;
	uuid: string;
	workerId: number;
	workerSnapshot: string;
	taskId: number;
	taskSnapshot: string;
	startAt: number;
	endAt: number;
	content: string;
	status: string;
}

export interface ListLogReply {
	total: number;
	list: Log[];
}

export interface CreateLogRequest {
	uuid: string;
	workerId: number;
	workerSnapshot: string;
	taskId: number;
	taskSnapshot: string;
	startAt: number;
	endAt: number;
	content: string;
	status: string;
}

export interface CreateLogReply {
	id: number;
}

export interface UpdateLogRequest {
	id: number;
	uuid: string;
	workerId: number;
	workerSnapshot: string;
	taskId: number;
	taskSnapshot: string;
	startAt: number;
	endAt: number;
	content: string;
	status: string;
}

export interface DeleteLogRequest {
	ids: number[];
}

export interface DeleteLogReply {
	total: number;
}

export interface LogMsg {
	type: string;
	content: string;
	time: number;
}
