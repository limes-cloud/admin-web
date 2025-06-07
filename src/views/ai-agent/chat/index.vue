<template>
	<div class="container">
		<div class="left">
			<a-space direction="vertical" :style="{ width: '100%', padding: '20px' }">
				<a-button long class="chat-btn" :disabled="disableInput" @click="handleCreateNewChat">
					<template #icon>
						<icon-plus />
					</template>
					新建会话
				</a-button>
				<a-input-search v-model="searchForm.title" style="width: 100%" placeholder="搜索历史记录" allow-clear @search="handleGetChats" />
			</a-space>
			<div ref="listRef" class="list">
				<a-list
					class="list-ele"
					:scrollbar="{
						type: 'embed',
						outerClass: 'scrollbar',
						outerStyle: ''
					}"
					:max-height="listHeight"
					:loading="loading"
					:hoverable="true"
					:bordered="false"
					size="small"
					@reach-bottom="loadNextChat"
				>
					<a-list-item
						v-for="(item, index) in chatList"
						:key="index"
						class="list-item"
						:style="{ width: '100%', padding: '3px 20px', background: chatId == item.id ? 'var(--color-fill-2)' : '' }"
						@click="handleChoseChat(item)"
					>
						<a-list-item-meta>
							<template #title>
								<div class="list-title line-1">{{ item.title }}</div>
							</template>
							<template #description>
								<div class="list-description">{{ $formatTime(item.createdAt) }}</div>
							</template>
						</a-list-item-meta>
						<template #actions>
							<icon-delete @click.stop="handleDeleteChat(item.id)" />
						</template>
					</a-list-item>
				</a-list>
			</div>
		</div>
		<div class="chat">
			<Chat
				ref="chatRef"
				title="这是一个房间标题"
				:disable-input="disableInput"
				disable-text="请先选择对话参数"
				:hide-title="true"
				@send="handleSend"
			></Chat>
		</div>
		<div class="right">
			<a-form :model="form" label-align="left" layout="vertical">
				<a-form-item
					field="modelId"
					label="会话模型"
					:rules="[
						{
							required: true,
							message: '会话模型是必填项'
						}
					]"
					:validate-trigger="['change', 'input']"
				>
					<a-select
						v-model="form.modelId"
						placeholder="请选择会话模型"
						:scrollbar="true"
						:options="models"
						@search="modelSearch.Search"
						@dropdown-reach-bottom="modelSearch.NextSearch"
					/>
				</a-form-item>

				<a-form-item field="thinkModelId" label="思考模型">
					<a-select
						v-model="form.thinkModelId"
						placeholder="请选择思考模型"
						:scrollbar="true"
						:options="models"
						@search="modelSearch.Search"
						@dropdown-reach-bottom="modelSearch.NextSearch"
					/>
				</a-form-item>

				<a-form-item field="prompt" label="提示词">
					<a-textarea v-model="form.prompt" allow-clear placeholder="请输入提示词" />
				</a-form-item>

				<a-form-item field="knowledges" label="知识库">
					<a-select
						v-model="form.knowledges"
						placeholder="请选择知识库"
						multiple
						:scrollbar="true"
						:options="kns"
						@search="knSearch.Search"
						@dropdown-reach-bottom="knSearch.NextSearch"
					/>
				</a-form-item>

				<a-form-item field="tools" label="挂载工具">
					<a-select
						v-model="form.tools"
						placeholder="请选择挂载工具"
						multiple
						:scrollbar="true"
						:options="tools"
						@search="toolSearch.Search"
						@dropdown-reach-bottom="toolSearch.NextSearch"
					/>
				</a-form-item>

				<a-form-item
					field="temperature"
					label="温度"
					tooltip="temperature：较高的数值会使输出更加随机，而较低的数值会使其更加集中和确定。建议该参数和top_p只设置1个。"
				>
					<a-slider v-model="form.temperature" :step="0.1" :min="0" :max="1" :show-ticks="true" :style="{ width: '90%' }" />
				</a-form-item>

				<a-form-item
					field="topP"
					label="多样性"
					layout=""
					tooltip="top_p：影响输出文本的多样性，取值越大，生成文本的多样性越强。建议该参数和temperature只设置1个。"
				>
					<a-slider v-model="form.topP" :step="0.1" :min="0" :max="1" :show-ticks="true" :style="{ width: '90%' }" />
				</a-form-item>

				<a-form-item
					field="penaltyScore"
					label="重复惩罚"
					tooltip="penalty_score：用通过对已生成的token增加惩罚，减少重复生成的现象。说明：值越大表示惩罚越大。"
				>
					<a-slider v-model="form.penaltyScore" :step="0.1" :min="1.0" :max="2.0" :show-ticks="true" :style="{ width: '90%' }" />
				</a-form-item>
				<a-form-item
					field="topK"
					label="采样"
					tooltip="Top-K 采样参数，在每轮token生成时，保留k个概率最高的token作为候选。影响输出文本的多样性，取值越大，生成文本的多样性越强"
				>
					<a-input-number v-model="form.topK" :step="1" :min="1" :max="9999" allow-clear />
				</a-form-item>
			</a-form>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import Chat from '@/components/chat/index.vue';
