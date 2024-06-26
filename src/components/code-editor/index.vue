<template>
	<div ref="editor" class="editor" :style="style">
		<div v-if="switchLang" class="tool">
			<a-select v-model="innerLang" placeholder="语言" :style="{ width: '90px' }" size="small" @change="changeLang">
				<a-option value="json">JSON</a-option>
				<a-option value="yaml">YAML</a-option>
			</a-select>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { onMounted, Ref, ref, toRaw, watch } from 'vue';
import * as monaco from 'monaco-editor';
import jsonYaml from 'js-yaml';
import { useAppStore } from '@/store';
import customTheme from './theme';

customTheme();
const appStore = useAppStore();

const emit = defineEmits(['update:modelValue', 'change', 'changeLang']);
const props = defineProps({
	lang: {
		type: String,
		default: 'json'
	},
	modelValue: {
		type: String
	},
	value: {
		type: String
	},
	style: {
		type: Object
	},
	showLine: {
		type: Boolean,
		default: true
	},
	showFolding: {
		type: Boolean,
		default: true
	},
	theme: {
		type: String
	},
	readOnly: {
		type: Boolean,
		default: false
	},
	id: String,
	switchLang: Boolean
});
const content = ref();
const innerLang = ref(props.lang);
const editor: Ref<HTMLDivElement | undefined> = ref(undefined);
const monacoEditor: Ref<monaco.editor.IStandaloneCodeEditor | undefined> = ref(undefined);
const editTheme = ref(props.theme);
if (!editTheme.value) {
	editTheme.value = `vs-${appStore.theme}`;
}

if (props.value) {
	content.value = props.value as string;
}
if (props.modelValue) {
	content.value = props.modelValue as string;
}
if (props.lang === 'json') {
	try {
		content.value = JSON.stringify(JSON.parse(content.value), null, 4);
	} catch (e) {
		/* empty */
	}
}

const getVal = () => {
	if (monacoEditor.value) return toRaw(monacoEditor.value).getValue();
	return '';
};

const setVal = (value: string) => {
	if (monacoEditor.value) return toRaw(monacoEditor.value).setValue(value);
	return '';
};

const getModel = () => {
	if (monacoEditor.value) return toRaw(monacoEditor.value).getModel();
	return '';
};

// const handleValidate = (markers: any) => {
//   // 没有错误时，格式化文档
//   if (!Object.keys(markers).length) {
//     monacoEditor.value?.getAction('editor.action.formatDocument')?.run();
//   }
// };

