import axios from 'axios';
import {
	Template,
	CreateTemplateRequest,
	ParseTemplateRequest,
	ParseTemplateReply,
	SwitchTemplateRequest,
	CompareTemplateRequest,
	CompareTemplateReply,
	ListTemplateRequest,
	ListTemplateReply
} from './type';

export function CurrentTemplate(id: number) {
	return axios.get<Template>('/configure/api/v1/template/current', {
		params: { serverId: id }
	});
}

export function SwitchTemplate(data: SwitchTemplateRequest) {
	return axios.post<Template>('/configure/api/v1/template/switch', data);
}

export function CreateTemplate(req: CreateTemplateRequest) {
	return axios.post('/configure/api/v1/template', req);
}

export function ParseTemplate(req: ParseTemplateRequest) {
	return axios.post<ParseTemplateReply>(`/configure/api/v1/template/preview`, req);
}

export function GetTemplate(id: number) {
	return axios.get<Template>('/configure/api/v1/template', {
		params: { id }
	});
}

export function ListTemplate(req: ListTemplateRequest) {
	return axios.get<ListTemplateReply>('/configure/api/v1/templates', {
		params: { ...req }
	});
}

export function CompareTemplate(req: CompareTemplateRequest) {
	return axios.post<CompareTemplateReply>('/configure/api/v1/template/compare', req);
}

export default null;
