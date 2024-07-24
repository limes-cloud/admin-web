export interface ListDictionaryRequest {
	page: number;
	pageSize: number;
	keyword?: string;
	name?: string;
}

export interface Dictionary {
	id: number;
	keyword: string;
	name: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListDictionaryReply {
	total: number;
	list: Dictionary[];
}

export interface CreateDictionaryRequest {
	keyword: string;
	name: string;
	description?: string;
}

export interface CreateDictionaryReply {
	id: number;
}

export interface UpdateDictionaryRequest {
	id: number;
	keyword: string;
	name: string;
	description?: string;
}

export interface DeleteDictionaryRequest {
	id: number;
}

export interface DeleteDictionaryReply {
	total: number;
}

export interface GetDictionaryRequest {
	id?: number;
	keyword?: string;
}

export interface GetDictionaryReply {
	id: number;
	keyword: string;
	name: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListDictionaryValueRequest {
	page: number;
	pageSize: number;
	dictionaryId?: number;
	label?: string;
	value?: string;
	status?: boolean;
}

export interface DictionaryValue {
	id: number;
	dictionaryId: number;
	label: string;
	value: string;
	status?: boolean;
	weight?: number;
	type?: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListDictionaryValueReply {
	total: number;
	list: DictionaryValue[];
}

export interface CreateDictionaryValueRequest {
	dictionaryId: number;
	label: string;
	value: string;
	status?: boolean;
	weight?: number;
	type?: string;
	extra?: string;
	description?: string;
}

export interface CreateDictionaryValueReply {
	id: number;
}

export interface UpdateDictionaryValueRequest {
	id: number;
	dictionaryId: number;
	label: string;
	value: string;
	weight?: number;
	type?: string;
	extra?: string;
	description?: string;
}

export interface UpdateDictionaryValueStatusRequest {
	id: number;
	status: boolean;
}

export interface DeleteDictionaryValueRequest {
	id: number;
}

export interface DeleteDictionaryValueReply {
	total: number;
}
