export interface GetResourceRequest {
	keyword: string;
	resourceId: number;
}

export interface GetResourceReply {
	deptIds: number[];
}

export interface UpdateResourceRequest {
	keyword: string;
	resourceId: number;
	deptIds: number[];
}
