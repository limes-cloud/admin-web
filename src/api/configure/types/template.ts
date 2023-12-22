export interface Template {
	id: number;
	server_id: number;
	version: string;
	format: string;
	description: string;
	content: string;
	created_at: number;
	updated_at: number;
}

export interface addTemplateReq {
	server_id: number;
	description: string;
	content: string;
}

export interface parseTemplateTestReq {
	env_keyword: string;
	content: string;
	format: string;
	server_id: number;
}

export interface parseTemplateTestRes {
	content: string;
}
