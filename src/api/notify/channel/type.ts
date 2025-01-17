export interface EmailExtra {
	name: string;
	host: string;
	port: number;
}

export interface ChannelType {
	keyword: string;
	name: string;
}

export interface ListChannelRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	type?: string;
	name?: string;
	status?: boolean;
}

export interface Channel {
	id: number;
	type: string;
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
	type: string;
	name: string;
	status?: boolean;
	ak?: string;
	sk?: string;
	extra?: string;
	extraObject: EmailExtra;
}

export interface CreateChannelReply {
	id: number;
}

export interface UpdateChannelRequest {
	id: number;
	type?: string;
	name?: string;
	ak?: string;
	sk?: string;
	extra?: string;
	status?: boolean;
	extraObject: EmailExtra;
}

export interface DeleteChannelRequest {
	id: number;
}

export interface DeleteChannelReply {
	total: number;
}

export interface OfficialTemplateField {
	keyword: string;
	name: string;
	value: string;
	color: string;
}

export interface OfficialTemplateMiniProgram {
	appId: string;
	pagePath: string;
}

export interface OfficialTemplate {
	templateId: string;
	title: string;
	fields: OfficialTemplateField[];
	jumpType: string;
	url: string;
	miniProgram: OfficialTemplateMiniProgram;
	// primaryIndustry: string;
	// deputyIndustry: string;
	// content: string;
	// example: string;
}

export interface ListOfficialTemplateRequest {
	id: number;
}
export interface ListOfficialTemplateReply {
	list: OfficialTemplate[];
}
