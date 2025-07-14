<template>
	<div ref="chatRef" class="chat">
		<div v-if="background" class="chat-background">
			<img class="chat-background-img" :src="background" />
		</div>
		<div v-else class="chat-background"></div>
		<div v-if="!hideTitle" class="chat-header">{{ title }}</div>
		<div v-if="!msgList?.length" class="chat-welcome">
			<a-space direction="vertical" align="center">
				<a-avatar :image-url="system.logo" :size="90"></a-avatar>
				<div>{{ title }}</div>
				<div>{{ description }}</div>
			</a-space>
		</div>
		<div v-else class="chat-content">
			<template v-for="(item, index) in getMessage()" :key="index">
				<div v-if="item.role === 'system'" class="chat-content-system">
					<div class="chat-content-system-header">
						<a-avatar shape="square" :image-url="system.logo"></a-avatar>
					</div>
					<div class="chat-content-system-box">
						<div class="chat-content-system-box-nick">{{ system.name }}</div>
						<div class="chat-content-system-box-text">
							<div
								v-show="item.reason && item.reason?.length > 0"
								ref="contentRef"
								class="chat-content-system-box-text-reason-html"
								v-html="marked.parse(item.reason || '')"
							></div>
							<a-divider v-show="item.reason && item.reason?.length > 0" :size="2" style="border-bottom-style: dotted" />
							<div v-show="item.content.length > 0" ref="contentRef" class="chat-content-system-box-text-html" v-html="marked.parse(item.content)"></div>
							<img v-show="item.content.length == 0" class="chat-content-system-box-text-loading" :src="loadding" />

							<div v-if="showMessageTool" class="chat-content-system-box-text-tool">
								<a-space>
									<span>总tokens {{ item.tokens }}</span>
									<span>处理时长 {{ item.cost }}ms</span>
								</a-space>
							</div>
						</div>
						<div>
							<a-space>
								<a-button v-copy="item.content" size="mini" shape="circle">
									<icon-copy />
								</a-button>
								<a-button size="mini" shape="circle">
									<icon-refresh />
								</a-button>
							</a-space>
						</div>
					</div>
				</div>

				<div v-if="item.role === 'user'" class="chat-content-user">
					<div class="chat-content-user-box">
						<div class="chat-content-user-box-nick">{{ user.name }}</div>
						<div class="chat-content-user-box-text">{{ item.content }}</div>
					</div>
					<div class="chat-content-user-header">
						<a-avatar shape="square" :image-url="user.logo"></a-avatar>
					</div>
				</div>
			</template>
		</div>
		<div v-if="!hideFooter" class="chat-footer">
			<div class="chat-footer-refresh">
				<a-button size="small" shape="circle" @click="clear">
					<icon-delete />
				</a-button>
			</div>
			<div class="chat-footer-input">
				<div class="chat-footer-input-box">
					<div class="chat-footer-input-box-textarea">
						<a-textarea
							v-model="form.input"
							:disabled="form.outputing || props.disableInput"
							class="chat-footer-input-box-textarea-ele"
							:auto-size="{
								minRows: 1,
								maxRows: 5
							}"
							:placeholder="disableInput ? disableText : '请输入'"
							@keydown="handleKeydown"
						></a-textarea>
					</div>
					<div class="chat-footer-input-box-btn">
						<a-button size="mini" type="primary" shape="circle">
							<icon-record-stop v-if="form.outputing" size="16" />
							<icon-send v-else size="16" />
						</a-button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import logo from '@/assets/logo.png';
import loadding from '@/assets/images/loading.gif';
import { Marked } from 'marked';
import 'highlight.js/styles/atom-one-dark.css';
import hljs from 'highlight.js';
import { markedHighlight } from 'marked-highlight';
import { Message } from '@arco-design/web-vue';

const chatRef = ref();
// const render = new marked.Renderer();
// marked.setOptions({
// 	renderer: render, // 这是必填项
// 	gfm: true, // 启动类似于Github样式的Markdown语法
// 	pedantic: false // 只解析符合Markdwon定义的，不修正Markdown的错误
// });
const addCopyButtons = () => {
	const blocks = chatRef.value?.querySelectorAll('pre');
	if (!blocks) return;
	blocks.forEach((block) => {
		const button = document.createElement('span');
		// button.textContent = '复制';
		button.classList.add('copy-button');
		block.appendChild(button);
		button.addEventListener('click', () => {
			const text = block.textContent || '';
			navigator.clipboard
				.writeText(text)
				.then(() => {
					Message.success('复制成功！');
				})
				.catch((err) => {
					Message.error(`复制失败！${err}`);
				});
		});
	});
};
onMounted(() => {
	addCopyButtons();
});

