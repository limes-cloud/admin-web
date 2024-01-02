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

export interface PageDictValueReq {
	keyword?: string;
	name?: string;
	page: number;
	page_size: number;
}

export interface PageDictValueRes {
	list: DictValue[];
	total: number;
}
