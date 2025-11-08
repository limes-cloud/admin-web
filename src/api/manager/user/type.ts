export interface GetUserRequest {
	id?: number;
	phone?: string;
	email?: string;
}

export interface GetCurrentUserRequest {
	app?: string;
}

export interface Info {
	field: string;
	value: any;
}

export interface Role {
	id: number;
	name: string;
}

export interface Job {
	id: number;
	name: string;
}

export interface Dept {
	id: number;
	name: string;
	keyword: string;
}

export interface GetUserReply {
	isLogin: boolean;
	id: number;
	avatar: string;
	username: string;
	nickname: string;
	status?: boolean;
	loggedAt: number;
	createdAt: number;
	updatedAt: number;
	job?: Job;
	jobId: number;
	dept?: Dept;
	deptId: number;
	setting: string;
	infos: Info[];
}

export interface ListUserRequest {
	page: number;
	pageSize: number;
	deptId?: number;
	roleId?: number;
	username?: string;
	phone?: string;
	email?: string;
	status?: boolean;
	loggedAts?: number[];
	createdAts?: number[];
}

export interface User {
	id: number;
	username: string;
	nickname: string;
	status?: boolean;
	deptId: number;
	jobId: number;
	job?: Job;
	dept?: Dept;
	loggedAt: number;
	createdAt: number;
	updatedAt: number;
}

export interface ListUserReply {
	total: number;
	list: User[];
}

export interface CreateUserRequest {
	username: string;
	nickname: string;
	status?: boolean;
	deptId: number;
	jobId: number;
}

export interface CreateUserReply {
	id: number;
}

export interface UpdateUserRequest {
	id: number;
	username?: string;
	nickname?: string;
	status?: boolean;
	deptId?: number;
	jobId?: number;
}

export interface DeleteUserRequest {
	id: number;
}

export interface DeleteUserReply {
	total: number;
}

export interface UpdateCurrentUserRequest {
	avatar?: string;
	nickname?: string;
	gender?: string;
}

export interface ResetUserPasswordRequest {
	id: number;
}

export interface UpdateCurrentUserRoleRequest {
	roleId: number;
}

export interface UpdateCurrentUserRoleReply {
	token: string;
}

export interface UpdateCurrentUserPasswordRequest {
	password: string;
	oldPassword?: string;
	captchaId?: string;
	captcha?: string;
}

export interface UpdateCurrentUserSettingRequest {
	app: string;
	setting: string;
}

export interface UserLoginRequest {
	tenant: string;
	username: string;
	password: string;
	captchaId: string;
	captcha: string;
}

export interface UserLoginReply {
	token: string;
}

export interface UserRefreshTokenReply {
	token: string;
}

export interface SendCurrentUserCaptchaRequest {
	type: string;
}

export interface SendCurrentUserCaptchaReply {
	uuid: string;
	captcha: string;
	expire: number;
}

export interface GetUserLoginCaptchaReply {
	uuid: string;
	captcha: string;
	expire: number;
}

export interface ListUserDeptRequest {
	page: number;
	pageSize: number;
	name?: string;
	userId: number;
}

export interface Data {
	id: number;
	name: string;
}

export interface ListUserDeptReply {
	total: number;
	list: {
		userId: number;
		dept: Data;
		job: Data;
	}[];
}

export interface CreateUserDeptRequest {
	userId: number;
	deptId: number;
	jobId: number;
}

export interface CreateUserDeptReply {}

export interface DeleteUserDeptRequest {
	userId: number;
	deptId: number;
}

export interface DeleteUserDeptReply {}
