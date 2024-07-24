/* eslint-disable @typescript-eslint/no-empty-interface */
export interface ListDepartmentRequest {
	name?: string;
	keyword?: string;
}

export interface Department {
	id: number;
	parentId: number;
	name: string;
	keyword: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
	children: Department[];
}

export interface ListDepartmentReply {
	total: number;
	list: Department[];
}

export interface CreateDepartmentRequest {
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
	parentId: number;
	name: string;
	description?: string;
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
