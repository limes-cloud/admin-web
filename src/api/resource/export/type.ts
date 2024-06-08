export interface GetExportRequest {
	id?: number;
	sha?: string;
}

export interface GetExportReply {
	id: number;
	userId: number;
	departmentId: number;
	scene: string;
	name: string;
	size: number;
	sha?: string;
	src?: string;
	status: string;
	reason?: string;
	expiredAt: number;
	createdAt: number;
	updatedAt: number;
}

export interface ListExportRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	userId?: number;
	departmentId?: number;
}

export interface Export {
	id: number;
	userId: number;
	departmentId: number;
	scene: string;
	name: string;
	size: number;
	sha?: string;
	src?: string;
	status: string;
	reason?: string;
	expiredAt: number;
	createdAt: number;
	updatedAt: number;
}

export interface ListExportReply {
	total: number;
	list: Export[];
}

export interface CreateExportRequest {
	userId: number;
	departmentId: number;
	scene: string;
	name: string;
	reason?: string;
}

export interface CreateExportReply {
	id: number;
}

export interface UpdateExportRequest {
	id: number;
	userId: number;
	departmentId: number;
	scene: string;
}

export interface DeleteExportRequest {
	ids: number[];
}

export interface DeleteExportReply {
	total: number;
}
