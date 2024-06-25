export interface FieldType {
	type: string;
	name: string;
}

export interface ListFieldRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	keyword?: string;
	name?: string;
	status?: boolean;
}

export interface Field {
	id: number;
	keyword: string;
	type: string;
	name: string;
	status?: boolean;
	description?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListFieldReply {
	total: number;
	list: Field[];
}

export interface CreateFieldRequest {
	keyword: string;
	type: string;
	name: string;
	status?: boolean;
	description?: string;
}

export interface CreateFieldReply {
	id: number;
}

export interface UpdateFieldRequest {
	id: number;
	keyword: string;
	type: string;
	name: string;
	description?: string;
}

export interface UpdateFieldStatusRequest {
	id: number;
	status: boolean;
}

export interface DeleteFieldRequest {
	ids: number[];
}

export interface DeleteFieldReply {
	total: number;
}
