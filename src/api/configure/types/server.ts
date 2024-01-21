export interface Server {
	id: number;
	keyword: string;
	name: string;
	is_business: boolean;
	fullName: string;
	description: string;
	created_at: number;
	updated_at: number;
}

export interface PageServerReq {
	keyword?: string;
	name?: string;
	is_business?: boolean;
	page: number;
	page_size: number;
}

export interface PageServerRes {
	list: Server[];
	total: number;
}
