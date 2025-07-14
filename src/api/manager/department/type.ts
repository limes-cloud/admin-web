export interface ListDepartmentClassifyRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	name?: string;
}

export interface DepartmentClassify {
	id: number;
	name: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListDepartmentClassifyReply {
	total: number;
	list: DepartmentClassify[];
}

export interface CreateDepartmentClassifyRequest {
	name: string;
	description?: string;
}

export interface CreateDepartmentClassifyReply {
	id: number;
}

export interface UpdateDepartmentClassifyRequest {
	id: number;
	name: string;
	description?: string;
}

export interface DeleteDepartmentClassifyRequest {
	id: number;
}

export interface DeleteDepartmentClassifyReply {
	total: number;
}

export interface ListDepartmentRequest {
	name?: string;
	keyword?: string;
	rootId?: number;
	classifyId?: number;
}

export interface Role {
	id: number;
	name: string;
	keyword: string;
}

export interface Department {
	id: number;
	parentId: number;
	classifyId: number;
	name: string;
	keyword: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
	classify: DepartmentClassify;
	roles: Role[];
	roleIds: number[];
	children: Department[];
}

export interface ListDepartmentReply {
	total: number;
	list: Department[];
}

export interface CreateDepartmentRequest {
	roleIds: number[];
	classifyId: number;
	parentId: number;
	name: string;
	keyword: string;
	description?: string;
}

export interface CreateDepartmentReply {
	id: number;
}

export interface UpdateDepartmentRequest {
	id: number;
	classifyId: number;
	parentId: number;
	name: string;
	description?: string;
	roleIds: number[];
}

export interface DeleteDepartmentRequest {
	id: number;
}

export interface DeleteDepartmentReply {
	total: number;
}

export interface GetDepartmentRequest {
	id?: number;
	keyword?: string;
}

export interface GetDepartmentReply {
	id: number;
	parentId: number;
	name: string;
	keyword: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
}
