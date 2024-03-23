<template>
	<div class="fields">
		<div class="hr">
			<span class="icon"></span>
			<span>可用变量</span>
		</div>
		<div class="header">
			<a-space>
				<a-input :style="{ width: '180px' }" placeholder="请输入变量名称" allow-clear />
				<a-button type="primary" @click="search">
					<template #icon><icon-search /></template>
				</a-button>
			</a-space>
		</div>
		<a-radio-group v-model="variableType" type="button" :style="{ width: '100%', didplay: 'flex' }" @change="search">
			<a-radio class="tag-item" value="business">业务变量</a-radio>
			<a-radio class="tag-item" value="resource">资源变量</a-radio>
		</a-radio-group>

		<div class="field-list">
			<template v-if="variableType == 'business'">
				<div v-for="(item, index) in businessList" :key="index" class="item">
					<div class="item-row">
						<span class="label">字段</span>
						<a-tag v-copy="variableValue(item.keyword)" size="small" color="arcoblue">
							<span style="margin-right: 5px">{{ item.keyword }}</span>
							<icon-copy />
						</a-tag>
					</div>
					<div class="item-row">
						<span class="label">说明</span>
						<span class="value">{{ item.description }}</span>
					</div>
				</div>
			</template>
			<template v-else>
				<div v-for="(item, index) in resourceList" :key="index" class="item">
					<div class="item-row">
						<span class="label">字段</span>
						<span class="keyword">{{ item.keyword }}</span>
					</div>
					<div class="item-row">
						<span class="label">说明</span>
						<span class="value">{{ item.description }}</span>
					</div>
					<a-divider></a-divider>
					<div v-for="field in item.fields.split(',')" :key="field" class="item-left">
						<a-tag v-copy="variableValue(item.keyword + '.' + field)" size="small" color="arcoblue">
							<span style="margin-right: 5px">{{ item.keyword + '.' + field }}</span>
							<icon-copy />
						</a-tag>
					</div>
				</div>
			</template>
		</div>
		<a-pagination size="small" :total="total" :current="query.page" :page-size="query.page_size" show-total @change="pageChange" />
	</div>
</template>

<script lang="ts" setup>
import { pageBusiness } from '@/api/configure/business';
import { pageResource } from '@/api/configure/resource';
import { Business } from '@/api/configure/types/business';
import { Resource } from '@/api/configure/types/resource';
import Message from '@arco-design/web-vue/es/message';
import { watch, ref } from 'vue';

const props = defineProps({
	serverId: {
		type: Number,
		default: 0
	}
});

const variableType = ref('business');
const total = ref(0);
const resourceList = ref<Resource[]>([]);
const businessList = ref<Business[]>([]);
const query = ref({ page: 1, page_size: 10, keyword: '' });

const variableValue = (val: string) => {
	return `\${${val}}`;
};

const handleGetResource = async () => {
	const { data } = await pageResource({
		...query.value,
		server_id: props.serverId
	});
	resourceList.value = data.list;
	total.value = data.total;
};

const handleGetBusiness = async () => {
	const { data } = await pageBusiness({
		...query.value,
		server_id: props.serverId
	});
	businessList.value = data.list;
	total.value = data.total;
};

const getData = () => {
	if (!props.serverId) {
		Message.error('请先选择服务');
		return;
	}
	if (variableType.value === 'business') {
		handleGetBusiness();
	} else {
		handleGetResource();
	}
};

const pageChange = (current: number) => {
	query.value.page = current;
	getData();
};

const search = () => {
	query.value.page = 1;
	query.value.page_size = 10;
	total.value = 0;
	getData();
};

watch(
	() => props.serverId,
	(val) => {
		if (val) handleGetBusiness();
	}
);
</script>

<style lang="less" scoped>
.fields {
	.hr {
		display: flex;
		align-items: center;
		color: var(--color-text-2);
		font-weight: 700;
		font-size: 14px;

		.icon {
			display: block;
			width: 5px;
			height: 16px;
			margin-right: 10px;
			background-color: rbga(--arcoblue);
			border-radius: 4px;
		}
	}

	.tag-item {
		width: 50%;
		text-align: center;
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 0;
		font-size: 14px;
	}

	.field-list {
		height: calc(100% - 140px);
		margin-top: 10px;
		overflow: hidden scroll;

		&::-webkit-scrollbar {
			display: none;
		}

		.item {
			width: 100%;
			margin-bottom: 15px;
			padding: 10px 8px;
			font-size: 13px;
			border: 1px solid var(--color-border-1);
			border-radius: 4px;

			.copy {
				margin-left: 10px;
				cursor: pointer;
			}

			.item-left {
				margin-bottom: 5px;
				font-size: 13px;
				text-align: left;
			}

			.item-row {
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 10px;

				.label {
					display: block;
					width: 30px;
					min-width: 30px;
					color: var(--color-text-1);
					font-size: 12px;
					white-space: nowrap;
				}

				.keyword {
					color: rgb(var(--arcoblue-6));
				}

				.value {
					color: var(--color-text-3);
					font-size: 12px;
				}
			}
		}
	}
}
</style>
