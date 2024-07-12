export interface GetResourceRequest {
	keyword: string;
	resourceId: number;
}

export interface GetResourceReply {
	departmentIds: number[];
}

export interface UpdateResourceRequest {
	keyword: string;
	resourceId: number;
	departmentIds: number[];
}
