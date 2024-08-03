/* eslint-disable @typescript-eslint/no-empty-interface */
export interface GetRoleMenuIdsRequest {
	roleId: number;
}

export interface GetRoleMenuIdsReply {
	list: number[];
}

export interface ListRoleRequest {
	name?: string;
	keyword?: string;
}

export interface Role {
	id: number;
	parentId: number;
	name: string;
	keyword: string;
	status?: boolean;
	dataScope: string;
	departmentIds?: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
	children: Role[];
}

export interface ListRoleReply {
	total: number;
	list: Role[];
}

export interface CreateRoleRequest {
	parentId: number;
	name: string;
	keyword: string;
	status?: boolean;
	dataScope: string;
	departmentIds?: string;
	description?: string;
}

export interface CreateRoleReply {
	id: number;
}

export interface UpdateRoleRequest {
	id: number;
	parentId: number;
	name: string;
	dataScope: string;
	departmentIds?: string;
	description?: string;
}

export interface UpdateRoleStatusRequest {
	id: number;
	status: boolean;
}

export interface DeleteRoleRequest {
	id: number;
}

export interface DeleteRoleReply {
	total: number;
}

export interface GetRoleRequest {
	id?: number;
	keyword?: string;
}

export interface GetRoleReply {
	id: number;
	parentId: number;
	name: string;
	keyword: string;
	status?: boolean;
	dataScope: string;
	departmentIds?: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
}

export interface UpdateRoleMenuRequest {
	roleId: number;
	menuIds: number[];
}
