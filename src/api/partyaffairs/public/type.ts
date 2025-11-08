export interface PublicClassify {
	id: number;
	name: string;
	weight: number;
	createdAt: number;
	updatedAt: number;
}

export interface ListPublicClassifyReply {
	total: number;
	list: PublicClassify[];
}

export interface CreatePublicClassifyRequest {
	name: string;
	weight: number;
}

export interface CreatePublicClassifyReply {
	id: number;
}

export interface UpdatePublicClassifyRequest {
	id: number;
	name: string;
	weight: number;
}

export interface DeletePublicClassifyRequest {
	id: number;
}

export interface DeletePublicClassifyReply {
	total: number;
}

export interface GetPublicRequest {
	id: number;
}

export interface GetPublicReply {
	id: number;
	classifyId: number;
	title: string;
	cover: string;
	read: number;
	description: string;
	unit: string;
	content: string;
	isTop?: boolean;
	status?: boolean;
	createdAt: number;
	updatedAt: number;
}

export interface ListPublicRequest {
	page: number;
	pageSize: number;
	title?: string;
	status?: boolean;
	isTop?: boolean;
	classifyId?: number;
}

export interface Public {
	id: number;
	classifyId: number;
	title: string;
	cover: string;
	read: number;
	description: string;
	unit: string;
	isTop?: boolean;
	status?: boolean;
	createdAt: number;
	updatedAt: number;
}

export interface ListPublicReply {
	total: number;
	list: Public[];
}

export interface CreatePublicRequest {
	classifyId: number;
	title: string;
	cover: string;
	description: string;
	unit: string;
	content: string;
	isTop?: boolean;
	status?: boolean;
}

export interface CreatePublicReply {
	id: number;
}

export interface UpdatePublicRequest {
	id: number;
	classifyId?: number;
	title?: string;
	cover?: string;
	description?: string;
	unit?: string;
	content?: string;
	isTop?: boolean;
	status?: boolean;
}

export interface DeletePublicRequest {
	id: number;
}
