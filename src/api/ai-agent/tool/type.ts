export interface ListToolRequest {
	page: number;
	pageSize: number;
	title?: string;
	type?: string;
	userId?: number;
	isOpen?: boolean;
}

export interface Tool {
	id: number;
	userId?: number;
	icon: string;
	iconUrl?: string;
	keyword: string;
	type: string;
	isOpen: boolean;
	title: string;
	description: string;
	introduce: string;
	content?: string;
	schema: string;
	tag?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListToolReply {
	total: number;
	list: Tool[];
}

export interface CreateToolRequest {
	icon: string;
	keyword: string;
	type: string;
	title: string;
	description: string;
	introduce: string;
	content?: string;
	schema: string;
	tag?: string;
}

export interface CreateToolReply {
	id: number;
}

export interface UpdateToolRequest {
	id: number;
	icon: string;
	keyword: string;
	type: string;
	title: string;
	description: string;
	introduce: string;
	content?: string;
	schema: string;
	tag?: string;
}

export interface DeleteToolRequest {
	id: number;
}

export interface ExecToolRequest {
	id: number;
	input: string;
}
export interface ExecToolReply {
	output: string;
}
