export interface GetAppRequest {
	id?: number;
	keyword?: string;
}

export interface Channel {
	id: number;
	name: string;
	keyword: string;
}

export interface Field {
	id: number;
	keyword: string;
	name: string;
	type: string;
}

export interface GetAppReply {
	id: number;
	logo: string;
	logoUrl: string;
	keyword: string;
	name: string;
	status?: boolean;
	disableDesc?: string;
	allowRegistry?: boolean;
	version: string;
	copyright: string;
	extra?: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
	channels: Channel[];
	fields: Field[];
}

export interface ListAppRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	keyword?: string;
	name?: string;
	status?: boolean;
}

export interface App {
	id: number;
	logo: string;
	logoUrl: string;
	keyword: string;
	name: string;
	status?: boolean;
	disableDesc?: string;
	allowRegistry?: boolean;
	version: string;
	copyright: string;
	extra?: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListAppReply {
	total: number;
	list: App[];
}

export interface CreateAppRequest {
	logo: string;
	keyword: string;
	name: string;
	status?: boolean;
	allowRegistry?: boolean;
	version: string;
	copyright: string;
	extra?: string;
	description?: string;
	channelIds: number[];
	fieldIds: number[];
}

export interface CreateAppReply {
	id: number;
}

export interface UpdateAppRequest {
	id: number;
	logo: string;
	keyword: string;
	name: string;
	allowRegistry?: boolean;
	version: string;
	copyright: string;
	extra?: string;
	description?: string;
	channelIds: number[];
	fieldIds: number[];
}

export interface UpdateAppStatusRequest {
	id: number;
	status: boolean;
	disableDesc?: string;
}

export interface DeleteAppRequest {
	ids: number[];
}

export interface DeleteAppReply {
	total: number;
}
