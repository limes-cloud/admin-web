export interface Name {
	id: number;
	name: string;
}

export interface ListModelRequest {
	page: number;
	pageSize: number;
	title?: string;
	type?: string;
	secretGroupId?: number;
}

export interface Model {
	id: number;
	type: string;
	title: string;
	keyword: string;
	supportJson: boolean;
	supportTool: boolean;
	description: string;
	secretGroupId: number;
	createdAt: number;
	updatedAt: number;
	secretGroup?: Name;
}

export interface ListModelReply {
	total: number;
	list: Model[];
}

export interface CreateModelRequest {
	type: string;
	title: string;
	keyword: string;
	supportJson: boolean;
	supportTool: boolean;
	description: string;
	secretGroupId: number;
}

export interface CreateModelReply {
	id: number;
}

export interface UpdateModelRequest {
	id: number;
	type: string;
	title: string;
	keyword: string;
	supportJson: boolean;
	supportTool: boolean;
	description: string;
	secretGroupId: number;
}

export interface DeleteModelRequest {
	id: number;
}
