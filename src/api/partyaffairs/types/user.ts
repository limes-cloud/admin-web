export interface User {
	id: number;
	name: string;
	nickname: string;
	gender: string;
	phone: string;
	avatar: string;
	email: string;
	status: boolean;
	last_login: number;
	token?: string;
	password?: string;
	created_at: number;
	updated_at: number;
}

export interface PageUserReq {
	name?: string;
	username?: string;
	status?: string;
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
