export interface GetResourceRequest {
	id?: number;
	keyword?: string;
}

export interface Server {
	id: number;
	name: string;
}

export interface GetResourceReply {
	id: number;
	keyword: string;
	fields: string;
	tag: string;
	private?: boolean;
	description?: string;
	createdAt: number;
	updatedAt: number;
	servers: Server[];
}

export interface ListResourceRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	keyword?: string;
	tag?: string;
	private?: boolean;
	serverId?: number;
}

export interface Resource {
	id: number;
	keyword: string;
	fields: string;
	tag: string;
	private?: boolean;
	description?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListResourceReply {
	total: number;
	list: Resource[];
}

export interface CreateResourceRequest {
	keyword: string;
	fields: string;
	tag: string;
	private?: boolean;
	serverIds?: number[];
	description?: string;
}

export interface CreateResourceReply {
	id: number;
}

export interface UpdateResourceRequest {
	id: number;
	keyword: string;
	fields: string;
	tag: string;
	private?: boolean;
	serverIds?: number[];
	description?: string;
}

export interface DeleteResourceRequest {
	id: number;
}

export interface DeleteResourceReply {
	total: number;
}

export interface ListResourceValueRequest {
	resourceId: number;
}

export interface ResourceValue {
	id: number;
	envId: number;
	resourceId: number;
	value: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListResourceValueReply {
	total: number;
	list: ResourceValue[];
}

export interface Value {
	envId: number;
	value: string;
}

export interface UpdateResourceValueRequest {
	list: Value[];
	resourceId: number;
}
