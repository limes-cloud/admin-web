<template>
	<a-row style="align-items: center; margin-bottom: 16px">
		<a-col :span="12">
			<a-space>
				<a-button v-permission="'application:user:add'" type="primary" @click="emit('add')">
					<template #icon>
						<icon-plus />
					</template>
					新建用户
				</a-button>
				<Xlsx :configs="xlsxMapping" :handlers="xlsxHandlers" @success="handleXlsxUploadSuccess" @error="handleXlsxUploadError">
					<a-button v-permission="'application:user:import'" type="primary">
						<template #icon>
							<icon-upload />
						</template>
						导入用户
					</a-button>
				</Xlsx>
			</a-space>
		</a-col>

		<a-col :span="12" class="tool">
			<a-tooltip content="刷新">
				<div class="action-icon" @click="emit('refresh')"><icon-refresh size="18" /></div>
			</a-tooltip>
			<a-dropdown @select="handleSelectDensity">
				<a-tooltip content="字体大小">
					<div class="action-icon"><icon-line-height size="18" /></div>
				</a-tooltip>
				<template #content>
					<a-doption v-for="(val, key) in $densityList" :key="key" :value="key" :class="{ active: key === size }">
						<span>{{ val }}</span>
					</a-doption>
				</template>
			</a-dropdown>
			<a-tooltip content="行设置">
				<a-popover trigger="click" position="bl" @popup-visible-change="popupVisibleChange">
					<div class="action-icon"><icon-settings size="18" /></div>
					<template #content>
						<div id="tableSetting">
							<div v-for="(item, index) in showColumns" :key="item.dataIndex" class="setting">
								<div style="margin-right: 4px; cursor: move">
									<icon-drag-arrow />
								</div>
								<div>
									<a-checkbox v-model="item.checked" @change="handleChange($event, item as TableColumnData, index)"></a-checkbox>
								</div>
								<div class="title">
									{{ item.title === '#' ? 'index' : item.title }}
								</div>
							</div>
						</div>
					</template>
				</a-popover>
			</a-tooltip>
		</a-col>
	</a-row>
</template>

<script lang="ts" setup>
import { ImportUser } from '@/api/application/user/api';
import { TableColumn, TableSize } from '@/types/global';
import { Message, TableColumnData } from '@arco-design/web-vue';
import { cloneDeep } from 'lodash';
import Sortable from 'sortablejs';
import { nextTick, ref } from 'vue';

// 定义属性
const props = defineProps<{
	columns: TableColumn[];
	size: TableSize;
}>();

const xlsxMapping = [
	{ type: 'string', field: 'email', title: '邮箱' },
	{ type: 'string', field: 'phone', title: '手机' },
	{ type: 'string', field: 'realName', title: '姓名' },
	{ type: 'string', field: 'gender', title: '性别' }
];

const xlsxHandlers = {
	gender: (val: string): string => {
		return val.trim() === '男' ? 'M' : 'F';
	}
};

// 定义事件
const emit = defineEmits(['update:size', 'update:columns', 'add', 'refresh', 'extra']);
const cloneColumns = ref<TableColumn[]>([]);
const showColumns = ref<TableColumn[]>([]);

// 修改表格字体大小
const handleSelectDensity = (val: string | number | Record<string, any> | undefined) => {
	emit('update:size', val);
};

const initColmun = (val: TableColumn[]) => {
	cloneColumns.value = cloneDeep(val);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	cloneColumns.value.forEach((item, index) => {
		item.checked = true;
	});
	showColumns.value = cloneDeep(cloneColumns.value);
};

initColmun(props.columns);

const exchangeArray = <T extends Array<any>>(array: T, beforeIdx: number, newIdx: number, isDeep = false): T => {
	const newArray = isDeep ? cloneDeep(array) : array;
	if (beforeIdx > -1 && newIdx > -1) {
		// 先替换后面的，然后拿到替换的结果替换前面的
		newArray.splice(beforeIdx, 1, newArray.splice(newIdx, 1, newArray[beforeIdx]).pop());
	}
	return newArray;
};

const popupVisibleChange = (val: boolean) => {
	if (val) {
		nextTick(() => {
			const el = document.getElementById('tableSetting') as HTMLElement;
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const sortable = new Sortable(el, {
				onEnd(e: any) {
					const { oldIndex, newIndex } = e;
					exchangeArray(cloneColumns.value, oldIndex, newIndex);
					exchangeArray(showColumns.value, oldIndex, newIndex);
					emit('update:columns', cloneColumns.value);
				}
			});
		});
	}
};

const handleChange = (checked: boolean | (string | boolean | number)[], column: TableColumn, index: number) => {
	if (!checked) {
		cloneColumns.value = showColumns.value.filter((item) => item.checked);
	} else {
		cloneColumns.value.splice(index, 0, column);
	}
	emit('update:columns', cloneColumns.value);
};

const handleXlsxUploadSuccess = async (list) => {
	await ImportUser({ list });
	Message.success('导入成功');
	emit('refresh');
};

const handleXlsxUploadError = (msg: string) => {
	Message.error(msg);
};
</script>

<style lang="less" scoped>
.tool {
	display: flex;
	flex: 1;
	align-items: center;
	justify-content: end;
}
</style>
