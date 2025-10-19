export interface ListInterflowRequest {
	page: number;
	pageSize: number;
	fromUserId?: number;
	toUserId?: number;
}

export interface Interflow {
	id: number;
	fromUserId: string;
	toUserId: string;
	content: string;
	type: string;
	createdAt: number;
}

export interface ListInterflowReply {
	total: number;
	list: Interflow[];
}

export interface DeleteInterflowRequest {
	id: number;
}

export interface ListInterflowRequest {
	page: number;
	pageSize: number;
	fromUserId?: number;
	toUserId?: number;
}

export interface Interflow {
	id: number;
	fromUserId: string;
	toUserId: string;
	content: string;
	type: string;
	createdAt: number;
}

export interface ListInterflowReply {
	total: number;
	list: Interflow[];
}

export interface DeleteInterflowRequest {
	id: number;
}
