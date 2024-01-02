import {
	createCheckboxComponent,
	createDateComponent,
	// createDatetimeComponent,
	createInputComponent,
	createNumberComponent,
	createPasswordComponent,
	// createPcdComponent,
	createRadioComponent,
	createSelectComponent,
	createTextareaComponent,
	createTimeComponent,
	// createUploadComponent,
	defaultComponentRule
} from './data';
import { Component } from './types';

class Editor {
	// 校验规则
	public readonly rules = defaultComponentRule;

	// 可创建的组件
	public readonly components = [
		{
			title: '输入型组件',
			items: [
				{ type: 'input', name: '单行文本', creater: createInputComponent },
				{ type: 'textarea', name: '多行文本', creater: createTextareaComponent },
				{ type: 'number', name: '数字输入', creater: createNumberComponent },
				{ type: 'password', name: '密码输入', creater: createPasswordComponent }
			]
		},
		{
			title: '选择型组件',
			items: [
				{ type: 'radio', name: '单项选择', creater: createRadioComponent },
				{ type: 'checkbox', name: '多项选则', creater: createCheckboxComponent },
				{ type: 'select', name: '下拉选择', creater: createSelectComponent },
				// { type: 'pcd', name: '地区选择', creater: createPcdComponent },
				{ type: 'time', name: '时间选择', creater: createTimeComponent },
				{ type: 'date', name: '日期选择', creater: createDateComponent }
				// { type: 'datetime', name: '日期时间', creater: createDatetimeComponent }
			]
		}
		// {
		// 	title: '功能型组件',
		// 	items: [{ type: 'upload', name: '文件上传', icon: '', creater: createUploadComponent }]
		// }
	];

	// 查找指定元素
	static findIndex = (list: Component[], field: string) => {
		let ind = 0;

		list.forEach((item: Component, index: number) => {
			if (item.field === field) {
				ind = index;
			}
		});

		return ind;
	};

	// 表单上移
	static up = (list: Component[], field: string) => {
		const index = this.findIndex(list, field);
		const prev = list.splice(index, 1);
		list.splice(index - 1, 0, prev[0]);
	};

	// 表单下移
	static down = (list: Component[], field: string) => {
		const index = this.findIndex(list, field);
		const prev = list.splice(index, 1);
		list.splice(index + 1, 0, prev[0]);
	};

	// 表单删除
	static delete = (list: Component[], field: string) => {
		const index = this.findIndex(list, field);
		const prev = list.splice(index, 1);
		list.splice(index, 1);
		this.deleteRelation(list, prev[0].field);
	};

	// 表单关联删除
	static deleteRelation = (list: Component[], field: string) => {
		list.forEach((item: Component, index: number) => {
			if (item.relation && item.relation.field === field) {
				const prev = list.splice(index, 1);
				this.deleteRelation(list, prev[0].field);
			}
		});
	};
}

export default Editor;
