import { TableColumnData } from '@arco-design/web-vue/es/table/interface';

export type TableSize = 'mini' | 'small' | 'medium' | 'large';
export type TableColumn = TableColumnData & { checked?: true };

export interface AnyObject {
	[key: string]: unknown;
}

export interface Resource {
	name: string;
	type: string;
	size: number;
	sha: string;
	src: string;
}

export interface SimpleUser {
	id: number;
	username: string;
	nick_name: string;
	real_name: string;
	avatar: string;
	gender: string;
	resource: Resource;
}

export interface Options {
	value: unknown;
	label: string;
}

export interface NodeOptions extends Options {
	children?: NodeOptions[];
}

export interface GetParams {
	body: null;
	type: string;
	url: string;
}

export interface PostData {
	body: string;
	type: string;
	url: string;
}

export interface Pagination {
	page: number;
	pageSize: number;
}

export type TimeRanger = [string, string];

export interface GeneralChart {
	xAxis: string[];
	data: Array<{ name: string; value: number[] }>;
}
