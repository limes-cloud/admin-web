export interface PrepareUploadReq {
	directory_id?: number;
	app: string;
	name?: string;
	sha?: string;
	size?: number;
}

export interface PrepareUploadRes {
	uploaded?: string;
	src?: string;
	chunk_size?: number;
	chunk_count?: number;
	upload_id?: string;
	upload_chunks: number[];
}

export interface UploadReq {
	data: string;
	index: number;
	upload_id: string;
}

export interface PageFileReq {
	directory_id: number;
	app: string;
	name: string;
	page: number;
	page_size: number;
}

export interface File {
	id: number;
	directory_id: number;
	name: string;
	type: string;
	size: number;
	sha: string;
	src: string;
}

export interface PageFileRes {
	total: number;
	list: File[];
}

export interface UpdateFileReq {
	id: number;
	name: string;
	app: string;
	directory_id: number;
}

export interface DeleteFileReq {
	ids: number[];
	app: string;
	directory_id: number;
}
export default null;
