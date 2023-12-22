<template>
	<a-upload
		ref="uploadRef"
		class="upload"
		:list-type="(listType as ListType)"
		:custom-request="customRequest"
		:file-list="uploadedFileList"
		:show-upload-button="true"
		:show-file-list="true"
		:auto-upload="autoUpload"
		:draggable="draggable"
		image-preview
		:limit="limit"
		:multiple="multiple"
		:accept="accept"
		@change="uploadChange"
	>
		<template #upload-button>
			<div class="upload-card" :class="shape">
				<icon-camera v-if="accept == 'image/*'" class="icon" />
				<icon-plus v-else class="icon"></icon-plus>
				<span v-if="text" class="text">{{ text }}</span>
			</div>
		</template>
	</a-upload>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { ListType, type FileItem, type RequestOption } from '@arco-design/web-vue/es/upload/interfaces';
import { useAppStore } from '@/store';
import { prepareUpload, upload } from '@/api/resource/file';
import { PrepareUploadRes } from '@/api/resource/types/file';
import cryptoJs from 'crypto-js';
import { AxiosResponse } from 'axios';
import { formatUrl } from '@/utils/url';

const emit = defineEmits(['change']);
const appStore = useAppStore();

const props = defineProps({
	draggable: {
		type: Boolean,
		default: false
	},
	multiple: {
		type: Boolean,
		default: false
	},
	shape: {
		type: String,
		default: 'square'
	},
	size: {
		type: Number,
		default: 80
	},
	text: {
		type: String,
		default: '点击上传'
	},
	files: {
		type: Array,
		default: () => {
			return [];
		}
	},
	limit: {
		type: Number,
		default: 9
	},
	listType: {
		type: String,
		default: 'picture-card'
	},
	accept: {
		type: String,
		default: 'image/*'
	},
	directoryId: {
		type: Number,
		require: true
	},
	directoryPath: {
		type: String,
		require: true
	},
	app: {
		type: String,
		require: true
	},
	height: {
		type: String
	},
	width: {
		type: String
	},
	autoUpload: Boolean
});
const uploadRef = ref();
const uploadedFileList = ref<FileItem[]>([]);
const domWidth = ref(`${props.size}px`);
const domHeight = ref(`${props.size}px`);

if (props.width) {
	// eslint-disable-next-line vue/no-setup-props-destructure
	domWidth.value = props.width;
}
if (props.height) {
	// eslint-disable-next-line vue/no-setup-props-destructure
	domHeight.value = props.height;
}

const GetUploadList = (): FileItem[] => {
	return uploadedFileList.value;
};

const Upload = (): FileItem[] => {
	return uploadRef.value.submit();
};

const WaitUploadSuccess = () => {
	const isSuccess = () => {
		let success = true;
		let error = false;
		uploadedFileList.value.forEach((file: FileItem) => {
			if (file.status !== 'done') success = false;
			if (file.status === 'error') error = true;
		});
		return {
			success,
			error
		};
	};
	return new Promise<void>((resolve, reject) => {
		const timer = setInterval(() => {
			const res = isSuccess();
			if (res.success) {
				clearInterval(timer);
				resolve();
			}
			if (res.error) {
				clearInterval(timer);
				reject();
			}
		}, 1000);
	});
};

defineExpose({ GetUploadList, Upload, WaitUploadSuccess });

// init 组件初始化
const initFiles = () => {
	props.files.forEach((item: any) => {
		uploadedFileList.value.push({
			url: item.url,
			name: item.name,
			response: {
				src: item.url,
				sha: item.sha
			}
		} as FileItem);
	});
};

watch(
	() => props.files,
	() => {
		uploadedFileList.value = [];
		initFiles();
	},
	{
		deep: true,
		immediate: true
	}
);

// 上传修改触发
const uploadChange = (list: FileItem[], item: FileItem) => {
	if (item.status !== 'done') return;
	uploadedFileList.value = [];
	list.forEach((ite: FileItem) => {
		if (ite.status === 'done') uploadedFileList.value.push(ite);
	});
	emit('change', uploadedFileList.value);
};

