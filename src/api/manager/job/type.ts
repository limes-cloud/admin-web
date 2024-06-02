export interface ListJobRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	keyword?: string;
	name?: string;
}

export interface Job {
	id: number;
	keyword: string;
	name: string;
	weight?: number;
	description?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListJobReply {
	total: number;
	list: Job[];
}

export interface CreateJobRequest {
	keyword: string;
	name: string;
	weight?: number;
	description?: string;
}

export interface CreateJobReply {
	id: number;
}

export interface UpdateJobRequest {
	id: number;
	keyword: string;
	name: string;
	weight?: number;
	description?: string;
}

export interface DeleteJobRequest {
	ids: number[];
}

export interface DeleteJobReply {
	total: number;
}

export interface GetJobRequest {
	id?: number;
	keyword?: string;
}

export interface GetJobReply {
	id: number;
	keyword: string;
	name: string;
	weight?: number;
	description?: string;
	createdAt: number;
	updatedAt: number;
}
