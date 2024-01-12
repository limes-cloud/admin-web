export interface DictValue {
	id: number;
	dict_id: number;
	label: string;
	value: string;
	status: boolean;
	weight: number;
	type: string;
	extra: string;
	description: string;
	created_at: number;
	updated_at: number;
}

export interface ImportDictValueData {
	label: string;
	value: string;
	description: string;
}

export interface ImportDictValueReq {
	dict_id: number;
	list: ImportDictValueData[];
}

export interface PageDictValueReq {
	keyword?: string;
	name?: string;
	dict_id: number;
	page: number;
	page_size: number;
}

export interface PageDictValueRes {
	list: DictValue[];
	total: number;
}

export interface ReloadDictValueReq {
	api: string;
	method: string;
	params: object;
}
