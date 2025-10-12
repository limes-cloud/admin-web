export interface ListDeptClassifyRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	name?: string;
}

export interface DeptClassify {
	id: number;
	name: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListDeptClassifyReply {
	total: number;
	list: DeptClassify[];
}

export interface CreateDeptClassifyRequest {
	name: string;
	description?: string;
}

export interface CreateDeptClassifyReply {
	id: number;
}

export interface UpdateDeptClassifyRequest {
	id: number;
	name: string;
	description?: string;
}

export interface DeleteDeptClassifyRequest {
	id: number;
}

export interface DeleteDeptClassifyReply {
	total: number;
}

export interface ListDeptRequest {
	name?: string;
	keyword?: string;
	rootId?: number;
	classifyId?: number;
}

export interface Role {
	id: number;
	name: string;
}

export interface Dept {
	id: number;
	parentId: number;
	classifyId: number;
	name: string;
	keyword: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
	classify: DeptClassify;
	roles: Role[];
	roleIds: number[];
	children: Dept[];
}

export interface ListDeptReply {
	total: number;
	list: Dept[];
}

export interface CreateDeptRequest {
	roleIds: number[];
	classifyId: number;
	parentId: number;
	name: string;
	keyword: string;
	description?: string;
}

export interface CreateDeptReply {
	id: number;
}

export interface UpdateDeptRequest {
	id: number;
	classifyId: number;
	parentId: number;
	name: string;
	description?: string;
	roleIds: number[];
}

export interface DeleteDeptRequest {
	id: number;
}

export interface DeleteDeptReply {
	total: number;
}

export interface GetDeptRequest {
	id?: number;
	keyword?: string;
}

export interface GetDeptReply {
	id: number;
	parentId: number;
	name: string;
	keyword: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListDeptRoleRequest {
	page: number;
	pageSize: number;
	name?: string;
	deptId: number;
}

export interface ListDeptRoleReply {
	total: number;
	list: Role[];
}

export interface CreateDeptRolesRequest {
	deptId: number;
	roleIds: number[];
}

export interface CreateDeptRolesReply {
	id: number;
}

export interface DeleteDeptRolesRequest {
	deptId: number;
	roleIds: number[];
}

export interface DeleteDeptRolesReply {}
