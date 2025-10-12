import { App, Field } from '../app/type';

export interface LoadEntityRequest {
	app: string;
}

export interface ImportEntityRequest {
	appId: number;
	list: Entity[];
}

export interface ListEntityRequest {
	page: number;
	pageSize: number;
	appId?: number;
	name?: string;
}

export interface Entity {
	id: number;
	appId: number;
	database: string;
	name: string;
	fields?: Field[];
	comment?: string;
	createdAt: number;
	updatedAt: number;
	app?: App;
}

export interface ListEntityReply {
	total: number;
	list: Entity[];
}

export interface CreateEntityRequest {
	appId: number;
	database: string;
	name: string;
	comment?: string;
}

export interface CreateEntityReply {
	id: number;
}

export interface UpdateEntityRequest {
	id: number;
	database?: string;
	name?: string;
	comment?: string;
}

export interface DeleteEntityRequest {
	id: number;
}

export interface DeleteEntityReply {
	total: number;
}

export interface GetEntityRequest {
	id?: number;
	keyword?: string;
}

export interface GetEntityReply {
	id: number;
	appId: number;
	database: string;
	name: string;
	comment?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListEntityFieldRequest {
	entityId?: number;
	name?: string;
}

export interface EntityField {
	id: number;
	entityId: number;
	name: string;
	comment?: string;
	createdAt: number;
	updatedAt: number;
	children?: EntityField[];
}

export interface ListEntityFieldReply {
	total: number;
	list: EntityField[];
}

export interface CreateEntityFieldRequest {
	entityId: number;
	name: string;
	comment?: string;
}

export interface CreateEntityFieldReply {
	id: number;
}

export interface UpdateEntityFieldRequest {
	id: number;
	name: string;
	comment?: string;
}

export interface DeleteEntityFieldRequest {
	id: number;
}

export interface DeleteEntityFieldReply {
	total: number;
}

export interface EntityRule {
	id: number;
	entityId: number;
	name: string;
	expression?: string;
	description?: string;
	createdAt: number;
	updatedAt: number;
	children?: EntityRule[];
}

export interface ListEntityRuleRequest {
	entityId?: number;
	name?: string;
}

export interface ListEntityRuleReply {
	total: number;
	list: EntityRule[];
}

export interface CreateEntityRuleRequest {
	entityId: number;
	name: string;
	expression?: string;
	description?: string;
}

export interface CreateEntityRuleReply {
	id: number;
}

export interface UpdateEntityRuleRequest {
	id: number;
	name: string;
	expression?: string;
	description?: string;
}

export interface DeleteEntityRuleRequest {
	id: number;
}

export interface DeleteEntityRuleReply {
	total: number;
}
