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

export interface AdminChannel {
	id: number;
	logo: string;
	logoUrl: string;
	keyword: string;
	type: string;
	name: string;
	description?: string;
}

export interface Channel {
	id: number;
	logo: string;
	logoUrl: string;
	keyword: string;
	name: string;
	type: string;
	status?: boolean;
	ak?: string;
	sk?: string;
	extra?: string;
	admin?: boolean;
	description?: string;
	createdAt: number;
	updatedAt: number;
}

export interface ListChannelReply {
	total: number;
	list: Channel[];
}

export interface CreateChannelRequest {
	logo: string;
	keyword: string;
	name: string;
	type: string;
	status?: boolean;
	ak?: string;
	sk?: string;
	extra?: string;
	admin?: boolean;
	description?: string;
}

export interface CreateChannelReply {
	id: number;
}

export interface UpdateChannelRequest {
	id: number;
	type?: string;
	logo?: string;
	keyword?: string;
	name?: string;
	ak?: string;
	sk?: string;
	extra?: string;
	status?: boolean;
	admin?: boolean;
	description?: string;
}

export interface DeleteChannelRequest {
	ids: number[];
}

export interface DeleteChannelReply {
	total: number;
}
