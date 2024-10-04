export interface GetNoticeRequest {
	id: number;
}

export interface GetNoticeReply {
	id: number;
	title: string;
	description: string;
	unit: string;
	content: string;
	isTop?: boolean;
	status?: boolean;
	createdAt: number;
	updatedAt: number;
}

export interface ListNoticeRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	title?: string;
	status?: boolean;
	isTop?: boolean;
}

export interface Notice {
	id: number;
	title: string;
	description: string;
	unit: string;
	isTop?: boolean;
	status?: boolean;
	createdAt: number;
	updatedAt: number;
}

export interface ListNoticeReply {
	total: number;
	list: Notice[];
}

export interface CreateNoticeRequest {
	title: string;
	description: string;
	unit: string;
	content: string;
	isTop?: boolean;
	status?: boolean;
}

export interface CreateNoticeReply {
	id: number;
}

export interface PushNoticeRequest {
	id: number;
}

export interface UpdateNoticeRequest {
	id: number;
	title?: string;
	description?: string;
	unit?: string;
	content?: string;
	isTop?: boolean;
	status?: boolean;
}

export interface DeleteNoticeRequest {
	id: number;
}