const initEditor = () => {
	if (!editor.value) {
		return;
	}

	monacoEditor.value = monaco.editor.create(editor.value, {
		padding: { top: 10, bottom: 10 },
		fontSize: 13,
		lineNumbers: props.showLine ? 'on' : 'off',
		glyphMargin: false,
		selectOnLineNumbers: true,
		language: props.lang,
		value: content.value,
		acceptSuggestionOnCommitCharacter: true, // 接受关于提交字符的建议
		acceptSuggestionOnEnter: 'on', // 接受输入建议 "on" | "off" | "smart"
		accessibilityPageSize: 10, // 辅助功能页面大小 Number 说明：控制编辑器中可由屏幕阅读器读出的行数。警告：这对大于默认值的数字具有性能含义。
		accessibilitySupport: 'on', // 辅助功能支持 控制编辑器是否应在为屏幕阅读器优化的模式下运行。
		autoClosingBrackets: 'always', // 是否自动添加结束括号(包括中括号) "always" | "languageDefined" | "beforeWhitespace" | "never"
		autoClosingDelete: 'always', // 是否自动删除结束括号(包括中括号) "always" | "never" | "auto"
		autoClosingOvertype: 'always', // 是否关闭改写 即使用insert模式时是覆盖后面的文字还是不覆盖后面的文字 "always" | "never" | "auto"
		autoClosingQuotes: 'always', // 是否自动添加结束的单引号 双引号 "always" | "languageDefined" | "beforeWhitespace" | "never"
		autoIndent: 'keep', // 控制编辑器在用户键入、粘贴、移动或缩进行时是否应自动调整缩进
		automaticLayout: true, // 自动布局
		codeLens: false, // 是否显示codeLens 通过 CodeLens，你可以在专注于工作的同时了解代码所发生的情况 – 而无需离开编辑器。 可以查找代码引用、代码更改、关联的 Bug、工作项、代码评审和单元测试。
		codeLensFontFamily: '', // codeLens的字体样式
		codeLensFontSize: 14, // codeLens的字体大小
		colorDecorators: false, // 呈现内联色彩装饰器和颜色选择器
		comments: {
			ignoreEmptyLines: true, // 插入行注释时忽略空行。默认为真。
			insertSpace: true // 在行注释标记之后和块注释标记内插入一个空格。默认为真。
		}, // 注释配置
		contextmenu: true, // 启用上下文菜单
		columnSelection: false, // 启用列编辑 按下shift键位然后按↑↓键位可以实现列选择 然后实现列编辑
		autoSurround: 'never', // 是否应自动环绕选择
		copyWithSyntaxHighlighting: true, // 是否应将语法突出显示复制到剪贴板中 即 当你复制到word中是否保持文字高亮颜色
		cursorBlinking: 'solid', // 光标动画样式
		cursorSmoothCaretAnimation: 'on', // 是否启用光标平滑插入动画  当你在快速输入文字的时候 光标是直接平滑的移动还是直接"闪现"到当前文字所处位置
		cursorStyle: 'underline-thin', // "Block"|"BlockOutline"|"Line"|"LineThin"|"Underline"|"UnderlineThin" 光标样式
		cursorSurroundingLines: 0, // 光标环绕行数 当文字输入超过屏幕时 可以看见右侧滚动条中光标所处位置是在滚动条中间还是顶部还是底部 即光标环绕行数 环绕行数越大 光标在滚动条中位置越居中
		cursorSurroundingLinesStyle: 'all', // "default" | "all" 光标环绕样式
		cursorWidth: 2, // <=25 光标宽度
		minimap: {
			enabled: false // 是否启用预览图
		}, // 预览图设置
		folding: props.showFolding, // 是否启用代码折叠
		links: true, // 是否点击链接
		overviewRulerBorder: false, // 是否应围绕概览标尺绘制边框
		renderLineHighlight: 'gutter', // 当前行突出显示方式
		roundedSelection: false, // 选区是否有圆角
		scrollBeyondLastLine: false, // 设置编辑器是否可以滚动到最后一行之后
		readOnly: props.readOnly, // 是否为只读模式
		theme: editTheme.value // props.theme // vs, hc-black, or vs-dark
	});

	monacoEditor.value?.getAction('editor.action.formatDocument')?.run();

	let isformat = false;
	if (monacoEditor.value) {
		monacoEditor.value.onDidChangeModelContent(() => {
			content.value = getVal();
			emit('update:modelValue', content.value, props.id);
			emit('change', content.value, props.id);
			if (!isformat) {
				isformat = true;
				setTimeout(() => {
					isformat = false;
					monacoEditor.value?.getAction('editor.action.formatDocument')?.run();
				}, 2000);
			}
		});
	}
};

const setEditTheme = (val: string) => {
	const theme = `vs-${val}`;
	monaco.editor.setTheme(theme);
};

const setEditValue = (val: string) => {
	content.value = val;
	setVal(val);
	setTimeout(() => {
		monacoEditor.value?.getAction('editor.action.formatDocument')?.run();
	}, 100);
};

// json <-> yaml
const changeLang = () => {
	monaco.editor.setModelLanguage(getModel() as monaco.editor.ITextModel, innerLang.value);
	emit('changeLang', innerLang.value);
	if (!content.value) {
		return;
	}

	let newVal = '';
	if (innerLang.value === 'yaml') {
		try {
			newVal = jsonYaml.dump(JSON.parse(content.value));
		} catch (error) {
			newVal = content.value;
		}
	} else {
		newVal = JSON.stringify(jsonYaml.load(content.value));
	}
	setEditValue(newVal);
};

const setEditLang = (lang: string) => {
	if (innerLang.value === lang) {
		return;
	}
	innerLang.value = lang;
	changeLang();
};

defineExpose({ setEditValue, setEditLang });

watch(
	() => props.modelValue,
	(val) => {
		if (val === getVal()) {
			return;
		}
		if (!val) {
			val = '';
		}
		setEditValue(val as string);
	},
	{ deep: true }
);

watch(
	() => props.value,
	(val) => {
		if (val === getVal()) {
			return;
		}
		if (!val) {
			val = '';
		}
		setEditValue(val as string);
	},
	{ deep: true }
);

watch(
	() => props.lang,
	(val) => {
		setEditLang(val);
	},
	{ deep: true }
);

watch(
	() => appStore.theme,
	() => {
		setEditTheme(appStore.theme);
	},
	{ deep: true, immediate: true }
);

onMounted(() => {
	initEditor();
});
</script>

<style lang="less" scoped>
.editor {
	position: relative;

	.tool {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 99;
	}
}
</style>
