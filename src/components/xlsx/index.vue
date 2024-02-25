<template>
	<a-upload action="/" accept=".xls,.xlsx" :disabled="disabled" :auto-upload="false" :show-file-list="false" @change="handleChange">
		<template #upload-button>
			<slot></slot>
		</template>
	</a-upload>
</template>

<script lang="ts" setup>
import * as XLSX from 'xlsx';

const props = withDefaults(
	defineProps<{
		skipLine?: number; // 是否必传
		mapping: Record<string, { field: string; type: string }>;
		disabled?: boolean;
		handlers?: Record<string, (any) => any>;
	}>(),
	{
		skipLine: 0,
		disabled: false,
		handlers: {} as Record<string, (any) => any>
	}
);

const emit = defineEmits(['success', 'error']);

const readFile = (file: File) => {
	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.readAsBinaryString(file);
		reader.onload = (ev) => {
			resolve(ev.target.result);
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

	const mapping = {};
	const columns = [];
	const header = data.shift();
	header.forEach((title, ind) => {
		if (props.mapping[title]) {
			const { field } = props.mapping[title];
			mapping[field] = {
				type: props.mapping[title].type,
				index: ind
			};
			columns.push(field);
		}
	});

	if (columns.length !== Object.keys(mapping).length) {
		emit('error', '文件列数据映射失败');
		return;
	}

	const result = [];
	data.forEach((item) => {
		const temp = {};
		columns.forEach((column) => {
			const { index, type } = mapping[column];
			temp[column] = transfromVal(type, item[index]);
			if (props.handlers[column]) {
				temp[column] = props.handlers[column](temp[column]);
			}
		});
		result.push(temp);
	});
	emit('success', result);
};
</script>
