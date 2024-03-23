export interface Resource {
	servers: number[];
	private: boolean;
	id: number;
	keyword: string;
	description: string;
	fields: string;
	fieldList: string[];
	tag: string;
	created_at: number;
	updated_at: number;
}

export interface PageResourceReq {
	keyword?: string;
	tag?: string;
	server_id?: number;
	page: number;
	page_size: number;
}

export interface PageResourceRes {
	list: Resource[];
	total: number;
}

export interface ResourceValue {
	id?: number;
	env_id: number;
	resource_id?: number;
	env_keyword?: string;
	value: string;
}
