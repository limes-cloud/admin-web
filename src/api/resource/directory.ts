import axios from 'axios';
import { AddDirectoryReq, DeleteDirectoryReq, Directory, GetDirectoryReq, UpdateDirectoryReq } from './types/directory';

export function getDirectory(req: GetDirectoryReq) {
	return axios.get<{ list: Directory[] }>(`/resource/v1/directories`, {
		params: req
	});
}

export function addDirectory(req: AddDirectoryReq) {
	return axios.post(`/resource/v1/directory`, req);
}

export function updateDirectory(req: UpdateDirectoryReq) {
	return axios.put(`/resource/v1/directory`, req);
}

export function deleteDirectory(req: DeleteDirectoryReq) {
	return axios.delete(`/resource/v1/directory`, { params: req });
}

export default null;
