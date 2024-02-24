import { Resource } from '@/types/global';
import { Channel } from './channel';
import { Field } from './field';

export interface App {
	id: number;
	keyword: string;
	logo: string;
	name: string;
	status: boolean;
	allow_registry: boolean;
	description: string;
	version: string;
	copyright: string;
	resource: Resource;
	channels: Channel[];
	channel_ids: number[];
	fields: Field[];
	field_ids: number[];
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
