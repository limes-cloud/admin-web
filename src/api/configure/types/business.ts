export interface Business {
	id: number;
	server_id: number;
	keyword: string;
	type: string;
	option: string | Record<any, string>;
	description: string;
	created_at: number;
	updated_at: number;
}

export interface PageBusinessReq {
	server_id: number;
	keyword?: string;
	page: number;
	page_size: number;
}

export interface PageBusinessRes {
	list: Business[];
	total: number;
}
