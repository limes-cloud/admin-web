export interface ListCommentRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	userName?: string;
}

export interface Comment {
	id: number;
	userId: number;
	userName: string;
	userAvatar: string;
	sessionId: string;
	message: string;
	type: string;
	createdAt: number;
}

export interface ListCommentReply {
	list: Comment[];
	total: number;
}

export interface DeleteCommentRequest {
	id: number;
}
