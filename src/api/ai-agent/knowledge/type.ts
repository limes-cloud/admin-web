import { S } from 'mockjs';

export interface ListKnowledgeRequest {
	page: number;
	pageSize: number;
	title?: string;
	type?: string;
	userId?: number;
	isOpen?: boolean;
}
export interface Name {
	id: number;
	name: string;
}

export interface Knowledge {
	id: number;
	userId?: number;
	url?: string;
	sha: string;
	type: string;
	isOpen: boolean;
	title: string;
	description: string;
	modelId: string;
	model: Name;
	status: string;
	reason?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListKnowledgeReply {
	total: number;
	list: Knowledge[];
}

export interface CreateKnowledgeRequest {
	sha: string;
	type: string;
	title: string;
	description: string;
	modelId: number;
}

export interface UpdateKnowledgeRequest {
	id: number;
	sha: string;
	type: string;
	title: string;
	description: string;
	modelId: number;
}

export interface DeleteKnowledgeRequest {
	id: number;
}
