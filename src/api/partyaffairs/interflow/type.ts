export interface InterflowClassify {
	id: number;
	name: string;
	description: string;
	weight: number;
	person: string;
	personObject: number[];
	users: {
		id: number;
		nickname: string;
	}[];
	createdAt: number;
	updatedAt: number;
}

export interface ListInterflowClassifyReply {
	total: number;
	list: InterflowClassify[];
}

export interface CreateInterflowClassifyRequest {
	name: string;
	weight: number;
}

export interface CreateInterflowClassifyReply {
	id: number;
}

export interface UpdateInterflowClassifyRequest {
	id: number;
	name: string;
	weight: number;
	person: string;
	description: string;
}

export interface DeleteInterflowClassifyRequest {
	id: number;
}

export interface DeleteInterflowClassifyReply {
	total: number;
}
