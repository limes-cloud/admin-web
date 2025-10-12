export interface GetAppRequest {
	id?: number;
	keyword?: string;
}

export interface Channel {
	id: number;
	name: string;
	keyword: string;
	logo: string;
	type: string;
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
	keyword: string;
	name: string;
	status?: boolean;
	disableDesc?: string;
	private?: boolean;
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
	keyword: string;
	name: string;
	status?: boolean;
	disableDesc?: string;
	private?: boolean;
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
	private?: boolean;
	extra?: string;
	description?: string;
}

export interface CreateAppReply {
	id: number;
}

export interface UpdateAppRequest {
	id: number;
	logo?: string;
	keyword?: string;
	name?: string;
	status?: boolean;
	disableDesc?: string;
	private?: boolean;
	extra?: string;
	description?: string;
}

export interface DeleteAppRequest {
	id: number;
}

export interface AppOAuthChannel {
	id: number;
	appId: number;
	channelId: number;
	channel: Channel;
}

export interface ListAppOAuthChannelRequest {
	page: number;
	pageSize: number;
	appId?: number;
	order?: string;
	orderBy?: string;
	keyword?: string;
	name?: string;
}

export interface ListAppOAuthChannelReply {
	list: AppOAuthChannel[];
}

export interface ListTenantAppOAuthChannelRequest {
	app: string;
	tenant: string;
}

export interface ListTenantAppOAuthChannelReply {
	list: Channel[];
}

export interface CreateAppOAuthChannelRequest {
	appId: number;
	channelId: number;
}

export interface DeleteAppOAuthChannelRequest {
	id: number;
}

export interface AppField {
	id: number;
	appId: number;
	fieldId: number;
	field: Field;
}

export interface ListAppFieldRequest {
	page: number;
	pageSize: number;
	appId: number;
	order?: string;
	orderBy?: string;
	keyword?: string;
	name?: string;
}

export interface ListAppFieldReply {
	total: number;
	list: AppField[];
}

export interface CreateAppFieldRequest {
	appId: number;
	fieldId: number;
}

export interface DeleteAppFieldRequest {
	id: number;
}
