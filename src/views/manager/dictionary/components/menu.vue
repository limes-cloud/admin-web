<template>
	<Container v-slot="value" class="mt-15 mb-15 rm-menu-padding">
		<a-menu :style="{ width: '100%', height: value.height + 'px' }" breakpoint="sm" @menu-item-click="handleSelect">
			<a-menu-item v-for="item in data" :key="item.id">
				<div class="menu-item">
					<div class="text">{{ item.name }}({{ item.keyword }})</div>
					<div class="icon">
						<Operation :data="item" :list="operations">
							<icon-more-vertical />
						</Operation>
					</div>
				</div>
			</a-menu-item>
		</a-menu>
	</Container>
	<a-pagination size="mini" :total="total" :current="page.page" :page-size="page.pageSize" @change="pageChange" @page-size-change="pageSizeChange" />
</template>

<script lang="ts" setup>
import { DeleteDictionary } from '@/api/manager/dictionary/api';
import { Dictionary } from '@/api/manager/dictionary/type';
import { Pagination } from '@/types/global';
import { Message } from '@arco-design/web-vue';
import { watch, ref } from 'vue';

const emit = defineEmits(['refresh', 'update', 'add', 'value', 'pageChange']);
const props = defineProps<{
	data: Dictionary[];
	pagination: Pagination;
	total: number;
}>();

const page = ref<Pagination>({
	page: 1,
	pageSize: 10
});

const operations = [
	{
		icon: 'edit',
		text: '修改',
		color: 'arcoblue',
		permission: 'manager:channel:update',
		click: (record: Dictionary) => {
			emit('update', record);
		}
	},
	{
		icon: 'delete',
		popconfirm: true,
		text: '删除',
		color: 'red',
		permission: 'manager:channel:delete',
		click: async (record: Dictionary) => {
			await DeleteDictionary({ id: record.id });
			emit('refresh');
			Message.success('删除成功');
		}
	}
];

watch(
	() => props.pagination,
	(val) => {
		page.value = { ...val };
	},
	{ deep: true, immediate: true }
);

const pageChange = (current: number) => {
	page.value.page = current;
	emit('pageChange', page.value);
};

const pageSizeChange = (size: number) => {
	page.value.pageSize = size;
	emit('pageChange', page.value);
};

const handleDelete = async (id: number) => {
	await DeleteDictionary({ id });
	Message.success('删除成功');
	emit('refresh');
};

const handleSelect = (val: number) => {
	props.data.forEach((item) => {
		if (item.id === val) {
			emit('value', item);
		}
	});
};
</script>

<style lang="less" scoped>
.action {
	color: rgb(var(--primary-6));
}

.rm-menu-padding {
	:deep(.arco-menu-vertical .arco-menu-inner) {
		padding: 0;
	}
	:deep(.arco-icon) {
		margin-right: 0px;
	}
	.menu-item {
		display: flex;
		justify-content: space-between;
		.text {
			flex: 1;
			max-width: 130px;
			overflow: hidden;
		}
		.icon {
			cursor: pointer;
		}
	}
}
</style>
