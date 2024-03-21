import { Department } from './department';
import { Job } from './job';
import { Role } from './role';

export interface User {
	id: number;
	department_id: number;
	role_id: number;
	role_ids: number[];
	job_ids: number[];
	name: string;
	nickname: string;
	gender: string;
	phone: string;
	avatar: string;
	email: string;
	status: boolean;
	disabled: string;
	last_login: number;
	token?: string;
	password?: string;
	created_at: number;
	updated_at: number;
	role?: Role;
	roles?: Role[];
	jobs?: Job[];
	department?: Department;
}

export interface PageUserReq {
	role_id?: number;
	department_id?: number;
	name?: string;
	username?: string;
	status?: string;
	time?: number[];
	start_time?: number;
	end_time?: number;
	page: number;
	page_size: number;
}

export interface UpdateUserbasicReq {
	nickname: string;
	gender: string;
}

export interface PageUserRes {
	list: User[];
	total: number;
}

export interface ChangePasswordReq {
	password: string;
	captcha_id: string;
	captcha: string;
}

export interface ChangePasswordCaptchRes {
	uuid: string;
	expire: number;
}

export interface SwitchUserRole {
	token: string;
}
