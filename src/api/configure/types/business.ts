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

export interface BusinessValue {
	id?: number;
	env_id: number;
	business_id?: number;
	env_keyword?: string;
	value: string;
}
