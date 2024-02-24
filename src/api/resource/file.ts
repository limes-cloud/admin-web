import axios from 'axios';
import { DeleteFileReq, PageFileReq, PageFileRes, PrepareUploadReq, PrepareUploadRes, UpdateFileReq, UploadReq } from './types/file';

export function prepareUpload(req: PrepareUploadReq) {
	return axios.post<PrepareUploadRes>(`/resource/v1/upload/prepare`, req);
}

export function upload(req: UploadReq) {
	return axios.post(`/resource/v1/upload`, req);
}

export function pageFile(req: PageFileReq) {
	return axios.get<PageFileRes>(`/resource/v1/files`, {
		params: req
	});
}

export function getFileBySha(sha: string) {
	return axios.get<File>(`/resource/v1/file/sha`, {
		params: { sha }
	});
}

export function updateFile(req: UpdateFileReq) {
	return axios.put(`/resource/v1/file`, req);
}

export function deleteFile(req: DeleteFileReq) {
	return axios.post<PageFileRes>(`/resource/v1/file`, req);
}

export default null;
