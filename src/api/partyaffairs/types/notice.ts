import { User } from '@/types/global';

export interface Notice {
	id: number;
	title: string;
	desc: string;
	unit: string;
	is_top: boolean;
	is_send_email: boolean;
	content: string;
	created_at: number;
	updated_at: number;
}

export interface PageNoticeReq {
	page: number;
	page_size: number;
	title?: string;
}

export interface PageNoticeUserReq {
	page: number;
	page_size: number;
	notice_id: number;
	is_read?: boolean;
}

export interface PageNoticeUserRes {
	total: number;
	list: User[];
}

export interface PageNoticeRes {
	total: number;
	list: Notice[];
}

export interface AddNoticeReq {
	title: string;
	desc: string;
	unit: string;
	content: string;
	is_top: boolean;
	is_send_email: boolean;
}

export interface UpdateNoticeReq {
	id: number;
	title: string;
	desc: string;
	unit: string;
	content: string;
	is_top: boolean;
	is_send_email: boolean;
}