const marked = new Marked(
	markedHighlight({
		langPrefix: 'hljs language-',
		highlight(code, lang) {
			const language = hljs.getLanguage(lang) ? lang : 'shell';
			return hljs.highlight(code, { language }).value;
		}
	})
);

const emits = defineEmits(['send']);
const defaultTyping = { text: '', speed: 10, index: 0, msgIndex: 0, isStart: false };
const typing = ref<{
	text: string;
	speed: number;
	index: number;
	typingTimer?: any;
	msgIndex: number;
	isStart: boolean;
}>({ ...defaultTyping });

const reasonTyping = ref<{
	text: string;
	speed: number;
	index: number;
	typingTimer?: any;
	msgIndex: number;
	isStart: boolean;
}>({ ...defaultTyping });

interface MessageType {
	role: 'system' | 'user';
	reason?: string;
	content: string;
	extra?: string;
	cost?: number;
	tokens?: number;
}

interface Info {
	logo: string;
	name: string;
}

const props = withDefaults(
	defineProps<{
		hideFooter?: boolean;
		hideTitle?: boolean;
		title?: string;
		description?: string;
		system?: Info;
		user?: Info;
		background?: string;
		messages: MessageType[];
		disableInput?: boolean;
		disableText?: string;
		showMessageTool?: boolean;
	}>(),
	{
		hideFooter: false,
		hideTitle: false,
		title: 'AI BOT',
		description: '立刻开始与AI BOT对话吧～',
		system: () => ({ logo, name: 'AI BOT' }),
		user: () => ({ logo, name: '体验用户' }),
		disableInput: false,
		showMessageTool: false
	}
);

const getLastHeight = () => {
	let lastHeight = 0;
	if (props.hideTitle) {
		lastHeight += 45;
	}
	if (props.hideFooter) {
		lastHeight += 45;
	}
	return `100% - ${lastHeight}px`;
};

const msgList = ref<MessageType[]>(props.messages || []);
const { messages } = toRefs(props);

watch(
	messages,
	(val) => {
		msgList.value = val;
	},
	{ immediate: true, deep: true }
);

const form = reactive<{
	input: string;
	outputing: boolean;
}>({
	input: '',
	outputing: false
});

const getMessage = () => {
	return [...msgList.value].reverse();
};

const send = async (input: string) => {
	if (form.outputing || input.trim() === '' || input.length < 1) return;
	typing.value = { ...defaultTyping };
	msgList.value.push({
		role: 'user',
		content: input
	});
	await emits('send', input);
	form.input = '';
};

// 打字效果的函数
const typeEffect = () => {
	typing.value.isStart = true;
	if (!form.outputing && typing.value.index >= typing.value.text?.length) {
		addCopyButtons();

		return;
	}
	if (typing.value.index < typing.value.text?.length) {
		// 添加下一个字符
		msgList.value[typing.value.msgIndex].content += typing.value.text.charAt(typing.value.index);
		// 移动到下一个字符
		typing.value.index += 1;
		// 设置延迟后继续打字
	}
	typing.value.typingTimer = setTimeout(typeEffect, typing.value.speed);
};

// 思考部分打字效果的函数
const reasonTypeEffect = () => {
	reasonTyping.value.isStart = true;
	if (!form.outputing && reasonTyping.value.index >= reasonTyping.value.text?.length) {
		addCopyButtons();

		return;
	}
	if (reasonTyping.value.index < reasonTyping.value.text?.length) {
		// 添加下一个字符
		msgList.value[reasonTyping.value.msgIndex].reason += reasonTyping.value.text.charAt(reasonTyping.value.index);
		// 移动到下一个字符
		reasonTyping.value.index += 1;
		// 设置延迟后继续打字
	}
	reasonTyping.value.typingTimer = setTimeout(reasonTypeEffect, reasonTyping.value.speed);
};

const reply = (type: string, msg: string) => {
	if (type !== 'message' && type !== 'reason') {
		return;
	}

	if (!form.outputing) {
		form.outputing = true;
		msgList.value.push({ role: 'system', content: '', reason: '' });
	}

	const index = msgList.value.length - 1;
	if (type === 'reason') {
		reasonTyping.value.msgIndex = index;
		reasonTyping.value.text += msg;
		if (!reasonTyping.value.isStart) {
			reasonTypeEffect();
		}
	} else {
		typing.value.msgIndex = index;
		typing.value.text += msg;
		if (!typing.value.isStart) {
			typeEffect();
		}
	}
};

// end 结束输出
const outputEnd = () => {
	form.outputing = false;
};

