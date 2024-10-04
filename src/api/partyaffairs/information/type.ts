export interface InformationClassify {
	id: number;
	name: string;
	weight: number;
	createdAt: number;
	updatedAt: number;
}

export interface ListInformationClassifyReply {
	total: number;
	list: InformationClassify[];
}

export interface CreateInformationClassifyRequest {
	name: string;
	weight: number;
}

export interface CreateInformationClassifyReply {
	id: number;
}

export interface UpdateInformationClassifyRequest {
	id: number;
	name: string;
	weight: number;
}

export interface DeleteInformationClassifyRequest {
	id: number;
}

export interface DeleteInformationClassifyReply {
	total: number;
}

export interface GetInformationRequest {
	id: number;
}

export interface GetInformationReply {
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

export interface ListInformationRequest {
	page: number;
	pageSize: number;
	title?: string;
	status?: boolean;
	isTop?: boolean;
	classifyId?: number;
}

export interface Information {
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

export interface ListInformationReply {
	total: number;
	list: Information[];
}

export interface CreateInformationRequest {
	classifyId: number;
	title: string;
	cover: string;
	description: string;
	unit: string;
	content: string;
	isTop?: boolean;
	status?: boolean;
}

export interface CreateInformationReply {
	id: number;
}

export interface UpdateInformationRequest {
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

export interface DeleteInformationRequest {
	id: number;
}