function binaryToBase64(buffer: ArrayBuffer) {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i += 1) {
		binary += String.fromCharCode(bytes[i]);
	}
	return window.btoa(binary);
}

const readBinary = (file: File) => {
	return new Promise((resolve, reject) => {
		const fileReader = new FileReader();
		fileReader.onload = (e: ProgressEvent<FileReader>): void => {
			resolve(e.target?.result);
		};
		fileReader.onerror = (error) => {
			reject(error);
		};
		fileReader.readAsArrayBuffer(file);
	});
};

const getPrepareUploadReq = async (data: any, file: File) => {
	const wordArray = cryptoJs.lib.WordArray.create(data);
	const hash = cryptoJs.SHA256(wordArray).toString();
	return {
		directory_id: props.directoryId,
		directory_path: props.directoryPath,
		app: props.app as string,
		name: file.name,
		sha: hash,
		size: file.size
	};
};

const handleUpload = async (info: PrepareUploadRes, binary: ArrayBuffer, options: RequestOption) => {
	const { onProgress, onSuccess, onError, fileItem } = options;
	const count = info.chunk_count as number;
	const size = info.chunk_size as number;
	const pArrr: Promise<AxiosResponse<any, any>>[] = [];
	const uploaed = info.upload_chunks;
	if (count <= 1) {
		pArrr.push(
			upload({
				data: binaryToBase64(binary),
				upload_id: info.upload_id as string,
				index: 1
			})
		);
	} else {
		for (let i = 0; i < count; i += 1) {
			// eslint-disable-next-line no-continue
			if (uploaed.includes(i + 1)) continue;
			let data: ArrayBuffer = new ArrayBuffer(0);
			if ((i + 1) * size > binary.byteLength) {
				data = binary.slice(i * size, binary.byteLength);
			} else {
				data = binary.slice(i * size, (i + 1) * size);
			}
			pArrr.push(
				upload({
					data: binaryToBase64(data),
					upload_id: info.upload_id as string,
					index: i + 1
				})
			);
		}
	}
	pArrr.forEach((fn: Promise<AxiosResponse<any, any>>, index: number) => {
		fn
			.then((res) => {
				onProgress(Math.ceil((index + 1) / pArrr.length));
				if ((index + 1) / pArrr.length) {
					onSuccess(res);
					fileItem.url = formatUrl(res.data.src as string);
				}
			})
			.catch((res) => {
				onError(res);
			});
	});
};

const customRequest = (options: RequestOption) => {
	appStore.startLoading(' 上传中');
	const controller = new AbortController();
	(async function requestWrap() {
		const { onError, onSuccess, onProgress, fileItem } = options;
		try {
			onProgress(0);
			// 获取文件二进制数据
			const file = fileItem.file as File;
			const binary = (await readBinary(file)) as ArrayBuffer;

			// 进行预上传
			const params = await getPrepareUploadReq(binary, file);
			const { data } = await prepareUpload(params);
			// 触发秒传
			if (data.uploaded) {
				onProgress(100);
				onSuccess(data);
				fileItem.url = formatUrl(data.src as string);
			} else {
				// 处理上传逻辑
				await handleUpload(data, binary, options);
			}
		} catch (error) {
			onError(error);
		} finally {
			appStore.stopLoading();
		}
	})();

	return {
		abort() {
			controller.abort();
		}
	};
};
</script>

<style lang="less">
.upload {
	.arco-upload-list-picture {
		width: v-bind(domwidth);
		height: v-bind(domheight);
		line-height: v-bind(domheight);
	}

	.arco-upload-list-picture-mask {
		line-height: v-bind(domheight);
	}
}
</style>

<style scoped lang="less">
.upload-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
	width: v-bind(domwidth);
	height: v-bind(domheight);
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

.circle {
	border-radius: 50%;
}

.square {
	border-radius: 2px;
}
</style>
