<template>
	<div class="service">
		<div class="hr">
			<span class="icon"></span>
			<span class="title">服务信息</span>
		</div>
		<div class="item">
			<span class="label">所属服务</span>
			<div class="select-input">
				<a-select
					v-model="form.server_id"
					placeholder="请选择服务"
					:scrollbar="true"
					:options="servers"
					:field-names="{ value: 'id', label: 'fullName' }"
					@search="search"
					@change="change"
				></a-select>
			</div>
		</div>
		<div v-if="form.server_id">
			<div class="item">
				<span class="label">服务名称</span>
				<span class="value">{{ current?.name }}</span>
			</div>
			<div class="item">
				<span class="label">服务标志</span>
				<span class="value">{{ current?.keyword }}</span>
			</div>
		</div>
		<div v-if="form.server_id" class="hr" style="margin-top: 20px; margin-bottom: 10px">
			<span class="icon"></span>
			<span>配置信息</span>
		</div>
		<div v-if="template?.id">
			<div class="item">
				<span class="label">当前版本</span>
				<span class="value">{{ template?.version }}</span>
			</div>
			<div class="item">
				<span class="label">创建时间</span>
				<span class="value">{{ $formatTime(template?.created_at) }}</span>
			</div>
			<div class="item">
				<span class="label">版本描述</span>
				<span class="value">{{ template.description ? template.description : '暂无描述' }}</span>
			</div>
		</div>
		<div v-if="!template?.id || !form?.server_id" class="empty">
			<a-empty>
				<template #image>
					<icon-exclamation-circle-fill />
				</template>
				{{ form?.server_id ? '暂无配置数据' : '请先选择服务' }}
			</a-empty>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { pageServer } from '@/api/configure/server';
import { Server } from '@/api/configure/types/server';
import { Template } from '@/api/configure/types/template';
import { onMounted, ref } from 'vue';

defineProps<{
	template?: Template;
}>();
const emit = defineEmits(['select']);

const form = ref<{
	server_id?: number;
}>({});
const servers = ref<Server[]>([]);
const current = ref<Server>();

const search = async (val?: string) => {
	const { data } = await pageServer({ page: 1, page_size: 10, keyword: val });
	const { list } = data;
	if (!list) {
		return;
	}

	// 初始化
	const searchd: Server[] = [];
	list.forEach((item) => {
		if (form.value.server_id !== item.id) {
			item.fullName = `${item.name}(${item.keyword})`;
			searchd.push(item);
		}
	});

	const selectd: Server[] = [];
	servers.value.forEach((item) => {
		if (item.id === form.value.server_id) {
			selectd.push(item);
		}
	});

	servers.value = searchd.concat(selectd);
};

const change = (val: any) => {
	servers.value.forEach((item) => {
		if (item.id === val) {
			current.value = item;
		}
	});
	emit('select', val);
};

onMounted(() => {
	search();
});
</script>

<style scoped lang="less">
.service {
	.select-input {
		width: 150px;
		max-width: 150px;
	}

	.empty {
		position: absolute;
		top: 150px;
		left: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 300px;
	}

	.hr {
		display: flex;
		align-items: center;
		color: #666;
		font-weight: 700;
		font-size: 14px;

		.icon {
			display: block;
			width: 5px;
			height: 16px;
			margin-right: 10px;
			background-color: #409eff;
			border-radius: 4px;
		}
	}

	.item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 0;
		font-size: 13px;

		.label {
			width: 55px;
			min-width: 55px;
			margin-right: 10px;
			color: #666;
			font-weight: 700;
			white-space: nowrap;
		}

		.value {
			color: #777;
		}
	}

	.btn {
		margin-top: 15px;
		text-align: center;

		.el-button--primary {
			width: 100% !important;
		}
	}
}
</style>
