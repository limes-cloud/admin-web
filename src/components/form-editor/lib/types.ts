export interface ComponentRule {
	label: string; // 规则名称
	value: string; // 规则值
}

export interface ComponentRelation {
	field: string; // 关联字段
	condition: string; // 关联条件
	value: string; // 关联值
}

export interface ComponentConfig {
	label: string; // 字段标签
	require: boolean; // 是否必填
	disabled: boolean; // 是否禁用
	max_length?: number; // 最大长度
	value: any; // 默认值
	placeholder: string; // 提示词
	rule?: ComponentRule; // 校验规则
	min?: number; // 最小值
	max?: number; // 最大值
	step?: number; // 步数
	filetype?: string; // 上传文件类型
	options: string[]; // 选项
}

export interface Component {
	show: boolean; // 是否展示
	type: string; // 组件类型
	config: ComponentConfig; // 组件配置
	field: string; // 字段名称
	relation?: ComponentRelation; // 关联展示
}

type Creater = () => Component;

export interface ComponentDesc {
	type: string; // 组件类型
	name: string; // 组件名称
	creater: Creater; // 字段名称
}
