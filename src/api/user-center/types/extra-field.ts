export interface ExtraField {
	id: number;
	keyword: string;
	type: string;
	name: string;
	description: string;
	created_at: number;
	updated_at: number;
}

export interface ExtraFieldType {
	type: string;
	name: string;
}

export interface AllExtraFieldTypeRes {
	list: ExtraFieldType[];
}

export interface PageExtraFieldReq {
	page: number;
	page_size: number;
	name?: string;
	keyword?: string;
}

export interface PageExtraFieldRes {
	total: number;
	list: ExtraField[];
}
