import { S } from 'mockjs';

export interface InterflowPerson {
	userId: number;
	username: string;
	nickname: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListInterflowPersonReply {
	list: InterflowPerson[];
}

export interface CreateInterflowPersonRequest {
	userId: number;
}

export interface CreateInterflowPersonReply {
	id: number;
}

export interface DeleteInterflowPersonRequest {
	userId: number;
}

export interface DeleteInterflowPersonReply {
	total: number;
}

export interface GetInterflowRequest {
	id: number;
}

export interface GetInterflowReply {
	id: number;
	classifyId: number;
	title: string;
	description: string;
	key: string;
	downloadCount: number;
	createdAt: number;
	updatedAt: number;
}

export interface ListInterflowRequest {
	page: number;
	pageSize: number;
	title?: string;
	classifyId?: number;
}

export interface Interflow {
	id: number;
	classifyId: number;
	title: string;
	description: string;
	key: string;
	downloadCount: number;
	createdAt: number;
	updatedAt: number;
}

export interface ListInterflowReply {
	total: number;
	list: Interflow[];
}

export interface CreateInterflowRequest {
	classifyId: number;
	title: string;
	description: string;
	key: string;
}

export interface CreateInterflowReply {
	id: number;
}

export interface UpdateInterflowRequest {
	id: number;
	classifyId?: number;
	title?: string;
	description?: string;
	key?: string;
}

export interface DeleteInterflowRequest {
	id: number;
}
