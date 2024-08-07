export interface ListResourceRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	title?: string;
	status?: boolean;
}

export interface Resource {
	id: number;
	title: string;
	src: string;
	name: string;
	size: number;
	url: string;
	status?: boolean;
	createdAt: number;
	updatedAt: number;
}

export interface ListResourceReply {
	total: number;
	list: Resource[];
}

export interface CreateResourceRequest {
	title: string;
	src: string;
}

export interface CreateResourceReply {
	id: number;
}

export interface UpdateResourceRequest {
	id: number;
	title?: string;
	src?: string;
	status?: boolean;
}

export interface DeleteResourceRequest {
	id: number;
}
