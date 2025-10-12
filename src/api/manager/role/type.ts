import { Entity } from '../entity/type';

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface GetRoleMenuIdsRequest {
	roleId: number;
	appId: number;
}

export interface GetRoleMenuIdsReply {
	menuIds: number[];
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
	deptIds?: string;
	jobScope: string;
	jobIds?: string;
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
	description?: string;
}

export interface CreateRoleReply {
	id: number;
}

export interface UpdateRoleRequest {
	id: number;
	parentId?: number;
	name?: string;
	status?: boolean;
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
	deptIds?: string;
	jobScope: string;
	jobIds?: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
}

export interface UpdateRoleMenuRequest {
	roleId: number;
	appId: number;
	menuIds: number[];
}

export interface ListRoleEntityRequest {
	page: number;
	pageSize: number;
	roleId: number;
	appId?: number;
	entityId?: number;
}

export interface RoleEntity {
	id: number;
	roleId: number;
	entityId: number;
	action: string;
	scope: string;
	fields: string;
	rules: string;
	createdAt: number;
	updatedAt: number;
	entity: Entity;
}

export interface ListRoleEntityReply {
	total: number;
	list: RoleEntity[];
}

export interface CreateRoleEntityRequest {
	roleId: number;
	entityId?: number;
	appId: number;
	action: string;
	scope: string;
	fields: string;
	rules: string;
}

export interface CreateRoleEntityReply {
	id: number;
}

export interface UpdateRoleEntityRequest {
	id: number;
	roleId: number;
	appId: number;
	entityId?: number;
	action: string;
	scope: string;
	fields: string;
	rules: string;
}

export interface DeleteRoleEntityRequest {
	id: number;
}

export interface DeleteRoleEntityReply {
	total: number;
}
