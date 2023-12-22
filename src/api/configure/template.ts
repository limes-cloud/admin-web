import axios from 'axios';
import { Template, addTemplateReq, parseTemplateTestReq, parseTemplateTestRes } from './types/template';

export function currentTemplate(id: number) {
	return axios.get<Template>('/configure/v1/template/current', {
		params: { server_id: id }
	});
}

export function addTemplate(req: addTemplateReq) {
	return axios.post('/configure/v1/template', req);
}

export function parseTemplateTest(req: parseTemplateTestReq) {
	return axios.post<parseTemplateTestRes>(`/configure/v1/template/preview/${req.env_keyword}`, req);
}

export default null;
