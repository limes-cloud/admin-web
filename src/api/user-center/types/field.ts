export interface Field {
	id: number;
	keyword: string;
	type: string;
	name: string;
	description: string;
	created_at: number;
	updated_at: number;
}

export interface FieldType {
	type: string;
	name: string;
}

export interface AllFieldTypeRes {
	list: FieldType[];
}

export interface PageFieldReq {
	page: number;
	page_size: number;
	name?: string;
	keyword?: string;
}

export interface PageFieldRes {
	total: number;
	list: Field[];
}
