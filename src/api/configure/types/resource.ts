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
	page: number;
	page_size: number;
}

export interface PageResourceRes {
	list: Resource[];
	total: number;
}
