export interface ObjectDef {
	id: number;
	keyword: string;
	name: string;
	api: string;
	method: string;
	params: string;
	label: string;
	value: string;
	description: string;
	created_at: number;
	updated_at: number;
}

export interface ObjectValue {
	value: any;
	label: string;
}

export interface PageObjectReq {
	keyword?: string;
	name?: string;
	page: number;
	page_size: number;
}

export interface PageObjectRes {
	list: ObjectDef[];
	total: number;
}

export interface ObjectRule {
	field: string;
	operate: string;
	object: string;
}
