export interface Dictionary {
	id: number;
	keyword: string;
	name: string;
	description: string;
	created_at: number;
	updated_at: number;
}

export interface PageDictionaryReq {
	keyword?: string;
	name?: string;
	page: number;
	page_size: number;
}

export interface PageDictionaryRes {
	list: Dictionary[];
	total: number;
}

export interface DictionaryValue {
	id: number;
	dictionary_id: number;
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

export interface PageDictionaryValueReq {
	keyword?: string;
	name?: string;
	dictionary_id: number;
	page: number;
	page_size: number;
}

export interface PageDictionaryValueRes {
	list: DictionaryValue[];
	total: number;
}
