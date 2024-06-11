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

export interface ExportFileRequest {
	userId: number;
	departmentId: number;
	scene: string;
	name: string;
	ids: number[];
}

export interface ExportFileReply {
	id: number;
	sha: string;
	src: string;
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
