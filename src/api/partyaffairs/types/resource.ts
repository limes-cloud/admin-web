import { Resource as FileResource } from '@/types/global';

export interface Resource {
	id: number;
	title: string;
	desc: string;
	url: string;
	download_count: number;
	classify_id: number;
	resource: FileResource;
	created_at: number;
	updated_at: number;
}

export interface PageResourceReq {
	page: number;
	page_size: number;
	classify_id?: number;
	title?: string;
}

export interface PageResourceRes {
	total: number;
	list: Resource[];
}

export interface AddResourceReq {
	title: string;
	desc: string;
	url: string;
	classify_id: number;
}

export interface UpdateResourceReq {
	id: number;
	title: string;
	desc: string;
	url: string;
	classify_id: number;
}
