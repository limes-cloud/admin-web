export interface GetFileRequest {
	id?: number;
	sha?: string;
}

export interface GetFileReply {
	id: number;
	directoryId: number;
	name: string;
	type: string;
	size: number;
	sha: string;
	src?: string;
	status: string;
	uploadId: string;
	chunkCount: number;
	createdAt: number;
	updatedAt: number;
}

export interface ListFileRequest {
	page: number;
	pageSize: number;
	order?: string;
	orderBy?: string;
	directoryId?: number;
	status?: string;
	name?: string;
}

export interface File {
	id: number;
	directoryId: number;
	name: string;
	type: string;
	size: number;
	sha: string;
	src: string;
	url: string;
	status: string;
	uploadId: string;
	chunkCount: number;
	createdAt: number;
	updatedAt: number;
}

export interface ListFileReply {
	total: number;
	list: File[];
}

export interface CreateFileRequest {
	directoryId: number;
	name: string;
	type: string;
	size: number;
	sha: string;
	uploadId: string;
}

export interface CreateFileReply {
	id: number;
}

export interface UpdateFileRequest {
	id: number;
	directoryId: number;
	name: string;
}

export interface DeleteFileRequest {
	ids: number[];
}

export interface DeleteFileReply {
	total: number;
}

export interface PrepareUploadFileRequest {
	directoryId?: number;
	directoryPath?: string;
	store?: string;
	name: string;
	size: number;
	sha: string;
}

export interface PrepareUploadFileReply {
	uploaded: boolean;
	src?: string;
	chunkSize?: number;
	chunkCount?: number;
	uploadId?: string;
	uploadChunks?: number[];
	sha?: string;
	url?: string;
}

export interface UploadFileReply {
	src: string;
	sha: string;
}
