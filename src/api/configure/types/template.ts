export interface Template {
	id: number;
	server_id: number;
	version: string;
	format: string;
	description: string;
	content: string;
	compare: string;
	created_at: number;
	updated_at: number;
}

export interface SwitchTemplateReq {
	server_id: number;
	id: number;
}

export interface AddTemplateReq {
	server_id: number;
	description: string;
	content: string;
}

export interface ParseTemplateReq {
	env_keyword: string;
	content: string;
	format: string;
	server_id: number;
}

export interface ParseTemplateRes {
	content: string;
}

export interface PageTemplateReq {
	server_id: number;
	page: number;
	page_size: number;
}

export interface PageTemplateRes {
	list: Template[];
	total: number;
}

export interface CompareTemplateReq {
	id: number;
	format: string;
	content: string;
}

export interface CompareTemplateInfo {
	type: string;
	key: string;
	old: string;
	cur: string;
}
