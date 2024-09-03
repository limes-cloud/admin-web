<script lang="ts" setup>
import { computed, onMounted, onUnmounted } from 'vue';

import cryptoJs from 'crypto-js';

import tinymce from 'tinymce/tinymce'; // tinymce核心文件
import Editor from '@tinymce/tinymce-vue';
import { PrepareUploadFile, UploadFile } from '@/api/resource/file/api';
import 'tinymce/models/dom'; // 引入dom模块。从 tinymce6，开始必须有此模块导入
import 'tinymce/themes/silver'; // 默认主题
import 'tinymce/icons/default'; // 引入编辑器图标icon，不引入则不显示对应图标
import './zh-Hans'; // 引入编辑器语言包

/* 引入编辑器插件
 * 位于 ./node_modules/tinymce/plugins 目录下，版本不同，插件会有所差异。根据自己版本来导入，若不存在的，不能导入，会报错。
 */
import 'tinymce/plugins/advlist'; // 高级列表
import 'tinymce/plugins/anchor'; // 锚点
import 'tinymce/plugins/autolink'; // 自动链接
import 'tinymce/plugins/autoresize'; // 编辑器高度自适应,注：plugins里引入此插件时，Init里设置的height将失效
import 'tinymce/plugins/autosave'; // 自动存稿
import 'tinymce/plugins/charmap'; // 特殊字符
import 'tinymce/plugins/code'; // 编辑源码
import 'tinymce/plugins/codesample'; // 代码示例
import 'tinymce/plugins/directionality'; // 文字方向
import 'tinymce/plugins/emoticons'; // 表情
import 'tinymce/plugins/fullscreen'; // 全屏
import 'tinymce/plugins/help'; // 帮助
import 'tinymce/plugins/image'; // 插入编辑图片
import 'tinymce/plugins/importcss'; // 引入css
import 'tinymce/plugins/insertdatetime'; // 插入日期时间
import 'tinymce/plugins/link'; // 超链接
import 'tinymce/plugins/lists'; // 列表插件
import 'tinymce/plugins/media'; // 插入编辑媒体
import 'tinymce/plugins/nonbreaking'; // 插入不间断空格
import 'tinymce/plugins/pagebreak'; // 插入分页符
import 'tinymce/plugins/preview'; // 预览
import 'tinymce/plugins/quickbars'; // 快速工具栏
import 'tinymce/plugins/save'; // 保存
import 'tinymce/plugins/searchreplace'; // 查找替换
import 'tinymce/plugins/table'; // 表格
import 'tinymce/plugins/template'; // 内容模板
import 'tinymce/plugins/visualblocks'; // 显示元素范围
import 'tinymce/plugins/visualchars'; // 显示不可见字符
import 'tinymce/plugins/wordcount'; // 字数统计
import { PrepareUploadFileReply } from '@/api/resource/file/type';
import { AxiosResponse } from 'axios';
import { useAppStore } from '@/store';

const appStore = useAppStore();

const props = defineProps({
	modelValue: {
		type: String,
		required: true,
		default: ''
	},
	menubar: {
		type: [Boolean, String],
		default: 'file edit insert view format table tools help'
	},

	height: {
		type: Number,
		default: 500
	},
	id: {
		type: [String, Number],
		default: 'mytinymce'
	},
	uploadPath: {
		type: String,
		default: '/tinymec'
	}
});
const imageHost = ref('');

const emit = defineEmits(['update:modelValue']);

const contentValue = computed({
	get() {
		return props.modelValue;
	},
	set(value) {
		emit('update:modelValue', value);
	}
});

