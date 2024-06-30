export interface GetWorkerGroupRequest {
	id?: number;
}

export interface GetWorkerGroupReply {
	id: number;
	name: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListWorkerGroupRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	name?: string;
}

export interface WorkerGroup {
	id: number;
	name: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListWorkerGroupReply {
	total: number;
	list: WorkerGroup[];
}

export interface CreateWorkerGroupRequest {
	name: string;
	description?: string;
}

export interface CreateWorkerGroupReply {
	id: number;
}

export interface UpdateWorkerGroupRequest {
	id: number;
	name: string;
	description?: string;
}

export interface DeleteWorkerGroupRequest {
	id: number;
}

export interface DeleteWorkerGroupReply {
	total: number;
}

export interface GetWorkerRequest {
	id?: number;
	ip?: string;
}

export interface GetWorkerReply {
	id: number;
	name: string;
	ip: string;
	groupId: number;
	status?: boolean;
	description?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListWorkerRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	name?: string;
	ip?: string;
	groupId?: number;
	status?: boolean;
}

export interface Worker {
	id: number;
	name: string;
	ip: string;
	groupId: number;
	group?: WorkerGroup;
	status?: boolean;
	description?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListWorkerReply {
	total: number;
	list: Worker[];
}

export interface CreateWorkerRequest {
	name: string;
	ip: string;
	groupId: number;
	status?: boolean;
	description?: string;
}

export interface CreateWorkerReply {
	id: number;
}

export interface UpdateWorkerRequest {
	id: number;
	name: string;
	ip: string;
	groupId: number;
	description?: string;
}

export interface UpdateWorkerStatusRequest {
	id: number;
	status: boolean;
}

export interface DeleteWorkerRequest {
	id: number;
}

export interface DeleteWorkerReply {
	total: number;
}
