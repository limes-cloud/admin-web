export interface Job {
	id: number;
	keyword: string;
	name: string;
	weight: number;
	description: string;
	created_at: number;
	updated_at: number;
}

export interface PageJobReq {
	keyword?: string;
	page: number;
	page_size: number;
}

export interface PageJobRes {
	list: Job[];
	total: number;
}
