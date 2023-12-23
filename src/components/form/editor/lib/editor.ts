import {
	createCheckboxComponent,
	createDateComponent,
	createDatetimeComponent,
	createInputComponent,
	createNumberComponent,
	createPasswordComponent,
	createPcdComponent,
	createRadioComponent,
	createSelectComponent,
	createTextareaComponent,
	createTimeComponent,
	createUploadComponent,
	defaultComponentRule
} from './data';

class Editor {
	// 校验规则
	public readonly rules = defaultComponentRule;

	// 可创建的组件
	public readonly components = [
		{
			title: '输入型组件',
			items: [
				{ type: 'input', name: '单行文本', icon: '', creater: createInputComponent },
				{ type: 'textarea', name: '多行文本', icon: '', creater: createTextareaComponent },
				{ type: 'number', name: '计数器', icon: '', creater: createNumberComponent },
				{ type: 'password', name: '密码输入', icon: '', creater: createPasswordComponent }
			]
		},
		{
			title: '选择型组件',
			items: [
				{ type: 'radio', name: '单项选择', icon: '', creater: createRadioComponent },
				{ type: 'checkbox', name: '多项选则', icon: '', creater: createCheckboxComponent },
				{ type: 'select', name: '下拉选择', icon: '', creater: createSelectComponent },
				{ type: 'pcd', name: '地区选择', icon: '', creater: createPcdComponent },
				{ type: 'time', name: '时间选择', icon: '', creater: createTimeComponent },
				{ type: 'date', name: '日期选择', icon: '', creater: createDateComponent },
				{ type: 'datetime', name: '日期时间', icon: '', creater: createDatetimeComponent }
			]
		},
		{
			title: '功能型组件',
			items: [{ type: 'upload', name: '文件上传', icon: '', creater: createUploadComponent }]
		}
	];
}
