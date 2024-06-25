export interface Template {
	id: number;
	serverId: number;
	version: string;
	format: string;
	description: string;
	content: string;
	compare: string;
	createdAt: number;
	updatedAt: number;
}

export interface SwitchTemplateRequest {
	serverId: number;
	id: number;
}

export interface CreateTemplateRequest {
	serverId: number;
	description: string;
	content: string;
}

export interface ParseTemplateRequest {
	content: string;
	format: string;
	envId: number;
	serverId: number;
}

export interface ParseTemplateReply {
	content: string;
}

export interface ListTemplateRequest {
	serverId: number;
	page: number;
	pageSize: number;
}

export interface ListTemplateReply {
	list: Template[];
	total: number;
}

export interface CompareTemplateRequest {
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

export interface CompareTemplateReply {
	list: CompareTemplateInfo[];
}
