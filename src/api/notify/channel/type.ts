export interface ChannelType {
	keyword: string;
	name: string;
}

export interface ListChannelRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	keyword?: string;
	name?: string;
	status?: boolean;
}

export interface Channel {
	id: number;
	keyword: string;
	name: string;
	status?: boolean;
	ak?: string;
	sk?: string;
	extra?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListChannelReply {
	total: number;
	list: Channel[];
}

export interface CreateChannelRequest {
	keyword: string;
	name: string;
	status?: boolean;
	ak?: string;
	sk?: string;
	extra?: string;
}

export interface CreateChannelReply {
	id: number;
}

export interface UpdateChannelRequest {
	id: number;
	keyword?: string;
	name?: string;
	ak?: string;
	sk?: string;
	extra?: string;
	status?: boolean;
}

export interface DeleteChannelRequest {
	id: number;
}

export interface DeleteChannelReply {
	total: number;
}
