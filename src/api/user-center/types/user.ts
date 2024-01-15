import { S } from 'mockjs';
import { UserApp } from './user-app';
import { UserExtra } from './user-extra';

export interface User {
	id: number;
	phone: string;
	email: string;
	username: string;
	nick_name: string;
	real_name: string;
	id_card: string;
	avatar: string;
	gender: string;
	status: boolean;
	disable_desc: string;
	form: string;
	created_at: number;
	updated_at: number;
	user_apps: UserApp[];
	user_extras: UserExtra[];
}

export interface PageUserReq {
	page: number;
	page_size: number;
	app?: string;
	real_name?: string;
	username?: string;
	phone?: string;
	email?: string;
	id_card?: string;
}

export interface PageUserRes {
	list: User[];
	total: number;
}

export interface AddUserRes {
	id: number;
}
