import axios from 'axios';
import { PageSceneRes, Scene, PageSceneReq } from './types/scene';

export function pageScene(req: PageSceneReq) {
	return axios.get<PageSceneRes>('/user-center/admin/v1/scenes', { params: { ...req } });
}

export function addScene(data: Scene) {
	return axios.post('/user-center/admin/v1/scene', data);
}

export function updateScene(data: Scene) {
	return axios.put('/user-center/admin/v1/scene', data);
}

export function deleteScene(id: number) {
	return axios.delete('/user-center/admin/v1/scene', { params: { id } });
}

export default null;
