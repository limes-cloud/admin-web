import { Resource as FileResource } from '@/types/global';

export interface VideoClassify {
	id: number;
	name: string;
	cover: string;
	is_top: boolean;
	is_task: boolean;
	start: number;
	end: number;
	weight: number;
	desc: string;
	created_at: number;
	updated_at: number;
	resource: FileResource;
}

export interface PageVideoClassifyReq {
	page: number;
	page_size: number;
	name?: string;
}

export interface PageVideoClassifyRes {
	total: number;
	list: VideoClassify[];
}

export interface AddVideoClassifyReq {
	name: string;
	cover: string;
	is_top: boolean;
	weight: number;
}

export interface UpdateVideoClassifyReq {
	id: number;
	name: string;
	cover: string;
	is_top: boolean;
	weight: number;
}

export interface VideoContent {
	id: number;
	title: string;
	desc: string;
	url: string;
	duration: number;
	classify_id: number;
	classify: VideoClassify;
	resource: FileResource;
	created_at: number;
	updated_at: number;
}

export interface PageVideoContentReq {
	page: number;
	page_size: number;
	classify_id?: number;
	title?: string;
}

export interface PageVideoContentRes {
	total: number;
	list: VideoContent[];
}

export interface AddVideoContentReq {
	title: string;
	desc: string;
	url: string;
	classify_id: number;
}

export interface UpdateVideoContentReq {
	id: number;
	title: string;
	desc: string;
	url: string;
	classify_id: number;
}
