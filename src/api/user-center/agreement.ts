import axios from 'axios';
import { PageContentRes, Content, PageContentReq, PageSceneReq, PageSceneRes, Scene } from './types/agreement';

export function getContent(id: number) {
	return axios.get<Content>('/user-center/v1/agreement/content', { params: { id } });
}

export function pageContent(req: PageContentReq) {
	return axios.get<PageContentRes>('/user-center/v1/agreement/contents', { params: { ...req } });
}

export function addContent(data: Content) {
	return axios.post('/user-center/v1/agreement/content', data);
}

export function updateContent(data: Content) {
	return axios.put('/user-center/v1/agreement/content', data);
}

export function deleteContent(id: number) {
	return axios.delete('/user-center/v1/agreement/content', { params: { id } });
}

export function pageScene(req: PageSceneReq) {
	return axios.get<PageSceneRes>('/user-center/v1/agreement/scenes', { params: { ...req } });
}

export function addScene(data: Scene) {
	return axios.post('/user-center/v1/agreement/scene', data);
}

export function updateScene(data: Scene) {
	return axios.put('/user-center/v1/agreement/scene', data);
}

export function deleteScene(id: number) {
	return axios.delete('/user-center/v1/agreement/scene', { params: { id } });
}

export default null;
