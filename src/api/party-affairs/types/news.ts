import { Resource } from '@/types/global';

export interface News {
	id: number;
	title: string;
	unit: string;
	cover: string;
	desc: string;
	content: string;
	read: number;
	classify_id: number;
	created_at: number;
	updated_at: number;
	resource: Resource;
}

export interface PageNewsReq {
	page: number;
	page_size: number;
	classify_id?: number;
	title?: string;
}

export interface PageNewsRes {
	total: number;
	list: News[];
}

export interface AddNewsReq {
	title: string;
	unit: string;
	cover: string;
	desc: string;
	content: string;
	read: number;
	classify_id: number;
}

export interface UpdateNewsReq {
	id: number;
	title: string;
	unit: string;
	cover: string;
	desc: string;
	content: string;
	read: number;
	classify_id: number;
}
