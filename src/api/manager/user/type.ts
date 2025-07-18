export interface GetUserRequest {
	id?: number;
	phone?: string;
	email?: string;
}

export interface Role {
	id: number;
	name: string;
	keyword: string;
}

export interface Job {
	id: number;
	name: string;
	keyword: string;
}

export interface Department {
	id: number;
	name: string;
	keyword: string;
}

export interface GetUserReply {
	id: number;
	name: string;
	nickname: string;
	gender: string;
	avatar?: string;
	phone: string;
	email: string;
	status?: boolean;
	setting?: string;
	loggedAt: number;
	createdAt: number;
	updatedAt: number;
	roles: Role[];
	jobs: Job[];
	jobIds: number[];
	roleIds: number[];
	departments?: Department[];
	departmentIds: number[];
}

export interface ListUserRequest {
	page: number;
	pageSize: number;
	departmentId?: number;
	roleId?: number;
	name?: string;
	phone?: string;
	email?: string;
	status?: boolean;
	loggedAts: number[];
	createdAts: number[];
}

export interface User {
	id: number;
	name: string;
	nickname: string;
	gender: string;
	avatar?: string;
	phone: string;
	email: string;
	status?: boolean;
	loggedAt: number;
	createdAt: number;
	updatedAt: number;
}

export interface ListUserReply {
	total: number;
	list: User[];
}

export interface CreateUserRequest {
	name: string;
	gender: string;
	phone: string;
	email: string;
	jobIds: number[];
	roleIds: number[];
	departmentIds: number[];
}

export interface CreateUserReply {
	id: number;
}

export interface UpdateUserRequest {
	id: number;
	name: string;
	gender: string;
	phone: string;
	email: string;
	jobIds: number[];
	roleIds: number[];
	departmentIds: number[];
}

export interface UpdateUserStatusRequest {
	id: number;
	status: boolean;
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
	setting: string;
}

export interface UserLoginRequest {
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

export interface ListLoginLogRequest {
	page: number;
	pageSize: number;
	username?: string;
	createdAts?: number[];
}

export interface LoginLog {
	username: string;
	type: string;
	ip: string;
	address: string;
	browser: string;
	device: string;
	code: number;
	description: string;
}

export interface ListLoginLogReply {
	total: number;
	list: LoginLog[];
}
