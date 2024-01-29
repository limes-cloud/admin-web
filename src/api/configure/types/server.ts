import { Resource } from '@/types/global';

export interface Server {
	id: number;
	keyword: string;
	name: string;
	logo: string;
	fullName: string;
	description: string;
	created_at: number;
	updated_at: number;
	resource: Resource;
}

export interface PageServerReq {
	keyword?: string;
	name?: string;
	page: number;
	page_size: number;
}

export interface PageServerRes {
	list: Server[];
	total: number;
}
