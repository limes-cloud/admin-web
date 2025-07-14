export interface ListJobRequest {
	keyword?: string;
	name?: string;
	rootId?: number;
}

export interface Job {
	id: number;
	parentId: number;
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
	parentId: number;
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
	parentId: number;
	keyword: string;
	name: string;
	weight?: number;
	description?: string;
}

export interface DeleteJobRequest {
	id: number;
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
	parentId: number;
	keyword: string;
	name: string;
	weight?: number;
	description?: string;
	createdAt: number;
	updatedAt: number;
}
