export interface ListAuthRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	userId?: number;
}

export interface Auth {
	id: number;
	status?: boolean;
	disableDesc?: string;
	loggedAt: number;
	expiredAt: number;
	createdAt: number;
}

export interface ListAuthReply {
	total: number;
	list: Auth[];
}

export interface CreateAuthRequest {
	userId: number;
	appId: number;
	status?: boolean;
}

export interface CreateAuthReply {
	id: number;
}

export interface UpdateAuthStatusRequest {
	id: number;
	status: boolean;
	disableDesc?: string;
}

export interface DeleteAuthRequest {
	appId: number;
	userId: number;
}

export interface DeleteAuthReply {
	total: number;
}
