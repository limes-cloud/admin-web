export interface ListTemplateRequest {
	notifyId: number;
}

export interface TemplateChannel {
	id: number;
	name: string;
	type: string;
}

export interface Template {
	id: number;
	notifyId: number;
	channel: TemplateChannel;
	channelId: number;
	content: string;
	status: boolean;
	weight: number;
	createdAt: number;
	updatedAt: number;
}

export interface ListTemplateReply {
	total: number;
	list: Template[];
}

export interface CreateTemplateRequest {
	notifyId: number;
	channelId: number;
	content: string;
	status: boolean;
	weight: number;
}

export interface CreateTemplateReply {
	id: number;
}

export interface UpdateTemplateRequest {
	id: number;
	notifyId: number;
	channelId?: number;
	content?: string;
	status?: boolean;
	weight?: number;
}

export interface DeleteTemplateRequest {
	id: number;
}
