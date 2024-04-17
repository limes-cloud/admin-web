export interface WorkerGroup {
	id: number;
	name: string;
	description: string;
	created_at: number;
	updated_at: number;
}

export interface Worker {
	id: number;
	group_id?: number;
	name: string;
	ip: string;
	status: boolean;
	description: string;
	created_at: number;
	updated_at: number;
	group?: WorkerGroup;
}

export interface PageWorkerReq {
	page: number;
	page_size: number;
	group_id?: number;
	name?: string;
	status?: boolean;
}

export interface PageWorkerRes {
	total: number;
	list: Worker[];
}
