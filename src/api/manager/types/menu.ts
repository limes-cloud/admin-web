export interface Menu {
	id?: number;
	app: string;
	parent_id: number;
	title: string;
	type: string;
	keyword: string;
	icon?: string;
	path: string;
	permission?: string;
	component: string;
	redirect?: string;
	api: string;
	method: string;
	weight: number;
	is_hidden: boolean;
	is_cache: boolean;
	is_affix: boolean;
	is_home: boolean;
	created_at: number;
	updated_at: number;
	children?: Menu[];
}
