import { Resource, SimpleUser } from '@/types/global';

export interface NewsClassify {
	id: number;
	name: string;
	weight: number;
	created_at: number;
	updated_at: number;
}

export interface AddNewsClassifyReq {
	name: string;
	weight: number;
}

export interface UpdateNewsClassifyReq {
	id: number;
	name: string;
	weight: number;
}

export interface NewsContent {
	id: number;
	title: string;
	unit: string;
	cover: string;
	desc: string;
	content: string;
	read: number;
	is_top: boolean;
	classify_id: number;
	created_at: number;
	updated_at: number;
	resource: Resource;
}

export interface PageNewsContentReq {
	page: number;
	page_size: number;
	classify_id?: number;
	title?: string;
}

export interface PageNewsContentRes {
	total: number;
	list: NewsContent[];
}

export interface AddNewsContentReq {
	title: string;
	unit: string;
	cover: string;
	desc: string;
	content: string;
	read: number;
	classify_id: number;
}

export interface UpdateNewsContentReq {
	id: number;
	title: string;
	unit: string;
	cover: string;
	desc: string;
	content: string;
	read: number;
	classify_id: number;
}

export interface NewsComment {
	form: SimpleUser;
	reply?: SimpleUser;
	text: string;
	created_at: number;
}

export interface PageNewsCommentReq {
	page: number;
	page_size: number;
	content_id: number;
	text?: string;
}

export interface PageNewsCommentRes {
	total: number;
	list: NewsComment[];
}
