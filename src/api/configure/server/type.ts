export interface GetServerRequest {
	id?: number;
	keyword?: string;
}

export interface GetServerReply {
	id: number;
	keyword: string;
	name: string;
	description?: string;
	status?: boolean;
	createdAt: number;
	updatedAt: number;
}

export interface ListServerRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	keyword?: string;
	name?: string;
	status?: boolean;
}

export interface Server {
	id: number;
	keyword: string;
	name: string;
	description?: string;
	status?: boolean;
	createdAt: number;
	updatedAt: number;
}

export interface ListServerReply {
	total: number;
	list: Server[];
}

export interface CreateServerRequest {
	keyword: string;
	name: string;
	description?: string;
	status?: boolean;
}

export interface CreateServerReply {
	id: number;
}

export interface UpdateServerRequest {
	id: number;
	keyword: string;
	name: string;
	description?: string;
}

export interface DeleteServerRequest {
	ids: number[];
}

export interface DeleteServerReply {
	total: number;
}

export interface UpdateServerStatusRequest {
	id: number;
	status: boolean;
}
