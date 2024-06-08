export interface GetDirectoryRequest {
	id?: number;
}

export interface GetDirectoryReply {
	id: number;
	parentId: number;
	name: string;
	scope: string;
	accept: string;
	maxSize: number;
	createdAt: number;
	updatedAt: number;
}

export interface ListDirectoryRequest {
	order?: string;
	orderBy?: string;
}

export interface Directory {
	id: number;
	parentId: number;
	name: string;
	scope: string;
	accept: string;
	maxSize: number;
	createdAt: number;
	updatedAt: number;
	children: Directory[];
}

export interface ListDirectoryReply {
	total: number;
	list: Directory[];
}

export interface CreateDirectoryRequest {
	parentId: number;
	name: string;
	scope: string;
	accept: string;
	maxSize: number;
}

export interface CreateDirectoryReply {
	id: number;
}

export interface UpdateDirectoryRequest {
	id: number;
	parentId: number;
	name: string;
	scope: string;
	accept: string;
	maxSize: number;
}

export interface DeleteDirectoryRequest {
	ids: number[];
}

export interface DeleteDirectoryReply {
	total: number;
}
