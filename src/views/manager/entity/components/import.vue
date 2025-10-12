<template>
	<Popup
		v-model:visible="visible"
		title="实体导入"
		width="680px"
		:body-style="{ height: '550px', padding: '15px', background: '#f2f2f2' }"
		@cancel="visible = false"
		@before-ok="handleSubmit"
	>
		<div class="body">
			<div class="body">
				<div class="item">
					<a-menu class="rm-menu-padding" breakpoint="sm" @menu-item-click="handleSelect">
						<a-menu-item v-for="(item, index) in list" :key="index">
							<div class="menu-item">
								<div class="text">{{ item.name }}({{ item.comment }})</div>
								<div class="icon">
									<a-popconfirm content="'您确认要删除此实体吗？" type="warning" @ok="handleDeleteEntity(index)">
										<icon-delete />
									</a-popconfirm>
								</div>
							</div>
							<template #icon><icon-nav /></template>
						</a-menu-item>
					</a-menu>
				</div>
			</div>
			<div class="body flex-1">
				<div class="item">
					<a-table
						v-if="list.length != 0"
						v-permission="'manager:entity:field:query'"
						row-key="id"
						:columns="columns"
						:data="list[currentIndex].fields"
						:bordered="false"
						:pagination="false"
					>
						<template #name="{ record }">
							<a-input v-model="record.name" />
						</template>
						<template #comment="{ record }">
							<a-input v-model="record.comment" />
						</template>

						<template #operations="{ rowIndex }">
							<a-tag color="orangered" @click="handleDelete(rowIndex)">删除</a-tag>
						</template>
					</a-table>
				</div>
			</div>
		</div>
	</Popup>
</template>

<script lang="ts" setup>
import { DeleteEntity, ImportEntity } from '@/api/manager/entity/api';
import { Entity } from '@/api/manager/entity/type';
import { Message, TableColumn } from '@arco-design/web-vue';
import { ref } from 'vue';

const emit = defineEmits(['refresh']);
const currentIndex = ref(0);
const list = ref<Entity[]>([]);
const appId = ref(0);
const visible = ref(false);

const columns = ref<TableColumn[]>([
	{
		title: '字段标识',
		slotName: 'name'
	},
	{
		title: '字段备注',
		slotName: 'comment'
	},
	{
		title: '操作',
		slotName: 'operations',
		fixed: 'right',
		width: 80
	}
]);

const handleSelect = (val: number) => {
	currentIndex.value = val;
};

const handleDelete = (index: number) => {
	list.value[currentIndex.value].fields?.splice(index, 1);
};

const handleDeleteEntity = (index: number) => {
	list.value.splice(index, 1);
};

const handleSubmit = async () => {
	try {
		await ImportEntity({ list: list.value, appId: appId.value });
		emit('refresh');
		return true;
	} catch (r) {
		return false;
	}
};

const show = (id: number, ls: Entity[]) => {
	visible.value = true;
	appId.value = id;
	list.value = ls;
};

defineExpose({
	show
});
</script>

<style lang="less" scoped>
.action {
	color: rgb(var(--primary-6));
}

.body {
	display: flex;
	height: 100%;
	flex-direction: row;
	.flex-1 {
		margin-left: 15px;
		flex: 1;
	}
	.item {
		flex: 1;
		height: 100%;
		overflow: scroll;
		border-radius: 4px;
		background: var(--color-bg-1);
		&::-webkit-scrollbar {
			display: none;
		}
	}
}

.rm-menu-padding {
	:deep(.arco-menu-vertical .arco-menu-inner) {
		padding: 0;
	}
	:deep(.arco-icon) {
		margin-right: 0px;
	}
	:deep(.arco-menu-icon) {
		margin-right: 5px;
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
