export interface ListJobRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
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

export interface ListJobRoleRequest {
	page: number;
	pageSize: number;
	name?: string;
	jobId: number;
}

export interface Role {
	id: number;
	name: string;
}

export interface ListJobRoleReply {
	total: number;
	list: Role[];
}

export interface CreateJobRolesRequest {
	jobId: number;
	roleIds: number[];
}

export interface CreateJobRolesReply {
	id: number;
}

export interface DeleteJobRolesRequest {
	jobId: number;
	roleIds: number[];
}

export interface DeleteJobRolesReply {}
