import { Resource } from './resource';

export interface PageServerResourceReq {
	server_id: number;
	keyword?: string;
	page: number;
	page_size: number;
}

export interface PageServerResourceRes {
	total: number;
	list: Resource[];
}
