export interface Menu {
	id?: number;
	parent_id: number;
	title: string;
	type: string;
	keyword: string;
	icon?: string;
	path: string;
	permission?: string;
	check_object: boolean;
	check_object_rule?: string;
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