const initOptions = {
	language: 'zh-Hans', // 汉化
	skin_url: '/tinymce/skins/ui/oxide', // 皮肤
	content_style:
		'body{font-size:14px;border-radis:3px;font-family:Microsoft YaHei,微软雅黑,宋体,Arial,Helvetica,sans-serif;line-height:1.5}img {max-width:100%;}',
	height: props.height,
	menubar: 'file edit view insert format tools table help',
	promotion: false,
	menu: {
		file: {
			title: 'File',
			items: 'newdocument | preview | export | deleteallconversations'
		},
		edit: {
			title: 'Edit',
			items: 'undo redo restoredraft | cut copy | selectall | searchreplace'
		},
		view: {
			title: 'View',
			items: 'code | visualaid visualchars visualblocks | preview fullscreen | showcomments'
		},
		insert: {
			title: 'Insert',
			items:
				'image link media addcomment pageembed template codesample inserttable | charmap emoticons | pagebreak nonbreaking anchor tableofcontents | insertdatetime'
		},
		format: {
			title: 'Format',
			items:
				'bold italic underline strikethrough superscript subscript codeformat | styles blocks fontfamily fontsize align lineheight | forecolor backcolor | language | removeformat'
		},
		tools: { title: 'Tools', items: 'a11ycheck code wordcount' },
		table: {
			title: 'Table',
			items: 'inserttable | cell row column | advtablesort | tableprops deletetable'
		},
		help: { title: 'Help', items: 'help' }
	},
	toolbar:
		'fullscreen | code forecolor backcolor bold italic underline strikethrough link anchor | alignleft aligncenter alignright alignjustify outdent indent  lineheight | styleselect formatselect fontselect fontsizeselect | bullist numlist | blockquote subscript superscript removeformat | table image media | indent2em formatpainter axupimgs',
	plugins:
		'code codesample preview searchreplace autolink directionality visualblocks visualchars fullscreen image link media template table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount autosave ',
	line_height_formats: '1 1.2 1.4 1.6 2', // 行高
	font_size_formats: '12px 14px 16px 18px 20px 22px 24px 28px 32px 36px 48px 56px 72px', // 字体大小
	font_family_formats:
		'微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;宋体=simsun,serif;仿宋体=FangSong,serif;黑体=SimHei,sans-serif;Arial=arial,helvetica,sans-serif;Arial Black=arial black,avant garde;Book Antiqua=book antiqua,palatino;',
	// 如需ajax上传可参考https://www.luweipai.cn/html/1670332196/
	images_file_types: 'jpeg,jpg,png,gif,bmp',
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	images_upload_handler: async (blobInfo, progress) => {
		const getUrlHost = (url: string): string => {
			try {
				const urlObj = new URL(url);
				return urlObj.host;
			} catch (error) {
				return '';
			}
		};

		// 读取二进制数据
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

		// 获取预上传参数
		const getPrepareUploadReq = async (data: any, file: File) => {
			const wordArray = cryptoJs.lib.WordArray.create(data);
			const hash = cryptoJs.MD5(wordArray).toString();
			const { name } = file;
			return {
				directoryPath: props.uploadPath,
				name,
				sha: hash,
				size: Math.ceil(file.size / 1024)
			};
		};

		// 执行上传
		const handleUpload = (info: PrepareUploadFileReply, binary: ArrayBuffer) => {
			return new Promise((resolve, reject) => {
				const count = info.chunkCount as number;
				const size = (info.chunkSize as number) * 1024;
				const pArrr: Promise<AxiosResponse<any, any>>[] = [];
				const uploaed = info.uploadChunks;
				if (count <= 1) {
					const formData = new FormData();
					formData.append('data', new Blob([binary]));
					formData.append('uploadId', info.uploadId as string);
					formData.append('index', String(1));
					pArrr.push(UploadFile(formData));
				} else {
					for (let i = 0; i < count; i += 1) {
						// eslint-disable-next-line no-continue
						if (uploaed && uploaed.includes(i + 1)) continue;
						let data: ArrayBuffer = new ArrayBuffer(0);
						if ((i + 1) * size > binary.byteLength) {
							data = binary.slice(i * size, binary.byteLength);
						} else {
							data = binary.slice(i * size, (i + 1) * size);
						}

						const formData = new FormData();
						formData.append('data', new Blob([data]));
						formData.append('uploadId', info.uploadId as string);
						formData.append('index', String(i + 1));
						pArrr.push(UploadFile(formData));
					}
				}
				pArrr.forEach((fn: Promise<AxiosResponse<any, any>>, index: number) => {
					fn
						.then((res) => {
							progress(Math.ceil((index + 1) / pArrr.length));
							if ((index + 1) / pArrr.length) {
								resolve(res.data.url);
							}
						})
						.catch((res) => {
							reject(res);
						});
				});
			});
		};

		return new Promise((resolve, reject) => {
			// eslint-disable-next-line no-shadow
			const handler = async (resolve, reject) => {
				try {
					appStore.startLoading('图片上传中～');
					progress(0);
					// 获取文件二进制数据
					const file = blobInfo.blob() as File;
					const binary = (await readBinary(file)) as ArrayBuffer;

					// 进行预上传
					const params = await getPrepareUploadReq(binary, file);
					const { data } = await PrepareUploadFile(params);
					// 触发秒传
					if (data.uploaded) {
						imageHost.value = getUrlHost(data.url as string);
						progress(100);
						resolve(data.url);
					} else {
						// 处理上传逻辑
						const url = await handleUpload(data, binary);
						imageHost.value = getUrlHost(url as string);

						resolve(url);
					}
				} catch (error) {
					reject(error);
				} finally {
					appStore.stopLoading();
				}
			};
			handler(resolve, reject);
		});
	},
	placeholder: '在这里输入内容',
	branding: false, // tiny技术支持信息是否显示
	statusbar: false, // 最下方的元素路径和字数统计那一栏是否显示
	elementpath: false, // 元素路径是否显示
	custom_undo_redo_levels: 10, // 撤销和重做的次数
	draggable_modal: true, // 对话框允许拖拽
	setup(editor) {
		editor.on('NodeChange', (e) => {
			if (e.element.nodeName.toLowerCase() === 'img') {
				// 检查图片是否有自定义属性
				const src = e.element.getAttribute('src');
				if (src.indexOf(imageHost.value) !== -1) {
					const arr = src.split('/');
					const filename = arr[arr.length - 1];
					const tmp = filename.split('.');
					const md5 = tmp[0];
					e.element.setAttribute('data-origin', 'resource');
					e.element.setAttribute('data-md5', md5);
				}
			}
		});
	}
};

onMounted(async () => {
	tinymce.init({}); // 初始化
});
onUnmounted(() => {
	tinymce.remove(); // 销毁
});
</script>

<template>
	<div class="tinymce-box">
		<Editor :id="props.id" v-model="contentValue" :init="initOptions" />
	</div>
</template>

<style scoped>
.tinymce-box {
	width: 100%;
}
</style>
