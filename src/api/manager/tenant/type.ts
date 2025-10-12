import { App } from '../app/type';

export interface ListTenantRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	keyword?: string;
	name?: string;
	status?: boolean;
}

export interface Tenant {
	id: number;
	logo: string;
	keyword: string;
	name: string;
	status?: boolean;
	description?: string;
	weight: number;
	createdAt: number;
	updatedAt: number;
}

export interface ListTenantReply {
	total: number;
	list: Tenant[];
}

export interface CreateTenantRequest {
	logo: string;
	keyword: string;
	name: string;
	status?: boolean;
	description?: string;
	weight: number;
}

export interface CreateTenantReply {
	id: number;
}

export interface UpdateTenantRequest {
	id: number;
	logo?: string;
	keyword?: string;
	name?: string;
	status?: boolean;
	description?: string;
	weight?: number;
}

export interface DeleteTenantRequest {
	id: number;
}

export interface ListTenantAppRequest {
	page: number;
	pageSize: number;
	tenantId: number;
	order?: string;
	orderBy?: string;
	keyword?: string;
	name?: string;
}

export interface TenantApp {
	id: number;
	tenantId: number;
	appId: number;
	app: App;
	expiredAt: number;
	createdAt: number;
	updatedAt: number;
}

export interface ListTenantAppReply {
	total: number;
	list: TenantApp[];
}

export interface CreateTenantAppRequest {
	tenantId: number;
	appId: number;
	expiredAt: number;
	menuIds: number[];
}

export interface CreateTenantAppReply {
	id: number;
}

export interface UpdateTenantAppRequest {
	tenantId: number;
	appId: number;
	expiredAt: number;
	menuIds: number[];
}

export interface DeleteTenantAppRequest {
	id: number;
}

export interface GetTenantAppMenuIdsRequest {
	tenantId: number;
	appId: number;
}

export interface GetTenantAppMenuIdsReply {
	menuIds: number[];
}
