export interface DictExtra {
	api: string;
	method: string;
	params: string;
	label: string;
	value: string;
	description: string;
}

export interface Dict {
	id: number;
	keyword: string;
	name: string;
	type: string;
	extra: string;
	extra_info: DictExtra;
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
