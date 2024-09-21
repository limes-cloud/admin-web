export interface ListUserinfoRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	userId?: number;
}

export interface Userinfo {
	id: number;
	userId: number;
	keyword: string;
	value: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListUserinfoReply {
	total: number;
	list: Userinfo[];
}

export interface CreateUserinfoRequest {
	userId: number;
	keyword: string;
	value: string;
}

export interface CreateUserinfoReply {
	id: number;
}

export interface ImportUserinfoRequest {
	list: CreateUserinfoRequest[];
}

export interface ImportUserinfoReply {
	total: number;
}

export interface GetUserinfoRequest {
	id?: number;
}

export interface GetUserinfoReply {
	id: number;
	keyword: string;
	value: string;
	createdAt: number;
	updatedAt: number;
}

export interface UpdateUserinfoRequest {
	id: number;
	keyword: string;
	value: string;
}

export interface DeleteUserinfoRequest {
	ids: number[];
}

export interface DeleteUserinfoReply {
	total: number;
}
