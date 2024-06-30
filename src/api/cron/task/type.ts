export interface GetTaskGroupRequest {
	id?: number;
}

export interface GetTaskGroupReply {
	id: number;
	name: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListTaskGroupRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	name?: string;
}

export interface TaskGroup {
	id: number;
	name: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListTaskGroupReply {
	total: number;
	list: TaskGroup[];
}

export interface CreateTaskGroupRequest {
	name: string;
	description?: string;
}

export interface CreateTaskGroupReply {
	id: number;
}

export interface UpdateTaskGroupRequest {
	id: number;
	name: string;
	description?: string;
}

export interface DeleteTaskGroupRequest {
	id: number;
}

export interface DeleteTaskGroupReply {
	total: number;
}

export interface GetTaskRequest {
	id?: number;
}

export interface Name {
	name: string;
}

export interface GetTaskReply {
	id: number;
	groupId: number;
	name: string;
	tag: string;
	spec: string;
	status?: boolean;
	workerType: string;
	workerGroupId: number;
	workerId: number;
	execType: string;
	execValue: string;
	expectCode: number;
	retryCount: number;
	retryWaitTime: number;
	maxExecTime: number;
	version: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
	group?: Name;
	worker?: Name;
	workerGroup?: Name;
}

export interface ListTaskRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	groupId?: number;
	name?: string;
	tag?: string;
	status?: boolean;
}

export interface Task {
	id: number;
	groupId: number;
	name: string;
	tag: string;
	spec: string;
	status?: boolean;
	workerType: string;
	workerGroupId: number;
	workerId: number;
	execType: string;
	execValue: string;
	expectCode: number;
	retryCount: number;
	retryWaitTime: number;
	maxExecTime: number;
	version: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListTaskReply {
	total: number;
	list: Task[];
}

export interface CreateTaskRequest {
	groupId: number;
	name: string;
	tag: string;
	spec: string;
	status?: boolean;
	workerType: string;
	workerGroupId: number;
	workerId: number;
	execType: string;
	execValue: string;
	expectCode: number;
	retryCount: number;
	retryWaitTime: number;
	maxExecTime: number;
	description?: string;
}

export interface CreateTaskReply {
	id: number;
}

export interface UpdateTaskRequest {
	id: number;
	groupId: number;
	name: string;
	tag: string;
	spec: string;
	workerType: string;
	workerGroupId: number;
	workerId: number;
	execType: string;
	execValue: string;
	expectCode: number;
	retryCount: number;
	retryWaitTime: number;
	maxExecTime: number;
	description?: string;
}

export interface UpdateTaskStatusRequest {
	id: number;
	status: boolean;
}

export interface DeleteTaskRequest {
	id: number;
}

export interface DeleteTaskReply {
	total: number;
}

export interface ExecTaskRequest {
	id: number;
}

export interface CancelTaskRequest {
	uuid: string;
}
