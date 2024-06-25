export interface GetBusinessRequest {
	id?: number;
}

export interface GetBusinessReply {
	id: number;
	serverId: number;
	keyword: string;
	type: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListBusinessRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	serverId: number;
	keyword?: string;
}

export interface Business {
	id: number;
	serverId: number;
	keyword: string;
	type: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListBusinessReply {
	total: number;
	list: Business[];
}

export interface CreateBusinessRequest {
	serverId: number;
	keyword: string;
	type: string;
	description?: string;
}

export interface CreateBusinessReply {
	id: number;
}

export interface UpdateBusinessRequest {
	id: number;
	keyword: string;
	type: string;
	description?: string;
}

export interface DeleteBusinessRequest {
	ids: number[];
}

export interface DeleteBusinessReply {
	total: number;
}

export interface ListBusinessValueRequest {
	businessId: number;
}

export interface BusinessValue {
	id: number;
	envId: number;
	businessId: number;
	value: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListBusinessValueReply {
	total: number;
	list: BusinessValue[];
}

export interface Value {
	envId: number;
	value: string;
}

export interface UpdateBusinessValueRequest {
	list: Value[];
	businessId: number;
}
