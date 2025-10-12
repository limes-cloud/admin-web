const scopes = [
	{ label: '所有部门', value: 'ALL' },
	{ label: '当前部门', value: 'CUR' },
	{ label: '当前及下级部门', value: 'CUR_DOWN' },
	{ label: '下级部门', value: 'DOWN' },
	{ label: '指定部门', value: 'CUSTOM' },
	{ label: '仅自己', value: 'SELF' },
	{ label: '无部门限制', value: 'NONE' }
];

const actions = [
	{ label: '创建', value: 'create' },
	{ label: '读取', value: 'read' },
	{ label: '修改', value: 'update' },
	{ label: '删除', value: 'delete' }
];
export { scopes, actions };