// clear 清除对话
const clear = () => {
	msgList.value.splice(0, msgList.value.length);
};

const handleKeydown = async (event: KeyboardEvent) => {
	if (event.key === 'Enter') {
		event.preventDefault();
		if (event.metaKey || event.ctrlKey) {
			const target = event.target as HTMLTextAreaElement;

			// 在文本中的当前光标位置插入换行符
			const start = target.selectionStart;
			const end = target.selectionEnd;
			const before = target.value.substring(0, start);
			const after = target.value.substring(end);

			// 更新文本内容并保持 v-model 的同步
			form.input = `${before}\n${after}`;
			// 将光标位置设置为换行符后的位置

			// 等待 DOM 更新完成
			await nextTick();

			// 将光标位置设置为换行符后的位置
			target.selectionStart = start + 1;
			target.selectionEnd = start + 1;
		} else {
			send(form.input);
		}
	}
};

defineExpose({ send, clear, outputEnd, reply });
</script>

<style lang="less">
.chat-content-system-box-text-html {
	> p {
		margin: 0 !important;
	}
}

pre {
	position: relative;

	.copy-button {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 9999;
		display: block;
		width: 30px;
		height: 20px;

		&::before {
			display: block;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 100%;
			height: 100%;
			color: var(--color-text-3);
			font-size: 12px;
			cursor: pointer;
			content: '复制';
		}
	}
}
</style>

<style lang="less" scoped>
.chat {
	position: relative;
	width: 100%;
	height: 100%;
	overflow: hidden;
	border-radius: 1px;

	&-background {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: var(--color-fill-3);

		&-img {
			width: 100%;
			height: 100%;
		}
	}

	&-header {
		position: sticky;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 42px;
		text-align: center;
		background: var(--color-bg-1);
	}

	&-welcome {
		position: sticky;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: calc(v-bind(getLastHeight()));
		padding: 20px;
	}

	&-content {
		position: sticky;
		display: flex;
		flex-direction: column-reverse;
		height: calc(v-bind(getLastHeight()));
		padding: 20px 20px 0;
		overflow: scroll;

		&::-webkit-scrollbar {
			display: none;
		}

		&-system,
		&-user {
			display: block;
			width: 100%;
			margin-bottom: 20px;

			&-header {
				display: inline-block;
				vertical-align: top;
			}

			&-box {
				display: inline-block;
				width: calc(100% - 50px);
				margin-left: 10px;
				vertical-align: top;

				&-nick {
					margin-bottom: 10px;
					color: var(--color-text-2);
					font-size: 12px;
				}

				&-text {
					display: inline-block;
					box-sizing: border-box;
					width: auto;
					max-width: 80%;
					padding: 6px 10px;
					overflow: hidden;
					color: var(--color-text-1);
					font-size: 14px;
					line-height: 22px;
					white-space: normal;
					word-wrap: break-word;
					overflow-wrap: break-word;
					background-color: var(--color-bg-1);
					border-radius: 0% 10px 10px;

					&-tool {
						margin-top: 10px;
						color: var(--color-text-2);
						font-size: 12px;
					}

					&-loading {
						width: 20px;
						height: 20px;
					}

					&-reason-html {
						color: #777;
					}
				}
			}
		}

		&-user {
			display: flex;
			justify-content: flex-end;
			width: 100%;
			margin-bottom: 20px;

			&-header {
				display: inline-block;
				vertical-align: top;
			}

			&-box {
				display: flex;
				flex-direction: column;
				align-items: end;
				justify-content: flex-end;
				margin-right: 10px;
				text-align: right;
				vertical-align: top;

				&-text {
					position: relative;
					text-align: left;
					border-radius: 10px 0 10px 10px;
				}
			}
		}
	}

	&-footer {
		position: sticky;
		display: flex;
		align-items: end;
		padding: 0 20px;

		&-input {
			position: relative;
			flex: 1;
			margin-left: 10px;

			&-box {
				position: absolute; /* textarea 使用绝对定位 */
				bottom: 0; /* 固定在容器底部 */
				display: flex;
				align-items: end;
				width: 100%;
				overflow: hidden;
				background: var(--color-bg-1);
				border-radius: 8px;

				&-textarea {
					display: flex;
					align-items: center;
					justify-content: center;
					width: calc(100% - 40px);

					&-ele {
						background: var(--color-bg-1);
						border: none;

						:hover {
							background: var(--color-bg-1);
						}
					}
				}

				&-btn {
					display: flex;
					align-items: center;
					justify-content: center;
					height: 34px;
				}
			}
		}

		&-refresh,
		&-send {
			display: flex;
			align-items: center;
			height: 34px;
		}
	}
}
</style>
