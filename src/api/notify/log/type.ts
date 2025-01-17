export interface ListLogRequest {
	page: number;
	pageSize: number;
	user?: string;
	status?: boolean;
	notifyId?: number;
	channelId?: number;
}

export interface Item {
	id: number;
	name: string;
}

export interface Log {
	id: number;
	notifyId: number;
	channelId: number;
	user: string;
	content: string;
	fromServer: string;
	fromIp: string;
	reason: string;
	channel: Item;
	notify: Item;
	createdAt: number;
	updatedAt: number;
}

export interface ListLogReply {
	total: number;
	list: Log[];
}
