import { Resource as FileResource } from '@/types/global';

export interface ResourceClassify {
	id: number;
	name: string;
	weight: number;
	created_at: number;
	updated_at: number;
}

export interface AddResourceClassifyReq {
	name: string;
	weight: number;
}

export interface UpdateResourceClassifyReq {
	id: number;
	name: string;
	weight: number;
}

export interface ResourceContent {
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

export interface PageResourceContentReq {
	page: number;
	page_size: number;
	classify_id?: number;
	title?: string;
}

export interface PageResourceContentRes {
	total: number;
	list: ResourceContent[];
}

export interface AddResourceContentReq {
	title: string;
	desc: string;
	url: string;
	classify_id: number;
}

export interface UpdateResourceContentReq {
	id: number;
	title: string;
	desc: string;
	url: string;
	classify_id: number;
}
