export interface ListSysChatRequest {
	page: number;
	pageSize: number;
	title?: string;
}

export interface Name {
	id: number;
	title: string;
}

export interface SysChat {
	id: number;
	title: string;
	prompt: string;
	modelId: number;
	thinkModelId: number;
	knowledges?: number[];
	tools?: number[];
	temperature?: number;
	topP?: number;
	topK?: number;
	penaltyScore?: number;
	model: Name;
	thinkModel?: Name;
	knowledgeList?: Name[];
	toolList?: Name[];
	createdAt: number;
	updatedAt: number;
}

export interface ListSysChatReply {
	total: number;
	list: SysChat[];
}

export interface CreateSysChatRequest {
	title: string;
	modelId: number;
	thinkModelId?: number;
	prompt: string;
	models: number[];
	knowledges?: number[];
	tools?: number[];
	temperature?: number;
	topP?: number;
	topK?: number;
	penaltyScore?: number;
}

export interface CreateSysChatReply {
	id: number;
}

export interface UpdateSysChatRequest {
	id: number;
	title: string;
	prompt: string;
	modelId: number;
	thinkModelId: number;
	knowledges?: number[];
	tools?: number[];
	temperature?: number;
	topP?: number;
	topK?: number;
	penaltyScore?: number;
}

export interface DeleteSysChatRequest {
	id: number;
}

export interface ConversationSysChatRequest {
	chatId: number;
	content: string;
}

export interface ConversationSysChatReply {
	think: string;
	content: string;
}

export interface ConversationSysChatReplyFunc {
	handler: (reply: ConversationSysChatReply) => void;
	done: () => void;
	error: (err: any) => void;
}
