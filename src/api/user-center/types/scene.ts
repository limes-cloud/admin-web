import { Agreement } from './agreement';

export interface Scene {
	id: number;
	keyword: string;
	name: string;
	description: string;
	agreements: Agreement[];
	agreement_ids: number[];
	created_at: number;
	updated_at: number;
}

export interface PageSceneReq {
	page: number;
	page_size: number;
	name?: string;
	keyword?: string;
}

export interface PageSceneRes {
	total: number;
	list: Scene[];
}
