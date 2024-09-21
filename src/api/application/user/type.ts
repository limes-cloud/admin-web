export interface GetUserRequest {
	id?: number;
	phone?: string;
	email?: string;
	username?: string;
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

export interface GetUserReply {
	id: number;
	phone?: string;
	email?: string;
	username?: string;
	password?: string;
	nickName: string;
	realName?: string;
	avatar?: string;
	gender?: string;
	status?: boolean;
	disableDesc?: string;
	from: string;
	fromDesc: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListUserRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	phone?: string;
	email?: string;
	username?: string;
	realName?: string;
	gender?: string;
	status?: boolean;
	from?: string;
	createdAts?: number[];
	appId?: number;
}

export interface User {
	id: number;
	phone?: string;
	email?: string;
	username?: string;
	password?: string;
	nickName: string;
	realName?: string;
	avatar?: string;
	gender?: string;
	status?: boolean;
	disableDesc?: string;
	from: string;
	fromDesc: string;
	createdAt: number;
	updatedAt: number;
	deletedAt: number;
}

export interface ListUserReply {
	total: number;
	list: User[];
}

export interface AppChannel {
	channelId: number;
}

export interface AppField {
	fieldId: number;
}

export interface CreateUserRequest {
	phone?: string;
	email?: string;
	username?: string;
	password?: string;
	realName?: string;
	gender?: string;
}

export interface CreateUserReply {
	id: number;
}

export interface ImportUserRequest {
	list: CreateUserRequest[];
}

export interface ImportUserReply {
	total: number;
}

export interface ExportUserRequest {
	phone?: string;
	email?: string;
	username?: string;
	realName?: string;
	gender?: string;
	status?: boolean;
	from?: string;
	createdAts: number[];
}

export interface ExportUserReply {
	src: string;
}

export interface UpdateUserRequest {
	id: number;
	phone?: string;
	email?: string;
	username?: string;
	password?: string;
	nickName: string;
	realName?: string;
	avatar?: string;
	gender?: string;
	disableDesc?: string;
}

export interface UpdateUserStatusRequest {
	id: number;
	status: boolean;
	disableDesc?: string;
}

export interface DeleteUserRequest {
	ids: number[];
}

export interface DeleteUserReply {
	total: number;
}

export interface GetTrashUserRequest {
	id: number;
}

export interface GetTrashUserReply {
	id: number;
	phone?: string;
	email?: string;
	username?: string;
	password?: string;
	nickName: string;
	realName?: string;
	avatar?: string;
	gender?: string;
	status?: boolean;
	disableDesc?: string;
	from: string;
	fromDesc: string;
	createdAt: number;
	updatedAt: number;
	deletedAt: number;
}

export interface ListTrashUserRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	phone?: string;
	email?: string;
	username?: string;
	realName?: string;
	gender?: string;
	status?: boolean;
	from?: string;
	createdAts: number[];
}

export interface ListTrashUserReply {
	total: number;
	list: User[];
}

export interface DeleteTrashUserRequest {
	ids: number[];
}

export interface DeleteTrashUserReply {
	total: number;
}

export interface RevertTrashUserRequest {
	id: number;
}

export interface UserApp {
	appId: number;
	loggedAt: number;
}

export interface UserField {
	keyword: string;
	value: string;
}
