import { Resource } from '@/types/global';

export interface Channel {
	id: number;
	logo: string;
	platform: string;
	name: string;
	ak: string;
	sk: string;
	extra: string;
	status: boolean;
	resource: Resource;
	created_at: number;
	updated_at: number;
}

export interface Type {
	platform: string;
	name: string;
}

export interface AllTypeRes {
	list: Type[];
}

export interface AllChannelRes {
	list: Channel[];
}
