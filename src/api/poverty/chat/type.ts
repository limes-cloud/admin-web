export interface ListChatRecordRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	userId?: number;
	sessionId?: string;
	userName?: string;
	distinct?: boolean;
}
export interface ChatRecord {
	id: number;
	userId: number;
	userName: string;
	userAvatar: string;
	sessionId: string;
	message: string;
	type: string;
	createdAt: number;
}

export interface ListChatRecordReply {
	list: ChatRecord[];
	total: number;
}
