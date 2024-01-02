export interface Dict {
	id: number;
	keyword: string;
	name: string;
	description: string;
	created_at: number;
	updated_at: number;
}

export interface PageDictReq {
	keyword?: string;
	name?: string;
	page: number;
	page_size: number;
}

export interface PageDictRes {
	list: Dict[];
	total: number;
}
