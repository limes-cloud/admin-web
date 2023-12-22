import { DirectiveBinding } from 'vue';
import { Message } from '@arco-design/web-vue';

function checkPermission(el: HTMLElement, binding: DirectiveBinding) {
	const { value } = binding;
	el.onclick = () => {
		if (value.length > 0) {
			// 动态创建 textarea 标签
			const textarea = document.createElement('textarea');
			// 将该 textarea 设为 readonly 防止 iOS 下自动唤起键盘，同时将 textarea 移出可视区域
			textarea.readOnly = true;
			textarea.style.position = 'absolute';
			textarea.style.left = '-9999px';
			// 将要 copy 的值赋给 textarea 标签的 value 属性
			textarea.value = value;
			// 将 textarea 插入到 body 中
			document.body.appendChild(textarea);
			// 选中值并复制
			textarea.select();
			const result = document.execCommand('Copy');
			if (result) {
				Message.success('复制成功');
			}
			document.body.removeChild(textarea);
		}
	};
}

export default {
	mounted(el: HTMLElement, binding: DirectiveBinding) {
		checkPermission(el, binding);
	},
	updated(el: HTMLElement, binding: DirectiveBinding) {
		checkPermission(el, binding);
	}
};
