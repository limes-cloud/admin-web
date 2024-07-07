import { Resource } from '@/types/global';

export interface Banner {
	id: number;
	title: string;
	src: string;
	path?: string;
	weight: number;
	resource?: Resource;
	created_at: number;
	updated_at: number;
}

export interface AllBannerRes {
	list: Banner[];
}

export interface AddBannerReq {
	title: string;
	src: string;
	path?: string;
	weight: number;
}

export interface UpdateBannerReq {
	id: number;
	title: string;
	src: string;
	path?: string;
	weight: number;
}
