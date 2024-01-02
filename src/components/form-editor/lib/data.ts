import { Guid } from 'guid-typescript';
import { Component, ComponentRule } from './types';

const uuid = (): string => {
	let ustr = Guid.create().toString();
	ustr = ustr.replace('-', '');
	return ustr.substring(0, 8);
};

export const defaultComponentRule: ComponentRule[] = [
	{ label: '无', value: '' },
	{ label: '字符', value: 'string' },
	{ label: '数字', value: 'number' },
	{ label: '整数', value: 'integer' },
	{ label: '浮点数', value: 'float' },
	{ label: '日期', value: 'date' },
	{ label: '链接', value: 'url' },
	{ label: '邮箱', value: 'email' },
	{ label: '手机号', value: 'mobile' },
	{ label: '身份证号', value: 'idcard' }
];

// inputComponent 单行文本输入
export const createInputComponent = (): Component => {
	return {
		show: true,
		type: 'input',
		field: uuid(),
		config: {
			label: '标题',
			require: true,
			disabled: false,
			max_length: 30,
			value: '',
			placeholder: '请输入',
			rule: undefined,
			options: []
		}
	};
};

// textareaComponent 多行文本输入
export const createTextareaComponent = (): Component => {
	return {
		show: true,
		type: 'textarea',
		field: uuid(),
		config: {
			label: '标题',
			require: true,
			disabled: false,
			max_length: 150,
			value: '',
			placeholder: '请输入',
			options: []
		}
	};
};

// numberComponent 数字输入
export const createNumberComponent = (): Component => {
	return {
		show: true,
		type: 'number',
		field: uuid(),
		config: {
			label: '标题',
			require: true,
			disabled: false,
			value: 0,
			placeholder: '请输入',
			min: 0,
			max: 100,
			step: 1,
			options: []
		}
	};
};

// passwordComponent 密码输入
export const createPasswordComponent = (): Component => {
	return {
		show: true,
		type: 'password',
		field: uuid(),
		config: {
			label: '标题',
			require: true,
			disabled: false,
			value: 0,
			placeholder: '请输入',
			max_length: 30,
			options: []
		}
	};
};

// radioComponent 单选器
export const createRadioComponent = (): Component => {
	return {
		show: true,
		type: 'radio',
		field: uuid(),
		config: {
			label: '标题',
			require: true,
			disabled: false,
			value: undefined,
			placeholder: '请输入',
			max_length: 30,
			options: ['选择一', '选择二']
		}
	};
};

// checkboxComponent 多选器
export const createCheckboxComponent = (): Component => {
	return {
		show: true,
		type: 'checkbox',
		field: uuid(),
		config: {
			label: '标题',
			require: true,
			disabled: false,
			value: [],
			placeholder: '请输入',
			max_length: 30,
			options: ['选择一', '选择二']
		}
	};
};
// selectComponent 下拉选择器
export const createSelectComponent = (): Component => {
	return {
		show: true,
		type: 'select',
		field: uuid(),
		config: {
			label: '标题',
			require: true,
			disabled: false,
			value: [],
			placeholder: '请输入',
			max_length: 30,
			options: ['选择一', '选择二']
		}
	};
};

// pcdComponent 省市区选择器
export const createPcdComponent = (): Component => {
	return {
		show: true,
		type: 'pcd',
		field: uuid(),
		config: {
			label: '标题',
			require: true,
			disabled: false,
			value: [],
			placeholder: '请输入',
			max_length: 30,
			options: []
		}
	};
};
// timeComponent 时间选择器
export const createTimeComponent = (): Component => {
	return {
		show: true,
		type: 'time',
		field: uuid(),
		config: {
			label: '标题',
			require: true,
			disabled: false,
			value: '',
			placeholder: '请选择',
			options: []
		}
	};
};
// dateComponent 日期选择器
export const createDateComponent = (): Component => {
	return {
		show: true,
		type: 'date',
		field: uuid(),
		config: {
			label: '标题',
			require: true,
			disabled: false,
			value: '',
			placeholder: '请选择',
			options: []
		}
	};
};
// datetimeComponent 日期时间选择器
export const createDatetimeComponent = (): Component => {
	return {
		show: true,
		type: 'datetime',
		field: uuid(),
		config: {
			label: '标题',
			require: true,
			disabled: false,
			value: '',
			placeholder: '请选择',
			options: []
		}
	};
};
// uploadComponent 日期时间选择器
export const createUploadComponent = (): Component => {
	return {
		show: true,
		type: 'upload',
		field: uuid(),
		config: {
			label: '文件上传',
			filetype: 'image',
			require: true,
			disabled: false,
			value: '',
			placeholder: '请选择',
			options: []
		}
	};
};

export default null;
