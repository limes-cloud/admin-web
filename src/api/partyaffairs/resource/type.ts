export interface ResourceClassify {
	id: number;
	name: string;
	weight: number;
	createdAt: number;
	updatedAt: number;
}

export interface ListResourceClassifyReply {
	total: number;
	list: ResourceClassify[];
}

export interface CreateResourceClassifyRequest {
	name: string;
	weight: number;
}

export interface CreateResourceClassifyReply {
	id: number;
}

export interface UpdateResourceClassifyRequest {
	id: number;
	name: string;
	weight: number;
}

export interface DeleteResourceClassifyRequest {
	id: number;
}

export interface DeleteResourceClassifyReply {
	total: number;
}

export interface GetResourceRequest {
	id: number;
}

export interface GetResourceReply {
	id: number;
	classifyId: number;
	title: string;
	description: string;
	url: string;
	downloadCount: number;
	createdAt: number;
	updatedAt: number;
}

export interface ListResourceRequest {
	page: number;
	pageSize: number;
	title?: string;
	classifyId?: number;
}

export interface Resource {
	id: number;
	classifyId: number;
	title: string;
	description: string;
	url: string;
	downloadCount: number;
	createdAt: number;
	updatedAt: number;
}

export interface ListResourceReply {
	total: number;
	list: Resource[];
}

export interface CreateResourceRequest {
	classifyId: number;
	title: string;
	description: string;
	url: string;
}

export interface CreateResourceReply {
	id: number;
}

export interface UpdateResourceRequest {
	id: number;
	classifyId?: number;
	title?: string;
	description?: string;
	url?: string;
}

export interface DeleteResourceRequest {
	id: number;
}
