import { Resource } from '@/types/global';
import { Channel } from './channel';

export interface App {
	id: number;
	keyword: string;
	logo: string;
	name: string;
	status: boolean;
	allow_registry: boolean;
	description: string;
	user_fields: string;
	user_field_arr: string[];
	version: string;
	copyright: string;
	resource: Resource;
	channels: Channel[];
	channel_ids: number[];
	created_at: number;
	updated_at: number;
}

export interface PageAppReq {
	page: number;
	page_size: number;
	name?: string;
	keyword?: string;
}

export interface PageAppRes {
	total: number;
	list: App[];
}
