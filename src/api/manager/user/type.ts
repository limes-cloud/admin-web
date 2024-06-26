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
	departmentId: number;
	roleId: number;
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
	department?: Department;
	role?: Role;
}

export interface ListUserRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
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
	departmentId: number;
	name: string;
	gender: string;
	phone: string;
	email: string;
	jobIds: number[];
	roleIds: number[];
}

export interface CreateUserReply {
	id: number;
}

export interface UpdateUserRequest {
	id: number;
	departmentId: number;
	name: string;
	gender: string;
	phone: string;
	email: string;
	jobIds: number[];
	roleIds: number[];
}

export interface UpdateUserStatusRequest {
	id: number;
	status: boolean;
}

export interface DeleteUserRequest {
	ids: number[];
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
