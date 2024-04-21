<template>
	<div @click="visible = true"><slot></slot></div>

	<a-modal v-model:visible="visible" :title="title" width="300px" :footer="false" @cancel="visible = false">
		<div class="btn">
			<a-upload action="/" accept=".xls,.xlsx" :disabled="disabled" :auto-upload="false" :show-file-list="false" @change="handleChange">
				<template #upload-button>
					<div class="upload-card">
						<icon-plus class="icon"></icon-plus>
						<span class="text">点击上传</span>
					</div>
				</template>
			</a-upload>
			<div class="tip">
				<span class="desc">导入文件格式必须是xls/xlsx格式，在导入之前可以先下载下方模板进行填写数据。</span>
				<span class="href" @click="exportTable">下载导入模板</span>
			</div>
		</div>
	</a-modal>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import * as XLSX from 'xlsx';

interface config {
	field: string;
	type: string;
	title: string;
}

const props = withDefaults(
	defineProps<{
		title?: string;
		skipLine?: number; // 是否必传
		configs: config[];
		disabled?: boolean;
		handlers?: Record<string, (any) => any>;
	}>(),
	{
		title: '导入数据',
		skipLine: 0,
		disabled: false
	}
);

const visible = ref(false);
const emit = defineEmits(['success', 'error']);

const exportTable = () => {
	const list: string[] = [];
	props.configs.forEach((item) => {
		list.push(item.title);
	});
	const data = ref([list]);
	const worksheet = XLSX.utils.aoa_to_sheet(data.value);
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
	XLSX.writeFile(workbook, 'template.xlsx');
};

const readFile = (file: File) => {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.readAsBinaryString(file);
		reader.onload = (ev) => {
			resolve(ev.target?.result);
		};
	});
};

const transfromVal = (type: string, val: any) => {
	switch (type) {
		case 'string':
			return String(val);
		case 'number':
			return Number(val);
		default:
			return val;
	}
};

const handleChange = async (_, info) => {
	const dataBinary = await readFile(info.file);
	const workBook = XLSX.read(dataBinary, { type: 'binary', cellDates: true });
	const workSheet = workBook.Sheets[workBook.SheetNames[0]];
	const data = XLSX.utils.sheet_to_json(workSheet, { header: 1, range: props.skipLine });

	// 第一行是标题映射
	if (data.length <= 1) {
		emit('error', '文件数据为空');
		return;
	}

	const set: Record<string, { type: string; field: string }> = {};
	props.configs.forEach((item) => {
		set[item.title] = {
			type: item.type,
			field: item.field
		};
	});

	// eslint-disable-next-line no-shadow
	const mapping: Record<string, { type: string; index: number }> = {};
	const columns: string[] = [];
	const header = data.shift() as [];
	header.forEach((title, ind) => {
		if (set[title]) {
			const { field } = set[title];
			mapping[field] = {
				type: set[title].type,
				index: ind
			};
			columns.push(field);
		}
	});

	if (columns.length !== Object.keys(mapping).length) {
		emit('error', '文件列数据映射失败');
		return;
	}

	const result: any[] = [];
	data.forEach((item: any) => {
		const temp: any = {};
		columns.forEach((column) => {
			const { index, type } = mapping[column];
			temp[column] = transfromVal(type, item[index]);
			if (props.handlers && props.handlers[column]) {
				temp[column] = props.handlers[column](temp[column]);
			}
		});
		result.push(temp);
	});
	emit('success', result);
};
</script>

<style lang="less" scoped>
.btn {
	display: flex;
	justify-content: space-between;

	.upload-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		width: 100px;
		height: 100px;
		margin-right: 10px;
		background-color: #f4f5f7;
		border-radius: 2px;

		.text {
			margin-top: 10px;
			color: #999;
			font-size: 12px;
		}

		.icon {
			top: 0;
			color: rgb(211 212 214);
			font-weight: normal;
			font-size: 22px;
			line-height: 22px;
		}

		&:hover {
			background-color: #f1f1f1;
		}
	}

	.tip {
		display: flex;
		flex: 1;
		flex-direction: column;
		justify-content: space-between;
		font-size: 12px;

		.desc {
			color: var(--color-text-2);
		}

		.href {
			display: inline-flex;
			align-items: center;
			padding: 1px 4px;
			color: rgb(var(--link-6));
			line-height: 1.5715;
			text-decoration: none;
			background-color: transparent;
			border-radius: var(--border-radius-small);
			cursor: pointer;
			transition: all 0.1s cubic-bezier(0, 0, 1, 1);
		}
	}
}
</style>
