export interface ListOAuthRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	userId?: number;
}

export interface OAuth {
	id: number;
	status?: boolean;
	disableDesc?: string;
	loggedAt: number;
	expiredAt: number;
	createdAt: number;
}

export interface ListOAuthReply {
	total: number;
	list: OAuth[];
}

export interface DeleteOAuthRequest {
	channelId: number;
	userId: number;
}

export interface DeleteOAuthReply {
	total: number;
}
