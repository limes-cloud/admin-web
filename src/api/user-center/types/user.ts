import { Resource } from '@/types/global';

export interface App {
	id: number;
	logo: string;
	name: string;
	created_at: number;
	resource: Resource;
}

export interface Channel {
	id: number;
	logo: string;
	name: string;
	login_at: number;
	created_at: number;
	resource: Resource;
}

export interface Extra {
	keyword: string;
	name: string;
	type: string;
	type_name: string;
	value: any;
}

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
	apps: App[];
	channels: Channel[];
	extra: Record<string, any>;
	extra_list: Extra[];
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
