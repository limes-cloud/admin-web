export interface ListAssessmentRequest {
	page: number;
	pageSize: number;
	title?: string;
}

export interface Name {
	id: number;
	title: string;
}

export interface Assessment {
	id: number;
	title: string;
	description: string;
	prompt: string;
	models: number[];
	knowledges?: number[];
	tools?: number[];
	temperature?: number;
	topP?: number;
	topK?: number;
	penaltyScore?: number;
	modelList: Name[];
	knowledgeList?: Name[];
	toolList?: Name[];
	createdAt: number;
	updatedAt: number;
}

export interface ListAssessmentReply {
	total: number;
	list: Assessment[];
}

export interface CreateAssessmentRequest {
	title: string;
	description: string;
	prompt: string;
	models: number[];
	knowledges?: number[];
	tools?: number[];
	temperature?: number;
	topP?: number;
	topK?: number;
	penaltyScore?: number;
}

export interface CreateAssessmentReply {
	id: number;
}

export interface UpdateAssessmentRequest {
	id: number;
	title: string;
	description: string;
	prompt: string;
	models: number[];
	knowledges?: number[];
	tools?: number[];
	temperature?: number;
	topP?: number;
	topK?: number;
	penaltyScore?: number;
}

export interface DeleteAssessmentRequest {
	id: number;
}
