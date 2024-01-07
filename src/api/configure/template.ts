import axios from 'axios';
import {
	Template,
	AddTemplateReq,
	ParseTemplateReq,
	ParseTemplateRes,
	PageTemplateReq,
	PageTemplateRes,
	SwitchTemplateReq,
	CompareTemplateReq,
	CompareTemplateInfo
} from './types/template';

export function currentTemplate(id: number) {
	return axios.get<Template>('/configure/v1/template/current', {
		params: { server_id: id }
	});
}

export function switchTemplate(data: SwitchTemplateReq) {
	return axios.post<Template>('/configure/v1/template/switch', data);
}

export function addTemplate(req: AddTemplateReq) {
	return axios.post('/configure/v1/template', req);
}

export function parseTemplate(req: ParseTemplateReq) {
	return axios.post<ParseTemplateRes>(`/configure/v1/template/preview/${req.env_keyword}`, req);
}

export function pageTemplate(req: PageTemplateReq) {
	return axios.get<PageTemplateRes>('/configure/v1/templates', {
		params: { ...req }
	});
}

export function compareTemplate(req: CompareTemplateReq) {
	return axios.post<CompareTemplateInfo[]>('/configure/v1/template/compare', req);
}

export default null;
