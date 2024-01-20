import { Resource } from './resource';
import { Server } from './server';

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

export interface AllResourceServerRes {
	list: Server[];
}
