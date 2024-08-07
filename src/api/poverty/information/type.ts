export interface GetInformationRequest {
	id: number;
}

export interface GetInformationReply {
	id: number;
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
	order?: string;
	orderBy?: string;
	title?: string;
	status?: boolean;
	isTop?: boolean;
}

export interface Information {
	id: number;
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
