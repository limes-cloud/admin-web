export interface ListNotifyCategoryRequest {
	page: number;
	pageSize: number;
	name?: string;
}

export interface NotifyCategory {
	id: number;
	name: string;
	description: string;
	createdAt: number;
}

export interface ListNotifyCategoryReply {
	total: number;
	list: NotifyCategory[];
}

export interface CreateNotifyCategoryRequest {
	name: string;
	description: string;
}

export interface CreateNotifyCategoryReply {
	id: number;
}

export interface UpdateNotifyCategoryRequest {
	id: number;
	name: string;
	description: string;
}

export interface DeleteNotifyCategoryRequest {
	id: number;
}

export interface GetNotifyRequest {
	id: number;
}

export interface ListNotifyRequest {
	page: number;
	pageSize: number;
	categoryId?: number;
	name?: string;
	keyword?: string;
	priority?: number;
}

export interface Notify {
	id: number;
	categoryId: number;
	keyword: string;
	name: string;
	title: string;
	variable: string[];
	sendMode: number;
	isTimely: boolean;
	expire: number;
	cache: number;
	status: boolean;
	description: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListNotifyReply {
	total: number;
	list: Notify[];
}

export interface CreateNotifyRequest {
	categoryId: number;
	keyword: string;
	name: string;
	title: string;
	variable: string[];
	sendMode: number;
	priority: number;
	isTimely: boolean;
	expire?: number;
	cache: number;
	status: boolean;
	description: string;
}

export interface CreateNotifyReply {
	id: number;
}

export interface UpdateNotifyRequest {
	id: number;
	categoryId?: number;
	keyword?: string;
	name?: string;
	title?: string;
	variable?: string[];
	sendMode?: number;
	priority?: number;
	isTimely?: boolean;
	expire?: number;
	cache?: number;
	status?: boolean;
	description?: string;
}

export interface DeleteNotifyRequest {
	id: number;
}

export interface SendNotifyUser {
	email: string;
	officialOpenid: string;
}

export interface SendNotifyRequest {
	notify: string;
	variable: Map<string, string>;
	user: SendNotifyUser;
	timestamp: number;
	fromServer: string;
}