import { Result, Search } from '@/utils/search';
import { ListModel } from '@/api/ai-agent/model/api';
import { ListKnowledge } from '@/api/ai-agent/knowledge/api';
import { ListTool } from '@/api/ai-agent/tool/api';
import { ConversationSysChatReply, CreateSysChatRequest, ListSysChatRequest, SysChat, UpdateSysChatRequest } from '@/api/ai-agent/sys_chat/type';
import { ConversationSysChat, CreateSysChat, DeleteSysChat, ListSysChat } from '@/api/ai-agent/sys_chat/api';

const listRef = ref();
const chatRef = ref();

const models = ref<Result[]>([]);
const kns = ref<Result[]>([]);
const tools = ref<Result[]>([]);

type Type = CreateSysChatRequest | UpdateSysChatRequest;
const form = ref<Type>({} as Type);
const searchForm = ref<ListSysChatRequest>({ page: 1, pageSize: 20 });
const chatId = ref(0);
const disableInput = ref(true);
const chatList = ref<SysChat[]>([]);
const listHeight = ref(0);
const loading = ref(false);
const hasNextChat = ref(true);

watch(
	() => form.value,
	(val) => {
		if (val.modelId) {
			disableInput.value = false;
		}
	},
	{ deep: true, immediate: true }
);

watch(
	() => listRef.value,
	(val) => {
		if (val) {
			listHeight.value = val.offsetHeight;
		}
	},
	{ deep: true, immediate: true }
);

const handleCreateNewChat = async () => {
	form.value = {} as Type;
	chatId.value = 0;
	chatRef.value.clear();
	disableInput.value = true;
};

const handleGetChats = async () => {
	const { data } = await ListSysChat(searchForm.value);
	if (chatId.value === 0) {
		chatId.value = data.list[0].id;
		form.value = { ...data.list[0] };
	}
	if (data.list.length < searchForm.value.pageSize) {
		hasNextChat.value = false;
	}
	chatList.value = chatList.value.concat(data.list);
};

handleGetChats();

const loadNextChat = () => {
	if (!hasNextChat.value) {
		return;
	}
	loading.value = true;
	searchForm.value.page += 1;
	handleGetChats().finally(() => {
		loading.value = false;
	});
};

const handleChoseChat = (chat: SysChat) => {
	chatId.value = chat.id;
	form.value = { ...chat };
};

const handleSend = async (input: string) => {
	if (!chatId.value) {
		form.value.title = input;
		const { data } = await CreateSysChat(form.value as CreateSysChatRequest);
		chatId.value = data.id;
		handleGetChats();
	}

	chatRef.value.reply('');

	// 调用聊天模型接口
	ConversationSysChat(
		{ chatId: chatId.value, content: input },
		{
			handler: (res: ConversationSysChatReply) => {
				console.log(res.content);
				chatRef.value.reply(res.content);
			},
			done: () => {
				console.log('doen');
				chatRef.value.outputEnd();
			},
			error: (err: any) => {
				console.log(err);
				chatRef.value.error(err);
			}
		}
	);
};

const handleDeleteChat = async (id: number) => {
	await DeleteSysChat({ id });
	chatList.value = chatList.value.filter((item) => item.id !== id);
	if (chatId.value === id) {
		handleCreateNewChat();
	}
};

const modelSearch = new Search(
	models.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListModel({ ...req, type: 'chat', title: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.title, value: item.id });
		});
		return res;
	},
	(val: any): boolean => {
		return form.value.modelId === val;
	}
);

const knSearch = new Search(
	kns.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListKnowledge({ ...req, title: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.title, value: item.id });
		});
		return res;
	},
	(val: any): boolean => {
		return Boolean(form.value.knowledges?.includes(val));
	}
);

const toolSearch = new Search(
	tools.value,
	async (req): Promise<Result[]> => {
		const res: Result[] = [];
		const { data } = await ListTool({ ...req, title: req.query as string | undefined });
		data.list.forEach((item) => {
			res.push({ label: item.title, value: item.id });
		});
		return res;
	},
	(val: any): boolean => {
		return Boolean(form.value.tools?.includes(val));
	}
);

onMounted(() => {
	modelSearch.Search();
	knSearch.Search();
	toolSearch.Search();
});
</script>

<style scoped lang="less">
.container {
	display: flex;
	justify-content: center;
	height: calc(100vh - 120px);
	padding: 10px 0;
}

.left,
.right {
	flex: 0 0 220px;
	width: 220px;
	height: 100%;
	min-height: 100%;
	margin: 0 10px;
	padding: 20px;
	overflow: scroll;
	background: var(--color-bg-1);
	border: 1px solid var(--color-border-2);

	.chat-btn {
		border: 1px solid var(--color-border-2);
	}

	&::-webkit-scrollbar {
		display: none;
	}
}

.left {
	padding: 0;
	overflow: hidden;
}

.none-scrollbar {
	&::-webkit-scrollbar {
		display: none !important;
	}
}

.list {
	height: calc(100% - 115px);
	overflow: hidden;

	.list-title {
		width: 170px !important;
		color: var(--color-text-2);
		font-size: 13px;
	}

	.list-description {
		color: var(--color-text-3);
		font-size: 12px;
	}

	&::-webkit-scrollbar {
		display: none;
	}
}

.chat {
	flex: 1;
	height: calc(100vh - 120px);
	height: 100%;
	box-shadow: 0 0 10px rgb(0 0 0 / 10%);
}
</style>
